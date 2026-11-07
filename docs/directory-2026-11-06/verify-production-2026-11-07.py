from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
from hashlib import sha256
from pathlib import Path
from urllib.parse import urlencode
import json, urllib.request, urllib.error, os, subprocess, tempfile

BASE=os.getenv('EDU_RELEASE_BASE','https://edu-ai-builders.dev')
ROOT=Path(__file__).resolve().parents[2]
results=[]
def fetch(path, *, locale='zh'):
 request=urllib.request.Request(BASE+path,headers={'User-Agent':'Edu-AI-Builders-release-check','Cookie':'edu-language='+locale})
 with urllib.request.urlopen(request,timeout=60) as response:
  return response.status,response.read(),dict(response.headers),response.url
paths=['/','/directory','/changelog','/learn','/atlas','/learning-sciences','/build','/skills/projects','/skills/scenarios/research-workflow','/skills/workflows/edu-repo-adapter','/robots.txt','/sitemap.xml']
with ThreadPoolExecutor(max_workers=4) as pool:
 for path,(status,body,headers,url) in zip(paths,pool.map(fetch,paths)):
  assert status==200 and body,path
  if path=='/changelog':assert b'r-2026-11-07-release' in body
  if path=='/sitemap.xml':assert b'<loc>https://edu-ai-builders.dev/skills</loc>' not in body
  results.append({'check':'route','path':path,'status':status})
status,body,_,_=fetch('/data/radar/catalog.json');expected=(ROOT/'public/data/radar/catalog.json').read_bytes()
assert sha256(body).digest()==sha256(expected).digest(),'catalog content differs from release'
catalog=json.loads(body);assert catalog['summary']['total']==len(catalog['records'])==3838
results.append({'check':'exact-catalog-sha256','sha256':sha256(body).hexdigest(),'total':len(catalog['records'])})
for query in ['我想整理文献并管理引用','DeepTutor offline commercial','zzzzunlisted']:
 _,body,_,_=fetch('/api/resources?'+urlencode({'q':query,'limit':2}));response=json.loads(body)
 if query=='zzzzunlisted':assert response['total']==0 and response['retrieval']['status']=='no-match'
 else:assert response['total']>0 and response['records'][0]['search_match']
 if query=='DeepTutor offline commercial':
  assert response['total']==2
  assert response['records'][0]['search_match']['constraints']['offline']=='unknown'
 results.append({'check':'search-api','query':query,'total':response['total'],'status':response['retrieval']['status']})
_,body,_,_=fetch('/api/resources?kind=dataset&limit=3');assert all(r['kind']=='dataset' for r in json.loads(body)['records'])
try:fetch('/api/resources?limit=-1')
except urllib.error.HTTPError as error:assert error.code==400
else:raise AssertionError('invalid API parameter accepted')
_,body,_,url=fetch('/skills?q=DeepTutor&kind=skill');assert '/directory?' in url and 'q=DeepTutor' in url and 'kind=skill' in url
results.append({'check':'skills-redirect','url':url})
_,body,_,_=fetch('/directory',locale='en');assert b'lang="en"' in body and b'Open Source Education AI' in body
results.append({'check':'english-directory','status':200})
manifest=json.loads((ROOT/'public/downloads/skills/manifest.json').read_text())
for item in manifest['packages']+manifest['examples']:
 _,body,_,_=fetch('/downloads/skills/'+item['archive']);assert sha256(body).hexdigest()==item['sha256'],item['archive']
 results.append({'check':'package-sha256','archive':item['archive'],'verified':True})
report={'checked_at':datetime.now(timezone.utc).isoformat(),'production':BASE,'release_commit':'4e6c059824c544f5d27d0ae4428d48a7b7ce6d29','result':'passed','checks':results}
Path('/tmp/edu-directory-production-recheck.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
