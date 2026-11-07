import copy, datetime as dt, unittest
from crawl_papers import parse_feed
from recommend_papers import recommend
class PapersTest(unittest.TestCase):
 def setUp(self):
  self.at=dt.datetime(2026,10,10,tzinfo=dt.timezone.utc)
  self.prefs={'user_id':'demo','enabled':True,'frequency':'daily','interests':['tutoring'],'limit':5}
  self.record={'resource_id':'arxiv:2609.00001','arxiv_id':'2609.00001','version':'2609.00001v1','title':'AI tutoring','abstract':'tutoring study','authors':['A'],'categories':['cs.AI'],'source_url':'https://arxiv.org/abs/2609.00001v1','published_at':'2026-09-01T00:00:00Z','builder_use':{},'related_resources':[],'evidence_limits':['preprint'],'is_preprint':True}
 def test_actual_upstream_scoring(self):
  output,state=recommend([self.record],self.prefs,at=self.at);self.assertEqual(output['recommendations'][0]['score'],4);self.assertFalse(output['sent'])
 def test_repeat_due_and_dedup(self):
  _,state=recommend([self.record],self.prefs,at=self.at)
  self.assertEqual(recommend([self.record],self.prefs,state,self.at)[0]['status'],'not-due')
  self.assertEqual(recommend([self.record],self.prefs,state,self.at+dt.timedelta(days=1))[0]['recommendations'],[])
 def test_new_version(self):
  _,state=recommend([self.record],self.prefs,at=self.at);r=copy.deepcopy(self.record);r['version']='2609.00001v2'
  self.assertEqual(len(recommend([r],self.prefs,state,self.at+dt.timedelta(days=1))[0]['recommendations']),1)
 def test_unsubscribe(self):
  self.prefs['enabled']=False;self.assertEqual(recommend([self.record],self.prefs,at=self.at)[0]['status'],'unsubscribed')
 def test_negative_and_category_filter(self):
  self.prefs['exclude']=['study'];self.assertEqual(recommend([self.record],self.prefs,at=self.at)[0]['recommendations'],[])
  self.prefs['categories']=['cs.CL'];self.assertEqual(recommend([self.record],self.prefs,at=self.at)[0]['recommendations'],[])
 def test_invalid_frequency(self):
  self.prefs['frequency']='hourly'
  with self.assertRaises(ValueError):recommend([],self.prefs,at=self.at)
 def test_unknown_license_links(self):
  xml='<feed xmlns="http://www.w3.org/2005/Atom"><entry><id>http://arxiv.org/abs/2609.00001v1</id><title>tutoring</title><summary>Code https://github.com/a/b.</summary><published>2026-09-01T00:00:00Z</published></entry></feed>'
  r=parse_feed(xml,'test','verified')[0];self.assertEqual(r['content_license']['status'],'unknown');self.assertEqual(r['related_resources'][0]['url'],'https://github.com/a/b');self.assertEqual(r['metadata_license'],'CC0-1.0')
if __name__=='__main__':unittest.main()
