"""Resource shapes and public facets must follow evidence, not discovery queries."""
import json
import tempfile
import unittest
from pathlib import Path

import crawl
import build_builder_index as index


class TaxonomyTests(unittest.TestCase):
    def test_dataset_query_does_not_turn_apps_into_data(self):
        samples = [
            {'name': 'chamilo-lms', 'description': 'Chamilo is a learning management system'},
            {'name': 'OATutor', 'description': 'Open Source Intelligent Tutoring System w/ BKT'},
            {'name': 'Artemis', 'description': 'Interactive Learning with Automated Feedback'},
        ]
        for sample in samples:
            with self.subTest(name=sample['name']):
                self.assertEqual(crawl.infer_kind(sample, 'dataset'), 'repo')
                self.assertEqual(crawl.infer_kind({**sample, 'entity_kind': 'dataset'}, 'dataset'), 'repo')

    def test_explicit_shapes_win_over_query_hints(self):
        self.assertEqual(crawl.infer_kind({'name': 'awesome-education'}, 'dataset'), 'awesome_index')
        self.assertEqual(crawl.infer_kind({'name': 'public-apis', 'description': 'A collective list of free APIs', 'topics': ['dataset']}, 'dataset'), 'awesome_index')
        self.assertEqual(crawl.infer_kind({'name': 'tutor-benchmark'}, 'dataset'), 'benchmark')
        self.assertEqual(crawl.infer_kind({'name': 'student-dataset'}, 'benchmark'), 'dataset')
        self.assertEqual(crawl.infer_kind({'name': 'loader', 'description': 'A library for loading educational datasets'}, 'dataset'), 'repo')

    def test_knowledge_and_libraries_are_distinct_reusable_artifacts(self):
        self.assertEqual(crawl.classify_resource({'name': 'the-art-of-debugging', 'description': 'The Art of Debugging Open Book'})['kind'], 'knowledge')
        self.assertEqual(crawl.classify_resource({'name': 'math-course', 'description': 'Open calculus lessons'})['artifact_kind'], 'knowledge')
        self.assertEqual(crawl.classify_resource({'name': 'graph', 'description': 'Python library for educational knowledge graphs'})['artifact_kind'], 'library')
        self.assertEqual(crawl.classify_resource({'name': 'unclear'})['artifact_kind'], 'repository')

    def test_curated_data_and_course_evidence_survives_sparse_metadata(self):
        data = crawl.classify_resource({'name': 'grade-school-math'}, {'resource_key': 'repo:1', 'kind': 'dataset'})
        self.assertEqual(data['kind'], 'dataset')
        course = crawl.classify_resource({'name': 'smol'}, {'resource_key': 'repo:2', 'kind': 'repo', 'quick_start': {'mode': 'course'}})
        self.assertEqual(course['kind'], 'knowledge')
        self.assertEqual(course['classification_evidence'], ['curated:repo:2:quick_start.mode'])

    def test_canonical_candidates_have_no_query_or_word_derived_confirmed_facets(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root/'data').mkdir()
            (root/'config').mkdir()
            (root/'config/builder-discovery.json').write_text(json.dumps({'families': [
                {'id': 'languages', 'keywords': ['writing'], 'subjects': ['languages']},
                {'id': 'arts', 'keywords': ['art'], 'subjects': ['arts']},
                {'id': 'humanities', 'keywords': ['history'], 'subjects': ['humanities']},
            ]}))
            rows = [
                {'record_key': 'repo:1', 'github_repo_id': 1, 'verification_status': 'verified',
                 'full_name': 'stas00/the-art-of-debugging', 'name': 'the-art-of-debugging',
                 'description': 'The Art of Debugging Open Book', 'html_url': 'https://github.com/stas00/the-art-of-debugging',
                 'builder_discovery_hints': {'subjects': ['mathematics', 'arts']}, 'fetched_at': '2026-10-01T00:00:00Z'},
                {'record_key': 'repo:2', 'github_repo_id': 2, 'verification_status': 'verified',
                 'full_name': 'xdevplatform/xurl', 'name': 'xurl', 'description': 'The official CLI for the X API',
                 'html_url': 'https://github.com/xdevplatform/xurl', 'builder_discovery_hints': {'subjects': ['humanities']}},
            ]
            (root/'data/registry.jsonl').write_text(''.join(json.dumps(r)+'\n' for r in rows))
            skill = {'skill_key': 'github-skill:3:SKILL.md', 'verification_status': 'verified',
                     'skill_name': 'vercel-react-best-practices', 'description': 'Use when writing React code',
                     'manifest_url': 'https://github.com/vercel-labs/agent-skills/blob/main/SKILL.md',
                     'source_repository': {'full_name': 'vercel-labs/agent-skills', 'html_url': 'https://github.com/vercel-labs/agent-skills'},
                     'builder_discovery_hints': {'subjects': ['languages'], 'platforms': ['ios', 'android'], 'capabilities': ['offline']}}
            (root/'data/skills.jsonl').write_text(json.dumps(skill)+'\n')
            (root/'data/education-resources.json').write_text(json.dumps({'resources': [
                {'resource_key': 'repo:1', 'education_scenarios': ['software-debugging'], 'kind': 'repo'}]}))
            payload = index.build(root)
            self.assertEqual(len(payload['records']), 3)
            for row in payload['records']:
                self.assertEqual(row['facet_hints']['subjects'], [])
                self.assertEqual(row['facet_hints']['platforms'], [])
                self.assertEqual(row['facet_hints']['capabilities'], [])
                self.assertTrue(row['discovery_hints'])
                self.assertIsNone(row['runtime_tested'])
                self.assertIn(row['review']['status'], {'include', 'review', 'exclude'})
            book = next(r for r in payload['records'] if r['resource_id'] == 'repo:1')
            self.assertEqual(book['verified_at'], rows[0]['fetched_at'])
            self.assertEqual(book['kind'], 'knowledge')
            self.assertEqual(book['facet_hints']['scenarios'], ['software-debugging'])
            self.assertEqual(len({(root/f'{folder}/builder-index.json').read_bytes() for folder in ('data', 'site/data', 'web/data')}), 1)


if __name__ == '__main__':
    unittest.main()
