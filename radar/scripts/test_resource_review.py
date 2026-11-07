import copy
import unittest

from review_resources import load_policy, review_resource


class ResourceReviewTests(unittest.TestCase):
    def test_old_editorial_acceptance_and_changed_pinned_sources_need_review(self):
        policy = {'overrides': {'example/tool': {'status': 'include', 'reasons': ['reviewed-source'],
                    'reviewed_at': '2026-01-01', 'reviewed_commit': 'a'*40}}, 'editorial_review_days': 180}
        row = {'full_name': 'example/tool', 'description': 'Current learning tool', 'pinned_commit': 'a'*40}
        expired = review_resource(row, policy, '2026-11-06')
        self.assertEqual(expired['status'], 'review')
        self.assertIn('editorial-review-expired', expired['reasons'])
        changed = review_resource(row | {'pinned_commit': 'b'*40}, policy, '2026-01-02')
        self.assertEqual(changed['status'], 'review')
        self.assertIn('reviewed-source-version-changed', changed['reasons'])

    @classmethod
    def setUpClass(cls):
        cls.policy = load_policy()

    def review(self, row):
        return review_resource(row, self.policy, '2026-11-06')

    def test_old_and_archived_research_materials_remain_findable(self):
        for row in [
            {'full_name': 'example/ancient-corpus', 'description': 'Dataset for student dialogue research', 'pushed_at': '2015-01-01', 'archived': True},
            {'full_name': 'example/algebra-book', 'description': 'Open textbook for algebra', 'pushed_at': '2010-01-01'},
            {'full_name': 'example/tutor-eval', 'description': 'A tutoring benchmark', 'pushed_at': '2018-01-01'},
            {'full_name': 'example/kg', 'description': 'Educational knowledge graph', 'pushed_at': '2018-01-01'},
        ]:
            with self.subTest(row=row):
                self.assertEqual('include', self.review(row)['status'])

    def test_archived_runtime_is_hidden_but_inactive_runtime_needs_review(self):
        row = {'full_name': 'example/classroom-app', 'description': 'Classroom application for a course', 'artifact_kind': 'application', 'pushed_at': '2020-01-01'}
        self.assertEqual('review', self.review(row)['status'])
        self.assertEqual('exclude', self.review(row | {'archived': True})['status'])

    def test_research_admin_and_agent_building_are_in_scope(self):
        for description in ['Scientific experiment reproducibility tool', 'System administration and backup automation', 'React frontend component library', 'Skill catalog for agents', 'Train sparse autoencoders to interpret model features', 'Create algorithmic art in p5.js', '从内容制作幻灯片并生成图像', 'Autonomous runbook executor for Kubernetes operations']:
            self.assertEqual('include', self.review({'description': description, 'pushed_at': '2026-10-01'})['status'])

    def test_owner_names_and_discovery_labels_do_not_establish_scope(self):
        row = {'full_name': 'education-k12-owner/random-widget', 'description': 'Unspecified personal project', 'entity_kind': 'dataset', 'builder_discovery_hints': {'subjects': ['mathematics']}}
        self.assertEqual('review', self.review(row)['status'])

    def test_exact_primary_resources_and_unlicensed_resources_are_not_rejected(self):
        for name in ['HKUDS/DeepTutor', 'openai/plugins', 'openai/grade-school-math', 'THU-KEG/EDUKG']:
            self.assertEqual('include', self.review({'full_name': name, 'license_spdx': None})['status'])

    def test_confirmed_irrelevant_and_abandoned_samples_are_excluded(self):
        for name in ['imdhiru/backlinks', 'harshamv/Bangalore-startups-companies-list', 'judyess/K12', 'MarauderXtreme/video-game-radiostation-playlists']:
            review = self.review({'full_name': name})
            self.assertEqual('exclude', review['status'])
            self.assertTrue(review['evidence'])

    def test_skill_and_builder_record_identity_preserve_editorial_decision(self):
        for row in [
            {'skill_name': 'test', 'source_repository': {'full_name': 'openai/plugins'}},
            {'title': 'DeepTutor', 'repository_url': 'https://github.com/HKUDS/DeepTutor'},
        ]:
            self.assertEqual('include', self.review(row)['status'])

    def test_deprecated_catalog_requires_review_but_pinned_skill_is_retained(self):
        row = {'skill_key': 'github-skill:1103643573:skills/.curated/pdf/SKILL.md',
               'source_repository': {'full_name': 'openai/skills'},
               'manifest_url': 'https://github.com/openai/skills/blob/main/skills/.curated/pdf/SKILL.md'}
        self.assertEqual('review', self.review(row)['status'])
        row['manifest_url'] = row['manifest_url'].replace('/main/', '/' + 'a' * 40 + '/')
        result = self.review(row)
        self.assertEqual('include', result['status'])
        self.assertEqual('https://github.com/openai/plugins', result['replacement_url'])

    def test_missing_source_is_not_resurrected_by_an_override(self):
        self.assertEqual('exclude', self.review({'full_name': 'openai/skills', 'verification_status': 'missing'})['status'])

    def test_review_is_reproducible_non_mutating_and_accepts_empty_policy(self):
        row = {'description': 'A learning tool', 'topics': ['education'], 'pushed_at': '2026-10-01'}
        saved = copy.deepcopy(row)
        self.assertEqual(self.review(row), self.review(row))
        self.assertEqual(saved, row)
        self.assertEqual('review', review_resource(row, {}, '2026-11-06')['status'])
        self.assertIsNone(self.review(row)['reviewed_at'])


if __name__ == '__main__':
    unittest.main()
