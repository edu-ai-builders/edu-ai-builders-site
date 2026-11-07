import argparse
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import crawl


def seed(lead_id):
    return {'lead_id': lead_id, 'full_name': 'owner/repo', 'label': 'repo',
            'source': 'editorial', 'kind_hint': 'repo'}


def repo():
    return {'id': 1, 'name': 'repo', 'full_name': 'owner/repo',
            'html_url': 'https://github.com/owner/repo', 'description': 'Learning app',
            'default_branch': 'main', 'stargazers_count': 7}


class Client:
    def __init__(self, responses):
        self.responses = iter(responses)

    def request_json(self, path):
        response = next(self.responses)
        if isinstance(response, Exception):
            raise response
        return response, {}, 200


class SeedFailureTests(unittest.TestCase):
    def run_seeds(self, root, seeds, records, responses):
        seed_path = root/'seeds.json'
        seed_path.write_text(json.dumps(seeds))
        registry = crawl.Registry(root/'registry.jsonl')
        registry.records = {row['record_key']: row for row in records}
        args = argparse.Namespace(seeds=seed_path, only=None, limit=None, summary_only=True)
        with patch.object(crawl, 'utc_now', return_value='2026-11-06T12:00:00Z'):
            result = crawl.command_seed(args, registry, Client(responses))
        return result, crawl.Registry(registry.path).records

    def old_record(self):
        return crawl.record_from_repo(repo(), now='2026-01-01T00:00:00Z', languages=None,
            languages_status='pending', release=None, release_status='pending', kind_hint=None)

    def test_resolved_seed_failure_preserves_verified_evidence(self):
        with tempfile.TemporaryDirectory() as directory:
            result, records = self.run_seeds(Path(directory), [seed('first')],
                [self.old_record()], [OSError('offline')])
        self.assertEqual(len(result['errors']), 1)
        self.assertEqual(list(records), ['repo:1'])
        row = records['repo:1']
        self.assertEqual(row['verification_status'], 'verified')
        self.assertEqual(row['fetched_at'], '2026-01-01T00:00:00Z')
        self.assertEqual(row['last_check_status'], 'error')
        self.assertEqual(row['last_error'], 'offline')
        self.assertEqual(row['metrics']['stars'], 7)

    def test_duplicate_alias_failure_updates_the_current_canonical_record(self):
        fresh = {**repo(), 'stargazers_count': 9}
        with tempfile.TemporaryDirectory() as directory:
            result, records = self.run_seeds(Path(directory), [seed('first'), seed('second')],
                [self.old_record()], [fresh, OSError('second request offline')])
        self.assertEqual(result['verified'], 1)
        self.assertEqual(len(result['errors']), 1)
        self.assertEqual(list(records), ['repo:1'])
        row = records['repo:1']
        self.assertEqual(row['metrics']['stars'], 9)
        self.assertEqual(row['last_error'], 'second request offline')
        self.assertEqual({p['lead_id'] for p in row['provenance']}, {'first', 'second'})

    def test_new_seed_failure_remains_a_tracked_unverified_lead(self):
        with tempfile.TemporaryDirectory() as directory:
            result, records = self.run_seeds(Path(directory), [seed('first')], [], [OSError('offline')])
        self.assertEqual(len(result['errors']), 1)
        row = records['lead:first']
        self.assertEqual(row['verification_status'], 'error')
        self.assertIsNone(row['fetched_at'])
        self.assertEqual(row['last_check_status'], 'error')


if __name__ == '__main__':
    unittest.main()
