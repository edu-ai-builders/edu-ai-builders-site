#!/usr/bin/env python3
"""Local per-user digest using pinned MIT ibaaj/arxiv-digest scoring; never sends."""
import argparse, datetime as dt, json, pathlib, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'prototypes/arxiv/upstream'))
from arxiv_digest.models import Paper
from arxiv_digest.scoring import compute_local_score, compact_local_why

def recommend(records,prefs,state=None,at=None):
    state=state or {};at=at or dt.datetime.now(dt.timezone.utc);uid=prefs['user_id']
    if prefs.get('frequency') not in ('daily','weekly','manual','disabled'): raise ValueError('frequency must be daily, weekly, manual or disabled')
    if not prefs.get('enabled',False) or prefs['frequency']=='disabled':return {'user_id':uid,'status':'unsubscribed','recommendations':[]},state
    if not prefs.get('interests'):raise ValueError('at least one interest is required')
    previous=state.get('last_preview_at'); days={'daily':1,'weekly':7}.get(prefs['frequency'],0)
    if previous and (at-dt.datetime.fromisoformat(previous.replace('Z','+00:00'))).total_seconds()<days*86400:return {'user_id':uid,'status':'not-due','recommendations':[]},state
    seen=set(state.get('seen_versions',[]));ranked=[]
    for r in records:
        if r['version'] in seen:continue
        if prefs.get('categories') and not set(r['categories'])&set(prefs['categories']):continue
        age=(at-dt.datetime.fromisoformat(r['published_at'].replace('Z','+00:00'))).days
        if age<0 or age>prefs.get('max_age_days',180):continue
        text=(r['title']+' '+r['abstract']).lower()
        if any(term.lower() in text for term in prefs.get('exclude',[]) if term.strip()):continue
        paper=Paper(r['arxiv_id'],r['version'],r['title'],r['abstract'],r['authors'],[],None,r['source_url'],None,None,None,'api')
        score=compute_local_score(paper,{'filters':{'positive_keywords_strong':prefs['interests'],'negative_keywords':prefs.get('exclude',[])}})
        if score.score<prefs.get('min_score',4):continue
        ranked.append({'resource_id':r['resource_id'],'version':r['version'],'kind':'paper','title':r['title'],'source_url':r['source_url'],'score':score.score,'recommendation_reason':compact_local_why(score),'matched_interests':score.keyword_hits_strong,'builder_use':r['builder_use'],'related_resources':r['related_resources'],'evidence_limits':r['evidence_limits'],'is_preprint':r['is_preprint'],'published_at':r['published_at']})
    ranked.sort(key=lambda r:(r['score'],r['published_at']),reverse=True);ranked=ranked[:prefs.get('limit',5)]
    output={'schema_version':'1.0','user_id':uid,'status':'local-preview','generated_at':at.isoformat(),'frequency':prefs['frequency'],'delivery_channel':'local-file','sent':False,'recommendations':ranked}
    return output,{'user_id':uid,'last_preview_at':at.isoformat(),'seen_versions':sorted(seen|{r['version'] for r in ranked})}
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--preferences',type=pathlib.Path,required=True);p.add_argument('--papers',type=pathlib.Path,default=ROOT/'data/papers.jsonl');p.add_argument('--state',type=pathlib.Path,required=True);p.add_argument('--output',type=pathlib.Path,required=True);p.add_argument('--record-preview',action='store_true',help='Explicitly persist preview history; does not mark anything as delivered');a=p.parse_args()
    prefs=json.loads(a.preferences.read_text());state=json.loads(a.state.read_text()) if a.state.exists() else {}
    if state.get('user_id') not in (None,prefs['user_id']):raise ValueError('Use a separate state file per user')
    result,newstate=recommend([json.loads(line) for line in a.papers.read_text().splitlines()],prefs,state);a.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    if a.record_preview:a.state.write_text(json.dumps(newstate,indent=2)+'\n')
    print(json.dumps({'status':result['status'],'count':len(result['recommendations']),'sent':False}))
