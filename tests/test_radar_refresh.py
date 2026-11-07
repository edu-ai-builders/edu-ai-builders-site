import importlib.util
from pathlib import Path
import unittest
import tempfile
from unittest.mock import patch
import argparse

spec = importlib.util.spec_from_file_location('directory_sync', Path(__file__).resolve().parents[1]/'scripts/sync-directory.py')
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)

class DirectoryExportTests(unittest.TestCase):
    def item(self, status='include'):
        return {'resource_id':'repo:1','kind':'knowledge','artifact_kind':'knowledge','title':'Open textbook',
                'description':'An open textbook','source_url':'https://github.com/o/book','verified_at':'2026-07-01T00:00:00Z',
                'review':{'status':status,'reasons':['stable-material'],'evidence_level':'metadata'},
                'facet_hints':{},'reuse_status':'needs-review'}

    def build(self, rows, previous=None):
        return sync.build_catalog({'generated_at':'2026-11-06T00:00:00Z','records':rows},
            [{'github_repo_id':1,'full_name':'o/book','verification_status':'verified','archived':True}],[],
            previous or {'records':[]},'2026-11-06T01:00:00Z')

    def test_newer_successful_observation_survives_reclassification(self):
        previous={'records':[{'id':'repo:1','kind':'dataset','title':'Book','stars':50,'checkedAt':'2026-09-22T00:00:00Z'}]}
        result=self.build([self.item()],previous)
        row=result['records'][0]
        self.assertEqual(row['kind'],'knowledge')
        self.assertEqual(row['stars'],50)
        self.assertEqual(row['checkedAt'],'2026-09-22T00:00:00Z')
        self.assertEqual(row['refreshStatus'],'not-refreshed')
        self.assertEqual(result['summary']['refreshed'],0)

    def test_excluded_rows_are_hidden_and_candidates_remain_identifiable(self):
        self.assertEqual(self.build([self.item('exclude')])['records'],[])
        review=self.build([self.item('review')])
        self.assertEqual(review['summary']['needsReview'],1)
        self.assertEqual(review['records'][0]['review']['status'],'review')
        self.assertTrue(review['records'][0]['archived'])

    def test_no_unsafe_url_can_escape_previous_or_current_evidence(self):
        previous={'records':[{'id':'repo:1','url':'javascript:bad','homepage':'https://u:p@example.com','checkedAt':'2026-10-01'}]}
        row=self.build([self.item()],previous)['records'][0]
        self.assertIsNone(row['url'])
        self.assertIsNone(row['homepage'])
        for value in ['https://x.example/a','http://x.example/']:
            self.assertEqual(sync.safe_url(value),value)
        for value in ['file:///etc/passwd','https://x.example/ with space','https://[']:
            self.assertIsNone(sync.safe_url(value))

    def test_newer_skill_observation_keeps_coherent_version_evidence(self):
        item=self.item();item.update(resource_id='github-skill:1:SKILL.md',kind='skill',artifact_kind='skill',pinned_commit='a'*40)
        previous={'records':[{'id':item['resource_id'],'url':'https://github.com/o/r/blob/main/SKILL.md',
                             'sourceUrl':'https://github.com/o/r/blob/main/SKILL.md', 'manifestSha':'c'*40,'checkedAt':'2026-09-22'}]}
        result=sync.build_catalog({'generated_at':'2026-11-06','records':[item]},[],
            [{'skill_key':item['resource_id'],'manifest_blob_sha':'b'*40,'source_repository':{'full_name':'o/r'}}],previous,'2026-11-06')
        row=result['records'][0]
        self.assertEqual(row['url'],row['sourceUrl'])
        self.assertEqual(row['manifestSha'],'c'*40)
        self.assertIsNone(row['pinnedCommit'])

    def test_failed_collection_does_not_replace_the_website_snapshot(self):
        spec = importlib.util.spec_from_file_location('directory_refresh', Path(__file__).resolve().parents[1]/'scripts/refresh-directory.py')
        refresh = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(refresh)
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            (root/'radar/state').mkdir(parents=True)
            old=root/'public/data/radar/catalog.json'
            old.parent.mkdir(parents=True)
            old.write_text('{"lastSuccessful":"kept"}')
            before=old.read_bytes()
            with patch.object(refresh,'ROOT',root), patch('sys.argv',['refresh-directory.py']), patch.object(refresh.subprocess,'run',return_value=argparse.Namespace(returncode=1)) as run:
                self.assertEqual(refresh.main(),1)
                self.assertEqual(run.call_count,1)
            self.assertEqual(old.read_bytes(),before)

    def test_duplicate_ids_fail_before_export(self):
        with self.assertRaises(ValueError):
            self.build([self.item(),self.item()])

if __name__ == '__main__':
    unittest.main()
