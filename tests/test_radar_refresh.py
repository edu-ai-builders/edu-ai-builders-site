import importlib.util
import pathlib
import unittest

path = pathlib.Path(__file__).resolve().parents[1] / 'scripts/radar-refresh.py'
spec = importlib.util.spec_from_file_location('radar_refresh', path)
refresh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(refresh)

class RefreshTests(unittest.TestCase):
    def test_multiline_declarations_exclude_body(self):
        source = '---\nname: example\ndescription: >-\n  A clear workflow\n  for teaching.\nallowed-tools: Bash\n---\nPrivate instructions must not be copied.'
        self.assertEqual(refresh.parse_frontmatter(source), {'name': 'example', 'description': 'A clear workflow for teaching.'})

    def test_bad_manifest_cannot_be_marked_checked(self):
        for source in ['No header', '---\nname: x\n---\nBody', '---\nname: x\ndescription: |\n---\nBody']:
            self.assertIsNone(refresh.parse_frontmatter(source))

    def test_failure_keeps_last_successful_snapshot(self):
        old = {'id': 'repo:1', 'name': 'old/name', 'stars': 3, 'checkedAt': '2026-07-01'}
        prior = {'id': 'repo:1', 'name': 'new/name', 'stars': 50, 'checkedAt': '2026-09-21', 'refreshStatus': 'refreshed'}
        result = refresh.retain_previous(old, prior, 'failed', 'http-404')
        self.assertEqual(result['name'], 'new/name')
        self.assertEqual(result['stars'], 50)
        self.assertEqual(result['checkedAt'], '2026-09-21')
        self.assertEqual(result['refreshStatus'], 'failed')
        self.assertEqual(result['refreshError'], 'http-404')
        self.assertEqual(prior['refreshStatus'], 'refreshed')

if __name__ == '__main__':
    unittest.main()
