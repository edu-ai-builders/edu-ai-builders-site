"""Offline failure, provenance, rotation and budget checks for builder discovery."""
import base64
import json
import tempfile
import unittest
from pathlib import Path

import collect_builder_skills as builder
import crawl
import crawl_skills
import build_builder_index as index


class Client:
    def __init__(self, fail_search=False):
        self.paths = []
        self.fail_search = fail_search

    def request_json(self, path):
        self.paths.append(path)
        repo = {'id': 1, 'full_name': 'o/r', 'html_url': 'https://github.com/o/r',
                'url': 'https://api.github.com/repos/o/r', 'default_branch': 'main',
                'name': 'r', 'owner': {'login': 'o'}, 'license': {'spdx_id': 'MIT'}, 'private': False}
        if path == '/repos/o/r':
            result = repo
        elif '/commits/' in path:
            result = {'sha': 'a' * 40}
        elif '/git/trees/' in path:
            result = {'tree': [{'path': 'skills/one/SKILL.md', 'type': 'blob'},
                               {'path': 'skills/one/scripts/tool.py', 'type': 'blob'}]}
        elif '/contents/' in path:
            body = '---\nname: one\ndescription: |\n  Build a classroom tool\n---\nBODY_MUST_NOT_PERSIST\n'
            result = {'encoding': 'base64', 'content': base64.b64encode(body.encode()).decode(),
                      'sha': 'b' * 40, 'size': len(body)}
        elif '/search/code?' in path:
            if self.fail_search:
                raise crawl.GitHubAPIError(401, path, 'authentication required')
            result = {'items': [{'path': 'skills/one/SKILL.md', 'repository': repo}], 'incomplete_results': False}
        elif '/search/repositories?' in path:
            result = {'items': [repo]}
        else:
            raise AssertionError(path)
        return result, {}, 200


