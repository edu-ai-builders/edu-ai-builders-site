"""Offline checks for resource identity, reuse guards, export and process locking."""
import copy
import fcntl
import json
import subprocess
import sys
import tempfile
import unittest
import contextlib
import io
import argparse
from pathlib import Path
from unittest.mock import patch

import update_directory as updater
import build_site


class DirectoryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.resources = json.loads((updater.ROOT/'data/education-resources.json').read_text())['resources']

    def test_repository_is_not_demo(self):
        with self.assertRaises(ValueError):
            updater.experience(self.resources[0], {'demo':{'url':'https://github.com/a/b'}}, {})

    def test_unavailable_demo_falls_back_to_setup(self):
        settings={'demo':{'url':'https://example.org/trial','access':'public-preview','declaration_source':'https://example.org/docs'}}
        with patch.object(updater.urllib.request,'urlopen',side_effect=OSError('offline')):
            result=updater.experience(self.resources[0],settings,{})
        self.assertEqual(result['demo_status'],'unavailable')
        self.assertEqual(result['primary_action']['kind'],'read-setup')
        self.assertFalse(result['demo_verification']['generation_tested'])

    def test_unverified_demo_action_rejected(self):
        row=copy.deepcopy(self.resources[0]);row['primary_action']={'kind':'demo','url':row['source_url']}
        with self.assertRaisesRegex(ValueError,'demo'):
            updater.validate([row])

    def test_duplicate_identity_rejected(self):
        with self.assertRaisesRegex(ValueError, 'duplicate'):
            updater.validate([self.resources[0], self.resources[0]])

    def test_unverified_license_cannot_be_unrestricted(self):
        resource = copy.deepcopy(next(r for r in self.resources if r['reuse_status']=='license-observed'))
        resource['license_scopes'][0]['verified'] = False
        with self.assertRaisesRegex(ValueError, 'unverified license'):
            updater.validate([resource])

    def test_component_licenses_are_preserved(self):
        scienceqa = next(r for r in self.resources if r['id']=='scienceqa')
        self.assertEqual(scienceqa['reuse_status'], 'restricted')
        self.assertEqual({s['covers']: s['label'] for s in scienceqa['license_scopes']},
                         {'code':'MIT', 'data':'CC-BY-NC-SA-4.0'})
        restricted = next(r for r in self.resources if r['id']=='anthropic-pdf-reference')
        self.assertEqual(restricted['reuse_status'], 'link-only' if all(scope['verified'] for scope in restricted['license_scopes']) else 'needs-review')
        self.assertEqual(restricted['license_scopes'][0]['label'], 'LicenseRef-Anthropic-Services')
        self.assertNotIn('description', restricted)
        self.assertNotIn('instruction_body', restricted)

    def test_export_identical_metadata_to_consumers(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(updater, 'ROOT', Path(directory)):
            updater.export(self.resources)
            paths = ['data/education-resources.json', 'site/data/education-resources.json', 'web/data/education-resources.json']
            self.assertEqual(len({(Path(directory)/p).read_bytes() for p in paths}), 1)
            feeds = ['data/discovery-feed.json', 'site/data/discovery-feed.json', 'web/data/discovery-feed.json']
            self.assertEqual(len({(Path(directory)/p).read_bytes() for p in feeds}), 1)

    def test_busy_lock_blocks_without_writing(self):
        path = updater.ROOT/'state/directory-update.lock'
        path.parent.mkdir(parents=True, exist_ok=True)
        before = (updater.ROOT/'data/education-resources.json').read_bytes()
        with path.open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            result = subprocess.run([sys.executable, str(updater.ROOT/'scripts/update_directory.py'), '--offline'],
                                    capture_output=True, text=True)
        self.assertEqual(result.returncode, 2)
        self.assertEqual(before, (updater.ROOT/'data/education-resources.json').read_bytes())

    def test_changed_license_stays_unverified_until_review(self):
        item = {'license_scopes': [{'path':'LICENSE', 'covers':'code', 'label':'MIT', 'marker':'MIT License'}]}
        evidence = [{'path':'LICENSE', 'sha256':'new-hash'}]
        previous = {'license_scopes':[{'path':'LICENSE', 'covers':'code', 'sha256':'old-hash', 'verified':True}]}
        def observe(prior):
            return updater.license_observations(item, {'LICENSE':'MIT License'}, evidence, prior, 'https://github.com/o/r', 'commit')
        scopes = observe(previous)
        self.assertFalse(scopes[0]['verified'])
        self.assertFalse(observe({'license_scopes':scopes})[0]['verified'])
        item['license_scopes'][0]['reviewed_sha256'] = 'new-hash'
        self.assertTrue(observe({'license_scopes':scopes})[0]['verified'])

    def test_network_failure_retains_old_verification_and_history(self):
        resource = copy.deepcopy(self.resources[0])
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for path in ['data', 'config', 'state', 'site/data', 'web/data']:
                (root/path).mkdir(parents=True, exist_ok=True)
            (root/'data/registry.jsonl').write_text('')
            (root/'data/skills.jsonl').write_text('')
            (root/'data/education-resources.json').write_text(json.dumps({'resources':[resource]}))
            (root/'config/education-resources.json').write_text(json.dumps({'resources':[resource]}))
            with patch.object(updater, 'ROOT', root), patch.object(updater, 'gh_token', return_value=None), \
                 patch.object(updater.crawl, 'GitHubClient') as client, patch.object(updater.subprocess, 'run') as runner, \
                 contextlib.redirect_stdout(io.StringIO()):
                client.return_value.request_json.side_effect = RuntimeError('network unavailable')
                client.return_value.request_count = 0
                runner.return_value = subprocess.CompletedProcess([], 1, stdout='validation failure', stderr='')
                result = updater.refresh(argparse.Namespace(refresh_limit=0, discover=False))
            self.assertEqual(result, 1)
            saved = json.loads((root/'data/education-resources.json').read_text())['resources'][0]
            self.assertEqual(saved['last_verified_at'], resource['last_verified_at'])
            self.assertEqual(saved['refresh_status'], 'error')
            history = json.loads((root/'data/update-history.jsonl').read_text())
            self.assertEqual(history['status'], 'partial')
            self.assertFalse(history['public_snapshots_updated'])

    def test_unavailable_repo_is_retained_and_retryable_but_not_published(self):
        with tempfile.TemporaryDirectory() as directory:
            registry = updater.crawl.Registry(Path(directory)/'registry.jsonl')
            registry.records['repo:1'] = {'record_key':'repo:1', 'github_repo_id':1, 'full_name':'owner/education',
                'verification_status':'verified', 'checked_at':'2020-01-01T00:00:00Z',
                'first_seen':'2020-01-01T00:00:00Z', 'entity_kind':'repo', 'provenance':[{'lead_id':'course'}]}
            client = object()
            with patch.object(updater.crawl, 'hydrate_repo', side_effect=updater.crawl.GitHubAPIError(404, 'url', 'Not Found')) as hydrate:
                updater.crawl.command_refresh(argparse.Namespace(limit=1), registry, client)
                updater.crawl.command_refresh(argparse.Namespace(limit=1), registry, client)
                self.assertEqual(hydrate.call_count, 2)
            record = registry.records['repo:1']
            self.assertEqual(record['verification_status'], 'missing')
            self.assertEqual(record['first_seen'], '2020-01-01T00:00:00Z')
            self.assertFalse(build_site.is_public_radar_record(record))
            with patch.object(updater.crawl, 'hydrate_repo', return_value=None):
                updater.crawl.command_refresh(argparse.Namespace(limit=1), registry, client)
            self.assertEqual(record['verification_status'], 'verified')
            self.assertNotIn('last_error', record)
            self.assertTrue(build_site.is_public_radar_record(record))


if __name__ == '__main__':
    unittest.main()
