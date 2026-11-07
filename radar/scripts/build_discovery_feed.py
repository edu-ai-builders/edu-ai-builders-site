#!/usr/bin/env python3
"""Public common projection; never exports user preferences or preview state."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
def build(root=ROOT):
    resources=json.loads((root/'data/builder-resources.json').read_text())
    rows=[{'resource_id':r['resource_key'],'kind':r['kind'],'title':r['title'],
           'source_url':r['source_url'],'verified_at':r['last_verified_at'],
           'tags':r['course_tags'],'description':r['purpose_zh'],
           'primary_action':r['primary_action'],'demo_url':r.get('demo_url'),
           'reuse_status':r['reuse_status'],'detail_id':r['id'],
           'detail_collection':'builder-resources.json'} for r in resources['resources']]
    path=root/'data/papers.jsonl'
    for r in map(json.loads,path.read_text().splitlines() if path.exists() else []):
        rows.append({'resource_id':r['resource_id'],'kind':'paper','title':r['title'],
                     'source_url':r['source_url'],'verified_at':r['verified_at'],
                     'tags':r['tags'],'description':r['abstract'],
                     'primary_action':{'kind':'read-paper','url':r['source_url'],'label_zh':'阅读预印本','label_en':'Read preprint'},
                     'demo_url':None,'reuse_status':'metadata-only-content-license-unknown',
                     'detail_id':r['resource_id'],'detail_collection':'papers.json',
                     'is_preprint':True,'builder_use':r['builder_use']})
    if len({r['resource_id'] for r in rows}) != len(rows):raise ValueError('Duplicate identity')
    payload={'schema_version':'radar.discovery-feed.v1','generated_at':resources['generated_at'],
             'count':len(rows),'records':rows}
    papers={'schema_version':'radar.papers.v1','records':list(map(json.loads,path.read_text().splitlines())) if path.exists() else []}
    for folder in ('data','site/data','web/data'):
        for name,data in [('discovery-feed.json',payload),('papers.json',papers)]:
            dest=root/folder/name;dest.parent.mkdir(parents=True,exist_ok=True);tmp=dest.with_suffix('.tmp');tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');tmp.replace(dest)
    return payload
if __name__=='__main__':print(json.dumps({'count':build()['count']}))