class BuilderTests(unittest.TestCase):
    def test_changed_query_revision_restarts_query_samples(self):
        with tempfile.TemporaryDirectory() as d:
            root = self.root(d)
            config = json.loads((root/'config/builder-discovery.json').read_text())
            config['query_revision'] = 'new'
            config['sources'] = []
            (root/'config/builder-discovery.json').write_text(json.dumps(config))
            (root/'state/builder-discovery.json').write_text(json.dumps({
                'query_revision': 'old', 'query_cursor': 1, 'query_sample_offsets': {'q1': 6}, 'query_pages': {'q1': 3}}))
            result = builder.collect(root, Client(), query_count=1)
            self.assertEqual(result['queries'][0]['query_id'], 'q1')
            state = json.loads((root/'state/builder-discovery.json').read_text())
            self.assertEqual(state['query_revision'], 'new')
            self.assertEqual(state['query_cursor'], 1)
            self.assertNotEqual(state['query_sample_offsets'].get('q1'), 6)

    def root(self, directory):
        root = Path(directory)
        for name in ('data', 'config', 'state'):
            (root/name).mkdir()
        config = {'families': [], 'sources': [{'source_id': 's', 'repository': 'o/r', 'skill_root': 'skills',
                               'platforms': ['web']}],
                  'queries': [{'query_id': 'q1', 'kind': 'skill', 'query': 'filename:SKILL.md lesson',
                               'audiences': ['teachers']},
                              {'query_id': 'q2', 'kind': 'repo', 'query': 'learning', 'subjects': ['science']}]}
        (root/'config/builder-discovery.json').write_text(json.dumps(config))
        (root/'data/skills.jsonl').write_text('')
        (root/'data/registry.jsonl').write_text('')
        return root

    def test_metadata_only_pinning_dedup_and_source_hints(self):
        with tempfile.TemporaryDirectory() as d:
            root = self.root(d)
            result = builder.collect(root, Client(), query_count=2)
            self.assertEqual(result['new_skills'], 1)
            self.assertEqual(result['refreshed'], 1)
            raw = (root/'data/skills.jsonl').read_text()
            self.assertNotIn('BODY_MUST_NOT_PERSIST', raw)
            row = json.loads(raw)
            self.assertEqual(row['description'], 'Build a classroom tool')
            self.assertIn('/' + 'a' * 40 + '/', row['manifest_url'])
            self.assertTrue(row['resource_hints']['scripts'])
            self.assertEqual(row['builder_discovery_hints']['audiences'], ['teachers'])
            self.assertEqual(row['builder_discovery_hints']['platforms'], ['web'])
            self.assertEqual(row['compatibility_confidence'], 'inferred')
            saved = builder.collect(root, Client(), query_count=2)
            self.assertEqual(saved['new_skills'], 0)
            self.assertEqual(json.loads((root/'data/skills.jsonl').read_text())['first_seen'], row['first_seen'])

    def test_failed_search_retries_cursor_without_reverification(self):
        with tempfile.TemporaryDirectory() as d:
            root = self.root(d)
            builder.collect(root, Client(), query_count=2)
            config = json.loads((root/'config/builder-discovery.json').read_text())
            config['sources'] = []
            (root/'config/builder-discovery.json').write_text(json.dumps(config))
            state = json.loads((root/'state/builder-discovery.json').read_text())
            state['query_cursor'] = 0
            (root/'state/builder-discovery.json').write_text(json.dumps(state))
            # Disable rotating refresh to isolate a failed search, retain existing facts.
            old = json.loads((root/'data/skills.jsonl').read_text())
            old.pop('builder_discovery_hints')
            (root/'data/skills.jsonl').write_text(json.dumps(old) + '\n')
            result = builder.collect(root, Client(fail_search=True), query_count=2)
            self.assertEqual(result['status'], 'partial')
            self.assertEqual(result['next_query_cursor'], 0)
            self.assertEqual(json.loads((root/'data/skills.jsonl').read_text()), old)

    def test_budget_stops_at_limit_and_does_not_advance_unfinished_query(self):
        with tempfile.TemporaryDirectory() as d:
            root = self.root(d)
            client = Client()
            result = builder.collect(root, client, request_limit=1)
            self.assertEqual(len(client.paths), 1)
            self.assertEqual(result['api_requests'], 1)
            self.assertIn('budget_stop', result)
            self.assertEqual(result['next_query_cursor'], 0)
            self.assertEqual((root/'data/skills.jsonl').read_text(), '')

    def test_malformed_manifest_is_rejected_without_blocking_next_query(self):
        class MalformedClient(Client):
            def request_json(self, path):
                result, headers, status = super().request_json(path)
                if '/contents/' in path:
                    result['content'] = base64.b64encode(b'not a skill manifest').decode()
                return result, headers, status
        with tempfile.TemporaryDirectory() as d:
            root = self.root(d)
            config = json.loads((root/'config/builder-discovery.json').read_text())
            config['sources'] = []
            (root/'config/builder-discovery.json').write_text(json.dumps(config))
            result = builder.collect(root, MalformedClient(), query_count=2)
            self.assertEqual(result['next_query_cursor'], 2)
            self.assertEqual(result['queries'][-1]['status'], 'complete')
            self.assertTrue(any(e['stage'].startswith('rejected-item:') for e in result['errors']))
            self.assertEqual(result['new_skills'], 0)
            self.assertEqual((root/'data/skills.jsonl').read_text(), '')

    def test_existing_repo_hydrated_facts_are_not_erased(self):
        with tempfile.TemporaryDirectory() as d:
            root = self.root(d)
            row = {'record_key': 'repo:1', 'first_seen': '2020-01-01T00:00:00Z',
                   'languages': {'Python': 100}, 'languages_status': 'complete',
                   'latest_release': {'tag_name': 'v1'}, 'latest_release_status': 'complete',
                   'provenance': [], 'entity_kind': 'dataset'}
            (root/'data/registry.jsonl').write_text(json.dumps(row) + '\n')
            builder.collect(root, Client())
            new = json.loads((root/'data/registry.jsonl').read_text())
            for field in ('first_seen', 'languages', 'latest_release', 'entity_kind'):
                self.assertEqual(new[field], row[field])

    def test_bad_source_manifest_does_not_starve_the_next_path(self):
        class MixedClient(Client):
            def request_json(self, path):
                result, headers, status = super().request_json(path)
                if '/git/trees/' in path:
                    result['tree'].append({'path': 'skills/two/SKILL.md', 'type': 'blob'})
                if '/contents/skills/one/' in path:
                    result['content'] = base64.b64encode(b'bad manifest').decode()
                return result, headers, status
        with tempfile.TemporaryDirectory() as d:
            root = self.root(d)
            result = builder.collect(root, MixedClient(), query_count=0)
            self.assertEqual(result['new_skills'], 1)
            row = json.loads((root/'data/skills.jsonl').read_text())
            self.assertEqual(row['skill_path'], 'skills/two/SKILL.md')
            state = json.loads((root/'state/builder-discovery.json').read_text())
            self.assertEqual(state['source_offsets']['s'], 2)

    def test_removed_search_manifest_does_not_block_query_rotation(self):
        class RemovedClient(Client):
            def request_json(self, path):
                if '/contents/' in path:
                    raise crawl.GitHubAPIError(404, path, 'removed')
                return super().request_json(path)
        with tempfile.TemporaryDirectory() as d:
            root = self.root(d)
            config = json.loads((root/'config/builder-discovery.json').read_text())
            config['sources'] = []
            (root/'config/builder-discovery.json').write_text(json.dumps(config))
            result = builder.collect(root, RemovedClient(), query_count=2)
            self.assertEqual(result['next_query_cursor'], 2)
            self.assertTrue(any(e['stage'].startswith('removed-item:') for e in result['errors']))

    def test_rotation_and_block_description(self):
        self.assertEqual(builder.rotated(['a', 'b', 'c'], 2, 2), ['c', 'a'])
        self.assertEqual(crawl_skills.parse_frontmatter('---\nname: a\ndescription: >-\n  Hello\n  world\n---\nbody'), ('a', 'Hello world'))

    def test_search_synonyms_facets_and_no_false_word_substrings(self):
        self.assertFalse(index.keyword_match('startup department', 'art'))
        config = {'families': [{'id': 'science', 'keywords': ['science', '科学']}]}
        row = {'resource_id': 'r', 'title': 'Science tutor', 'description': '', 'topics': [],
               'curated': False, 'facet_hints': {'platforms': ['web']}}
        payload = {'records': [row], 'note': 'discovery hints'}
        self.assertEqual(index.search(payload, config, '科学', filters={'platforms': 'web'})['matched_count'], 1)
        self.assertEqual(index.search(payload, config, '科学', filters={'platforms': 'android'})['matched_count'], 0)
        self.assertEqual(index.search(payload, config)['model_calls'], 0)

    def test_index_excludes_unresolved_leads_and_exports_consistent_ids(self):
        with tempfile.TemporaryDirectory() as d:
            root = self.root(d)
            (root/'web/data').mkdir(parents=True)
            config = json.loads((root/'config/builder-discovery.json').read_text())
            config['families'] = []
            (root/'config/builder-discovery.json').write_text(json.dumps(config))
            (root/'data/education-resources.json').write_text('{"resources": []}')
            rows = [{'github_repo_id': None, 'full_name': None, 'name': 'unknown'},
                    {'github_repo_id': None, 'full_name': None, 'name': 'ambiguous'},
                    {'github_repo_id': 1, 'full_name': 'o/r', 'entity_kind': 'repo',
                     'html_url': 'https://github.com/o/r'}]
            canonical = [{**row, 'record_key': f'candidate:{i}', 'verification_status': 'verified'}
                         for i, row in enumerate(rows)]
            (root/'data/registry.jsonl').write_text(''.join(json.dumps(row) + '\n' for row in canonical))
            (root/'web/data/skills.json').write_text('{"records": []}')
            payload = index.build(root)
            self.assertEqual([r['resource_id'] for r in payload['records']], ['repo:1'])
            self.assertEqual(len({(root/f'{f}/builder-index.json').read_bytes()
                                 for f in ('data', 'site/data', 'web/data')}), 1)

    def test_curated_skill_is_in_unified_index_even_when_not_in_public_shelf(self):
        with tempfile.TemporaryDirectory() as d:
            root = self.root(d)
            builder.collect(root, Client(), query_count=0)
            (root/'web/data').mkdir(parents=True)
            key = json.loads((root/'data/skills.jsonl').read_text())['skill_key']
            (root/'data/education-resources.json').write_text(json.dumps({'resources':[{'resource_key':key}]}))
            (root/'web/data/registry.json').write_text('{"records":[]}')
            (root/'web/data/skills.json').write_text('{"records":[]}')
            payload = index.build(root)
            row = next(r for r in payload['records'] if r['resource_id'] == key)
            self.assertTrue(row['curated'])


if __name__ == '__main__':
    unittest.main()
