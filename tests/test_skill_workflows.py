"""Behavioral invariants for portable skill helpers; task quality has separate forward tests."""
import copy
import hashlib
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def module(name, file):
    spec = importlib.util.spec_from_file_location(name, file)
    loaded = importlib.util.module_from_spec(spec); spec.loader.exec_module(loaded)
    return loaded

repo = module('repo_evidence', ROOT/'packages/builder-skills/edu-repo-adapter/scripts/repo_evidence.py')
fusion = module('fusion_provenance', ROOT/'packages/builder-skills/edu-skill-fusion/scripts/fusion_provenance.py')

packager=module("skill_packager",ROOT/"scripts/package-builder-skills.py")

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

class WorkflowHelpers(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='edu-skill-test-')
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.source = self.root/'source'; self.source.mkdir()
        self.code = self.source/'compare.py'; self.code.write_text('def compare(a, b):\n    return a == b\n')
        self.package = self.root/'generated'; self.package.mkdir()
        (self.package/'SKILL.md').write_text('---\nname: test-workflow\ndescription: Plan a specific workflow.\n---\nDo the bounded task.\n')
        self.handoff = {'schema_version':'edu.repo-handoff.v1','mode':'refactor','capabilities':[
            {'requirement':'retain comparison','decision':'reuse','reason':'exact public behavior is available',
             'evidence':[{'type':'source-observation','repository':'source','path':'compare.py','sha256':sha(self.code),'line_start':1,'line_end':2,'quote':'return a == b'}],
             'retained':['public signature and results'],'changed':[],'unknowns':[], 'acceptance':['same inputs have same results']}],
            'verification':[{'method':'public comparison','status':'not-run'}]}
        self.record = {'schema_version':'edu.fusion-record.v1','readiness':'draft','workload':{
            'purpose':'plan a specific learning flow','trigger':'recurring product plan','exclusions':['general tutoring'],
            'inputs':['goal'],'outputs':['brief'],'constraints':[{'id':'R1','level':'hard','requirement':'at most two candidates'}],
            'precedence':['user requirements before source defaults']},
            'sources':[{'id':'source','version':'1.0.0','state':'full-method','files':[{'path':'compare.py','sha256':sha(self.code)}],
                        'reuse':{'permission':'redistributable','scope':'authored test code'}}],
            'decisions':[{'id':'D1','source_id':'source','method':'comparison','decision':'transform','requirement_ids':['R1'],
                          'reason':'bound the comparison to workload requirements','targets':['SKILL.md']}],
            'conflicts':[], 'acceptance_cases':[{'id':'C1','kind':'normal','prompt':'plan my flow','expected_behaviors':['two candidates maximum'],'status':'not-run'}],
            'upstream_map':[{'source_id':'source','decision_ids':['D1'],'review_when':'comparison method changes'}]}

    def check_fusion(self, record=None):
        return fusion.check(record or self.record, self.package, {'source':self.source})

    def test_inventory_binds_utf8_bytes_and_literal_queries(self):
        (self.source/'中文.py').write_text('问题 = "先尝试，再提示"\n')
        result = repo.inventory(self.source, ['compare','提示'])
        self.assertEqual(len(result['files']),2)
        row = next(r for r in result['files'] if r['path']=='compare.py')
        self.assertEqual(row['sha256'],sha(self.code)); self.assertEqual(row['matches'][0]['line'],1)
        self.assertFalse(result['runtime_tested']); self.assertTrue(result['coverage']['enumeration_complete'])

    def test_literal_search_does_not_interpret_regex(self):
        result=repo.inventory(self.source,['a.*b'])
        self.assertFalse(any(r['matches'] for r in result['files']))

    def test_file_budget_applies_to_skipped_binary_files(self):
        (self.source/'a.bin').write_bytes(b'\x00'*100)
        result=repo.inventory(self.source,['compare'],max_files=1)
        self.assertFalse(result['coverage']['enumeration_complete'])
        self.assertEqual(result['coverage']['stop_reason'],'max-files')
        self.assertFalse(result['files'])

    def test_match_truncation_does_not_claim_complete_negative_search(self):
        self.code.write_text('hint\nhint\nhint\n')
        result=repo.inventory(self.source,['hint'],max_matches=1)
        self.assertEqual(sum(len(r['matches']) for r in result['files']),1)
        self.assertFalse(result['coverage']['matches_complete'])

    def test_byte_budget_and_large_file_exclusion_are_explicit(self):
        (self.source/'a.txt').write_text('x'*50)
        result=repo.inventory(self.source,max_file_bytes=30)
        self.assertTrue(any(r['reason']=='max-file-bytes' for r in result['skipped']))
        result=repo.inventory(self.source,max_bytes=1)
        self.assertFalse(result['coverage']['enumeration_complete'])

    def test_symlink_dependency_and_parent_path_are_not_read(self):
        outside=self.root/'external.txt'; outside.write_text('private external data')
        (self.source/'link').symlink_to(outside)
        (self.source/'node_modules').mkdir(); (self.source/'node_modules/large.js').write_text('compare')
        result=repo.inventory(self.source,['private','compare'])
        self.assertEqual([r['path'] for r in result['files']],['compare.py'])
        with self.assertRaises(ValueError):repo.inventory(self.source,paths=['../external.txt'])
        self.assertTrue(result['skipped'])

    def test_handoff_requires_matching_hash_quote_and_lines(self):
        self.assertEqual(repo.verify(self.handoff,{'source':self.source}),[])
        for field,value in [('sha256','0'*64),('quote','a fictional result'),('line_start',0),('path','../external.txt'),('repository','unknown')]:
            changed=copy.deepcopy(self.handoff);changed['capabilities'][0]['evidence'][0][field]=value
            with self.subTest(field=field):self.assertTrue(repo.verify(changed,{'source':self.source}))

    def test_source_mutation_invalidates_old_handoff(self):
        self.code.write_text('def compare(a, b):\n    return a != b\n')
        self.assertTrue(repo.verify(self.handoff,{'source':self.source}))

    def test_unresolved_capability_cannot_receive_fake_runtime_success(self):
        changed=copy.deepcopy(self.handoff);changed['capabilities'][0]['decision']='unresolved';changed['capabilities'][0]['evidence']=[]
        self.assertEqual(repo.verify(changed,{'source':self.source}),[])
        changed['verification']=[{'method':'integration','status':'passed'}]
        self.assertTrue(repo.verify(changed,{'source':self.source}))

    def test_valid_fusion_record_is_distinct_from_task_performance(self):
        errors,drift=self.check_fusion();self.assertEqual(errors,[]);self.assertEqual(drift,[])

    def test_summary_or_unknown_permission_cannot_be_redistributed(self):
        for field,value in [('state','metadata-only'),('reuse',{'permission':'unknown','scope':'unverified'})]:
            changed=copy.deepcopy(self.record);changed['sources'][0][field]=value
            with self.subTest(field=field):self.assertTrue(self.check_fusion(changed)[0])
        changed=copy.deepcopy(self.record);changed['sources'][0]['state']='metadata-only';changed['decisions'][0]['decision']='reference';changed['upstream_map']=[]
        self.assertEqual(self.check_fusion(changed),([],[]))

    def test_delegation_requires_availability_and_fallback(self):
        changed=copy.deepcopy(self.record);changed['decisions'][0]['decision']='delegate'
        self.assertTrue(self.check_fusion(changed)[0])
        changed['decisions'][0].update(condition='only with actual extractor',fallback='use author-provided plain text')
        self.assertEqual(self.check_fusion(changed),([],[]))

    def test_drift_identifies_affected_decisions(self):
        self.code.write_text('new source method\n')
        errors,drift=self.check_fusion();self.assertEqual(errors,[])
        self.assertEqual(drift,[{'source_id':'source','path':'compare.py','affected_decision_ids':['D1']}])

    def test_requirements_upstream_and_target_links_resolve(self):
        changes=[('requirement_ids',['missing']),('targets',['../source/compare.py']),('targets',['missing.md'])]
        for field,value in changes:
            changed=copy.deepcopy(self.record);changed['decisions'][0][field]=value
            with self.subTest(field=field):self.assertTrue(self.check_fusion(changed)[0])
        changed=copy.deepcopy(self.record);changed['upstream_map']=[];self.assertTrue(self.check_fusion(changed)[0])
        (self.package/'SKILL.md').write_text('---\nname: sample\ndescription: Sample.\n---\n[Missing](references/missing.md)')
        self.assertTrue(self.check_fusion()[0])

    def test_unresolved_conflicts_and_unobserved_tests_are_not_marked_ready(self):
        changed=copy.deepcopy(self.record);changed['conflicts']=[{'status':'unresolved','resolution':'ask which requirement wins'}];changed['readiness']='usable'
        self.assertTrue(self.check_fusion(changed)[0])
        changed=copy.deepcopy(self.record);changed['acceptance_cases'][0]['status']='passed'
        self.assertTrue(self.check_fusion(changed)[0])

    def test_malformed_records_return_diagnostics_not_tracebacks(self):
        for value in [[],None,{'schema_version':'wrong'}]:
            with self.subTest(value=value):self.assertTrue(fusion.check(value,self.package,{})[0])
        for field,value in [('requirement_ids',[{}]),('source_id',{}),('targets',[{}])]:
            changed=copy.deepcopy(self.record);changed['decisions'][0][field]=value
            with self.subTest(field=field):self.assertTrue(self.check_fusion(changed)[0])

    def test_missing_source_and_read_reference_drift_are_reported(self):
        self.code.unlink()
        self.assertTrue(self.check_fusion()[0])
        self.assertTrue(repo.verify(self.handoff,{'source':self.source}))

    def test_malformed_nested_source_and_case_records_do_not_crash(self):
        mutations=[('sources',[{'id':'source','state':{},'files':[]}]),('decisions',[{'id':'bad','decision':[]}]),('conflicts',[{'status':[]}]),('acceptance_cases',[{'status':[]}]),('upstream_map',[{'source_id':{}}])]
        for field,value in mutations:
            changed=copy.deepcopy(self.record);changed[field]=value
            with self.subTest(field=field):self.assertTrue(self.check_fusion(changed)[0])
        changed=copy.deepcopy(self.handoff);changed['mode']=[]
        self.assertTrue(repo.verify(changed,{'source':self.source}))
        changed=copy.deepcopy(self.handoff);changed['capabilities'][0]['evidence'][0]['repository']={}
        self.assertTrue(repo.verify(changed,{'source':self.source}))

    def test_walkthrough_result_requires_actual_artifact(self):
        changed=copy.deepcopy(self.record)
        changed['acceptance_cases'][0].update(status='passed',method='walkthrough',observed_result='two candidates recorded',result_path='checks/task.md')
        self.assertTrue(self.check_fusion(changed)[0])
        (self.package/'checks').mkdir();(self.package/'checks/task.md').write_text('Actual bounded example with two candidates.')
        self.assertEqual(self.check_fusion(changed),([],[]))

    def test_non_utf8_file_is_excluded_without_inventing_text(self):
        (self.source/'a.txt').write_bytes(b'\xff\xfe')
        result=repo.inventory(self.source,['compare'])
        self.assertEqual([r['path'] for r in result['files']],['compare.py'])
        self.assertTrue(any(r['reason']=='UnicodeDecodeError' for r in result['skipped']))

    def test_zero_budget_is_rejected(self):
        with self.assertRaises(ValueError):repo.inventory(self.source,max_files=0)

    def test_fusion_target_symlinks_cannot_escape_package(self):
        (self.package/'escape.md').symlink_to(self.code)
        changed=copy.deepcopy(self.record);changed['decisions'][0]['targets']=['escape.md']
        self.assertTrue(self.check_fusion(changed)[0])

    def test_runtime_tested_cannot_be_claimed_with_only_planned_checks(self):
        changed=copy.deepcopy(self.handoff);changed["runtime_tested"]=True
        self.assertTrue(repo.verify(changed,{"source":self.source}))

    def test_zip_excludes_cache_and_is_reproducible_after_file_touch(self):
        (self.package/'LICENSE').write_text('First-party test terms')
        (self.package/'__pycache__').mkdir();(self.package/'__pycache__/generated.pyc').write_bytes(b'cache')
        one=self.root/'one.zip';two=self.root/'two.zip'
        packager.package(self.package,one)
        (self.package/'SKILL.md').touch()
        packager.package(self.package,two)
        self.assertEqual(one.read_bytes(),two.read_bytes())
        with zipfile.ZipFile(one) as archive:
            self.assertFalse(any('__pycache__' in name or name.endswith('.pyc') for name in archive.namelist()))
            self.assertIn('generated/SKILL.md',archive.namelist())

    def test_zip_rejects_external_symlinks(self):
        (self.package/'LICENSE').write_text('First-party test terms')
        (self.package/'outside.md').symlink_to(self.code)
        with self.assertRaises(ValueError):packager.package(self.package,self.root/'unsafe.zip')

    def test_unversioned_source_can_be_bound_by_hash_without_inventing_release(self):
        changed=copy.deepcopy(self.record);changed["sources"][0]["version"]=None
        self.assertEqual(self.check_fusion(changed),([],[]))
        del changed["sources"][0]["version"]
        self.assertTrue(self.check_fusion(changed)[0])

    def test_cli_runs_outside_website_without_dependencies(self):
        handoff=self.root/'handoff.json';handoff.write_text(json.dumps(self.handoff))
        result=subprocess.run([sys.executable,str(ROOT/'packages/builder-skills/edu-repo-adapter/scripts/repo_evidence.py'),'verify',str(handoff),'--repo',f'source={self.source}'],cwd=self.root,text=True,capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr);self.assertTrue(json.loads(result.stdout)['valid'])
        record=self.root/'record.json';record.write_text(json.dumps(self.record))
        result=subprocess.run([sys.executable,str(ROOT/'packages/builder-skills/edu-skill-fusion/scripts/fusion_provenance.py'),str(record),'--package',str(self.package),'--source',f'source={self.source}'],cwd=self.root,text=True,capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr);self.assertTrue(json.loads(result.stdout)['valid'])

if __name__=='__main__':unittest.main(verbosity=2)
