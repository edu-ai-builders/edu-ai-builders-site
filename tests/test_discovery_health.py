"""Observable freshness, failure and offline-export contracts (no network)."""
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'radar/scripts'))
import discovery_health as health


class DiscoveryHealthTests(unittest.TestCase):
    def summary(self, **changes):
        return {'run_id': 'one', 'finished_at': '2026-11-06T00:00:00Z',
                'status': 'complete', 'observed_successes': 1, 'new_observations': 0,
                'fatal': False, 'errors': [], **changes}

    def test_partial_resource_error_is_exportable_but_zero_observations_and_validation_failures_are_fatal(self):
        self.assertEqual(health.collection_status(2, [{'error': '404'}], False),
                         {'status': 'partial', 'fatal': False, 'exportable': True})
        self.assertTrue(health.collection_status(0, [], False)['fatal'])
        self.assertFalse(health.collection_status(10, [], True)['exportable'])

    def test_offline_export_does_not_manufacture_network_success(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            health.record_export(root, offline=True)
            saved = health.read(root/'state/discovery-health.json')
            self.assertNotIn('last_success_at', saved)
            self.assertNotIn('last_attempt_at', saved)
            self.assertEqual(saved['last_export_mode'], 'offline')
            result = health.evaluate(root)
            self.assertFalse(result['healthy'])
            self.assertEqual(result['sources']['x']['status'], 'not-configured')

    def test_failure_preserves_real_success_and_staleness_uses_network_time(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            health.record_attempt(root, self.summary(new_observations=3))
            health.record_attempt(root, self.summary(finished_at='2026-11-08T12:00:00Z',
                observed_successes=0, fatal=True, status='partial'))
            health.record_export(root, offline=True)
            result = health.evaluate(root, timestamp=datetime(2026, 11, 8, 12, tzinfo=timezone.utc))
            self.assertEqual(result['last_success_at'], '2026-11-06T00:00:00Z')
            self.assertEqual(result['last_new_observation_at'], '2026-11-06T00:00:00Z')
            self.assertEqual(result['last_attempt_at'], '2026-11-08T12:00:00Z')
            self.assertTrue(result['stale'])
            self.assertFalse(result['healthy'])
            self.assertEqual(result['status'], 'fatal')

    def test_unchanged_network_observation_is_success_and_x_web_index_is_limited(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            health.record_attempt(root, self.summary(builder_discovery={'queries': [
                {'kind': 'skill', 'status': 'failed'}, {'kind': 'repo', 'status': 'complete'}]}))
            (root/'state/x-discovery-health.json').write_text(json.dumps({
                'status': 'limited', 'coverage': 'web-index-partial', 'last_success_at': None}))
            result = health.evaluate(root, timestamp=datetime(2026, 11, 6, 1, tzinfo=timezone.utc))
            self.assertTrue(result['healthy'])
            self.assertNotIn('last_new_observation_at', result)
            self.assertFalse(result['coverage_complete'])
            self.assertEqual(result['sources']['x']['status'], 'limited')
            self.assertEqual(result['sources']['github']['search_capabilities']['skill'], 'failed')

    def test_interrupted_attempt_is_not_healthy_even_after_previous_success(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            health.record_attempt(root, self.summary())
            health.record_start(root, '2026-11-06T01:00:00Z', 'interrupted')
            result = health.evaluate(root, timestamp=datetime(2026, 11, 6, 1, tzinfo=timezone.utc))
            self.assertFalse(result['healthy'])
            self.assertEqual(result['last_success_at'], '2026-11-06T00:00:00Z')

    def test_candidate_script_refuses_local_git_mutations(self):
        spec = importlib.util.spec_from_file_location('candidate_checkpoint', ROOT/'scripts/persist-directory-candidates.py')
        checkpoint = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(checkpoint)
        with patch.dict(os.environ, {'GITHUB_ACTIONS': 'false'}), patch.object(sys, 'argv', ['checkpoint', 'persist']), \
             patch.object(checkpoint, 'git') as git, patch('sys.stderr'):
            with self.assertRaises(SystemExit):
                checkpoint.main()
            git.assert_not_called()

    def checkpoint(self):
        spec = importlib.util.spec_from_file_location('candidate_checkpoint', ROOT/'scripts/persist-directory-candidates.py')
        checkpoint = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(checkpoint)
        return checkpoint

    def test_checkpoint_restore_preserves_main_data_changes_and_never_restores_code_or_config(self):
        checkpoint = self.checkpoint()
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            current = root/'radar/data/registry.jsonl'
            current.parent.mkdir(parents=True)
            current.write_text('{"main": true}\n')

            def git(*args, **kwargs):
                result = b''
                status = 0
                if args[:2] == ('rev-parse', 'HEAD'):
                    result = b'current-main\n'
                elif args[0] == 'diff':
                    result = b'radar/data/registry.jsonl\n'
                elif args[0] == 'show':
                    name = args[1].split(':', 1)[1]
                    if name == checkpoint.CHECKPOINT:
                        result = b'{"base_sha": "old-main"}'
                    elif name == 'radar/state/builder-discovery.json':
                        result = b'{"query_cursor": 7}'
                    elif name == 'radar/data/registry.jsonl':
                        result = b'{"candidate": true}\n'
                    else:
                        status = 1
                return subprocess.CompletedProcess(args, status, result, b'')

            with patch.object(checkpoint, 'ROOT', root), patch.object(checkpoint, 'git', side_effect=git) as calls, \
                 patch.dict(os.environ, {'GITHUB_ACTIONS': 'true'}), patch.object(sys, 'argv', ['checkpoint', 'restore']), \
                 patch('sys.stdout'):
                checkpoint.main()
            self.assertEqual(current.read_text(), '{"main": true}\n')
            self.assertEqual(json.loads((root/'radar/state/builder-discovery.json').read_text())['query_cursor'], 7)
            restored = [call.args[1] for call in calls.call_args_list if call.args[0] == 'show']
            self.assertFalse(any('/config/' in name or '/scripts/' in name for name in restored))

    def test_failed_checkpoint_uses_previous_data_and_fast_forward_parents(self):
        checkpoint = self.checkpoint()
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root/'radar/data').mkdir(parents=True)
            (root/'radar/state').mkdir(parents=True)
            # Invalid data produced by a failed run must never enter the candidate index.
            (root/'radar/data/registry.jsonl').write_text('invalid partial data')
            (root/'radar/state/builder-discovery.json').write_text('{"query_cursor": 999}')
            (root/'radar/state/directory-last-run.json').write_text('{"fatal": true}')

            def git(*args, **kwargs):
                result = b''
                if args[0] == 'rev-parse':
                    result = b'candidate-tip\n' if '--verify' in args else b'current-main\n'
                elif args[0] == 'show':
                    if args[1].endswith(checkpoint.CHECKPOINT):
                        result = b'{"base_sha": "old-main"}'
                    elif args[1].endswith('radar/state/builder-discovery.json'):
                        result = b'{"query_cursor": 7}'
                    else:
                        result = b'{}\n'
                elif args[0] in {'hash-object', 'write-tree', 'commit-tree'}:
                    result = (args[0] + '-id\n').encode()
                return subprocess.CompletedProcess(args, 0, result, b'')

            with patch.object(checkpoint, 'ROOT', root), patch.object(checkpoint, 'git', side_effect=git) as calls, \
                 patch.dict(os.environ, {'GITHUB_ACTIONS': 'true'}), \
                 patch.object(sys, 'argv', ['checkpoint', 'persist', '--state-only']), patch('sys.stdout'), \
                 patch.object(checkpoint, 'command') as external:
                checkpoint.main()
            external.assert_not_called() # A failed first run must not open a PR.
            args = [call.args for call in calls.call_args_list]
            self.assertIn(('commit-tree', 'write-tree-id', '-p', 'candidate-tip', '-p', 'current-main'), args)
            self.assertIn(('push', 'origin', 'commit-tree-id:refs/heads/automation/directory-candidates'), args)
            self.assertFalse(any(call[0] == 'add' and call[-1] in checkpoint.DATA + checkpoint.PROGRESS for call in args))
            self.assertTrue(any(call[0] == 'update-index' and call[-1] == 'radar/data/registry.jsonl' for call in args))
            self.assertTrue(any(call[0] == 'update-index' and call[-1] == 'radar/state/builder-discovery.json' for call in args))
            hashed = [call.kwargs.get('input') for call in calls.call_args_list if call.args[0] == 'hash-object']
            self.assertIn(b'{"query_cursor": 7}', hashed)
            self.assertNotIn(b'{"query_cursor": 999}', hashed)
            self.assertTrue(any(call[0] == 'add' and call[-1] == 'radar/state/directory-last-run.json' for call in args))


if __name__ == '__main__':
    unittest.main()
