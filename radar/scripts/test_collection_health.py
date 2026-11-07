"""Failure isolation across query kinds and per-record refresh failures."""
import argparse
import base64
import contextlib
import io
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import collect_builder_skills as builder
import crawl
import update_directory as updater
import test_builder_discovery as fixtures


class CollectionHealthTests(unittest.TestCase):
    def test_x_leads_require_bounded_github_verification_and_keep_failed_and_hf_leads_pending(self):
        with tempfile.TemporaryDirectory() as directory:
            root = fixtures.BuilderTests().root(directory)
            def lead(name, url):
                return {'lead_id': name, 'resource_url': url, 'provenance': [
                    {'source': 'x-web-index', 'source_url': 'https://x.com/author/status/123',
                     'discovered_at': '2026-11-01T00:00:00Z'}]}
            rows = [lead('good', 'https://github.com/o/r'), lead('bad', 'https://github.com/o/missing'),
                    lead('next', 'https://github.com/o/next'), lead('hf', 'https://huggingface.co/datasets/o/r')]
            (root/'data/discovery-leads.jsonl').write_text(''.join(json.dumps(row)+'\n' for row in rows))
            registry = crawl.Registry(root/'data/registry.jsonl')
            paths = []
            def api(path):
                paths.append(path)
                if path == '/repos/o/missing':
                    raise crawl.GitHubAPIError(404, path, 'not found')
                return fixtures.Client().request_json(path)[0]
            result = updater.hydrate_discovery_leads(root, registry, api, '2026-11-06T00:00:00Z')
            self.assertEqual(result['attempted'], 2)
            self.assertEqual(result['verified'], 1)
            self.assertEqual(result['pending_manual_review'], 1)
            self.assertEqual(paths, ['/repos/o/r', '/repos/o/missing'])
            progress = json.loads((root/'state/discovery-lead-progress.json').read_text())
            self.assertEqual(progress['good']['status'], 'verified')
            self.assertEqual(progress['bad']['status'], 'retry')
            self.assertNotIn('next', progress)
            self.assertNotIn('hf', progress)
            record = registry.records['repo:1']
            self.assertEqual(record['provenance'][0]['source_ref'], 'https://x.com/author/status/123')
            self.assertNotIn('builder_discovery_hints', record)
            self.assertNotIn('quality', record)

    def test_private_or_malformed_github_lead_does_not_advance_verification(self):
        with tempfile.TemporaryDirectory() as directory:
            root = fixtures.BuilderTests().root(directory)
            (root/'data/discovery-leads.jsonl').write_text(json.dumps({
                'lead_id': 'private', 'resource_url': 'https://github.com/o/r', 'provenance': []})+'\n')
            registry = crawl.Registry(root/'data/registry.jsonl')
            result = updater.hydrate_discovery_leads(root, registry,
                lambda path: {'id': 1, 'private': True, 'full_name': 'o/r', 'html_url': 'https://github.com/o/r'},
                '2026-11-06T00:00:00Z')
            self.assertEqual(result['verified'], 0)
            self.assertEqual(registry.records, {})
            progress = json.loads((root/'state/discovery-lead-progress.json').read_text())
            self.assertEqual(progress['private']['status'], 'retry')

    def test_code_search_auth_failure_does_not_starve_repo_search_or_advance_failed_cursor(self):
        with tempfile.TemporaryDirectory() as directory:
            root = fixtures.BuilderTests().root(directory)
            config = json.loads((root/'config/builder-discovery.json').read_text())
            config['sources'] = []
            (root/'config/builder-discovery.json').write_text(json.dumps(config))
            result = builder.collect(root, fixtures.Client(fail_search=True), query_count=8)
            self.assertEqual(result['status'], 'partial')
            self.assertEqual([(q['kind'], q['status']) for q in result['queries']],
                             [('skill', 'failed'), ('repo', 'complete')])
            self.assertEqual(result['query_cursors'], {'skill': 0, 'repo': 1})
            self.assertEqual(result['next_query_cursor'], 0)
            self.assertEqual(result['repository_observations'], 1)
            self.assertEqual(result['errors'][0]['http_status'], 401)
            retried = builder.collect(root, fixtures.Client(), query_count=2)
            self.assertEqual(retried['queries'][0]['query_id'], 'q1')
            self.assertEqual(retried['queries'][0]['status'], 'complete')
            self.assertEqual(retried['query_cursors'], {'skill': 1, 'repo': 2})

    def test_failed_repo_lane_retries_while_skill_lane_progresses(self):
        class RepoFailure(fixtures.Client):
            def request_json(self, path):
                if '/search/repositories?' in path:
                    raise crawl.GitHubAPIError(403, path, 'permission denied')
                return super().request_json(path)
        with tempfile.TemporaryDirectory() as directory:
            root = fixtures.BuilderTests().root(directory)
            result = builder.collect(root, RepoFailure(), query_count=8)
            self.assertEqual(result['query_cursors'], {'skill': 1, 'repo': 0})
            self.assertEqual(result['new_skills'], 1)
            self.assertLessEqual(result['api_requests'], result['request_limit'])

    def test_a_404_resource_does_not_block_new_successfully_verified_metadata(self):
        class MetadataClient:
            def __init__(self, *args, **kwargs):
                self.request_count = 0

            def request_json(self, path):
                self.request_count += 1
                if path == '/repos/o/missing':
                    raise crawl.GitHubAPIError(404, path, 'not found')
                if path == '/repos/o/r':
                    result = {'id': 1, 'full_name': 'o/r', 'html_url': 'https://github.com/o/r',
                        'url': 'https://api.github.com/repos/o/r', 'name': 'r', 'owner': {'login': 'o'},
                        'default_branch': 'main', 'license': {'spdx_id': 'MIT'},
                        'pushed_at': '2026-11-06T00:00:00Z', 'updated_at': '2026-11-06T00:00:00Z',
                        'archived': False, 'stargazers_count': 1}
                elif '/commits/' in path:
                    result = {'sha': 'a'*40}
                elif '/contents/LICENSE?' in path:
                    result = {'encoding': 'base64', 'content': base64.b64encode(b'MIT License').decode()}
                else:
                    raise AssertionError(path)
                return result, {}, 200

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name in ('data', 'config', 'state', 'site/data', 'web/data'):
                (root/name).mkdir(parents=True, exist_ok=True)
            (root/'data/registry.jsonl').write_text('')
            (root/'data/skills.jsonl').write_text('')
            item = {'id': 'good', 'kind': 'repo', 'repository': 'o/r', 'title': 'Reusable tutor',
                'education_scenarios': ['learning'], 'evidence_paths': ['LICENSE'],
                'license_scopes': [{'path': 'LICENSE', 'covers': 'code', 'label': 'MIT', 'marker': 'MIT License'}]}
            (root/'config/education-resources.json').write_text(json.dumps({'resources': [
                item, {**item, 'id': 'missing', 'repository': 'o/missing'}]}))

            def run(args, **kwargs):
                if '--output' in args:
                    Path(args[args.index('--output') + 1]).write_text('{}')
                return subprocess.CompletedProcess(args, 0, stdout='', stderr='')

            with patch.object(updater, 'ROOT', root), patch.object(updater, 'gh_token', return_value='test'), \
                 patch.object(updater.crawl, 'GitHubClient', MetadataClient), patch.object(updater.subprocess, 'run', run), \
                 patch('build_discovery_feed.build'), patch('build_builder_index.build'), \
                 contextlib.redirect_stdout(io.StringIO()):
                result = updater.refresh(argparse.Namespace(refresh_limit=0, discover=False))
            saved = json.loads((root/'state/directory-last-run.json').read_text())
            self.assertEqual(result, 0)
            self.assertEqual(saved['status'], 'partial')
            self.assertTrue(saved['exportable'])
            self.assertFalse(saved['fatal'])
            self.assertGreater(saved['observed_successes'], 0)
            self.assertEqual(saved['resource_count'], 1)
            self.assertEqual(saved['errors'][0]['id'], 'missing')
            self.assertEqual(json.loads((root/'data/education-resources.json').read_text())['resources'][0]['id'], 'good')


if __name__ == '__main__':
    unittest.main()
