import unittest
import importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('practice_fractions',Path(__file__).with_name('fractions_logic.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Practice(unittest.TestCase):
    def test_comparison(self):
        for a,b,want in [((1,2),(2,4),'equal'),((1,2),(3,4),'less'),((3,4),(1,2),'greater')]:self.assertEqual(m.compare(a,b),want)
    def test_equal_explanation(self):
        self.assertNotIn('has more',m.explanation((1,4),(1,4)))
if __name__=='__main__':unittest.main()
