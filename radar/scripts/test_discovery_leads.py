import json
from pathlib import Path
import tempfile
import unittest

from ingest_discovery_leads import ingest


class LeadTests(unittest.TestCase):
    def test_same_resource_across_two_posts_merges_without_publishing_it(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            row = {'source_url': 'https://twitter.com/author/status/123?s=20',
                   'resource_url': 'https://github.com/owner/repo/tree/main', 'query': 'learning skill'}
            ingest(root, [row], 1)
            ingest(root, [row | {'source_url': 'https://x.com/other/status/456'}], 1)
            rows = [json.loads(x) for x in (root/'data/discovery-leads.jsonl').read_text().splitlines()]
            self.assertEqual(len(rows), 1)
            self.assertEqual(len(rows[0]['provenance']), 2)
            self.assertEqual(rows[0]['status'], 'needs-source-verification')
            self.assertFalse((root/'data/registry.jsonl').exists())

    def test_zero_qualifying_results_does_not_claim_native_coverage(self):
        with tempfile.TemporaryDirectory() as directory:
            health = ingest(Path(directory), [], 6)
            self.assertEqual(health['status'], 'limited')
            self.assertEqual(health['new_leads'], 0)
            self.assertIsNone(health['last_success'])

    def test_invalid_later_row_does_not_partially_overwrite_prior_leads(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            ingest(root, [], 1)
            path = root/'data/discovery-leads.jsonl'
            before = path.read_bytes()
            row = {'source_url': 'https://x.com/author/status/123', 'query': 'research'}
            for bad in ['https://blog.x.com/post', 'https://x.com/search', 'http://x.com/u/status/1']:
                with self.assertRaises(ValueError):
                    ingest(root, [row, row | {'source_url': bad}], 2)
            self.assertEqual(path.read_bytes(), before)


if __name__ == '__main__':
    unittest.main()
