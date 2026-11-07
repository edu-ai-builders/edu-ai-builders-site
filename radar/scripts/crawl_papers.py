#!/usr/bin/env python3
"""Small metadata-only arXiv adapter. Serial requests, locked locally, no PDFs."""
import argparse, datetime as dt, fcntl, hashlib, json, pathlib, re, time, urllib.parse, urllib.request
import xml.etree.ElementTree as ET
ROOT = pathlib.Path(__file__).resolve().parents[1]
NS = {'a':'http://www.w3.org/2005/Atom','x':'http://arxiv.org/schemas/atom'}
def now(): return dt.datetime.now(dt.timezone.utc).isoformat().replace('+00:00','Z')
def parse_feed(raw, query, verified):
    rows=[]
    for e in ET.fromstring(raw).findall('a:entry',NS):
        text=lambda path: ' '.join((e.findtext(path,default='',namespaces=NS)).split())
        versioned=text('a:id').split('/abs/')[-1]
        if not re.fullmatch(r'\d{4}\.\d{4,5}v\d+',versioned): continue
        ident=re.sub(r'v\d+$','',versioned); abstract=text('a:summary')
        links=[]
        for url in re.findall(r'https?://[^\s<>]+',abstract):
            url=url.rstrip('.,);')
            if urllib.parse.urlparse(url).netloc.lower() in ('github.com','huggingface.co','zenodo.org'):
                links.append({'url':url,'relation':'author-linked-resource','evidence':'arXiv abstract','availability':'not-probed','license':'unknown'})
        cats=[c.attrib['term'] for c in e.findall('a:category',NS)]
        title=text('a:title'); content=(title+' '+abstract).lower()
        tags=[tag for tag,words in {'tutoring':['tutor','pedagog'], 'assessment':['assessment','benchmark','evaluation'], 'learning-analytics':['learning analytics','knowledge tracing'], 'language-learning':['language learning','grammar','writing'], 'student-simulation':['simulated student','student simulation']}.items() if any(w in content for w in words)]
        suggestions={'tutoring':'Prototype hint/scaffolding strategies and separately measure learner progress.', 'assessment':'Inspect benchmark tasks and rubrics for a tutor regression suite; check learner population and task fit.', 'learning-analytics':'Explore knowledge-state tracking; inspect student-data provenance, privacy and leakage.', 'language-learning':'Explore language feedback or grammar annotation; check language and learner-level coverage.', 'student-simulation':'Use simulated learners for prototype stress tests; validate against real learner evidence.'}
        suggestion=' '.join(suggestions[tag] for tag in tags) or 'Inspect methods for educational generation/evaluation ideas and establish relevance to intended learners.'
        rows.append({'schema_version':'1.0','resource_id':'arxiv:'+ident,'kind':'paper','arxiv_id':ident,'version':versioned,'title':title,'abstract':abstract,'authors':[a.findtext('a:name',namespaces=NS) for a in e.findall('a:author',NS)],'categories':cats,'published_at':text('a:published'),'updated_at':text('a:updated'),'verified_at':verified,'source_url':'https://arxiv.org/abs/'+versioned,'source':'arxiv-api','discovery_queries':[query],'metadata_license':'CC0-1.0','content_license':{'status':'unknown','reuse_condition':'Check the paper license on arXiv before copying text, figures, code or data; metadata license does not grant content rights.'},'is_preprint':True,'peer_review_status':'not-verified','related_resources':links,'tags':tags,'builder_use':{'status':'editorial-inference-from-metadata','suggestion':suggestion,'next_step':'Read the arXiv abstract and methods; author-linked resources require separate license and setup verification.'},'evidence_limits':['Metadata-only review; reported results are author claims, not independently validated.','Benchmark scores do not establish classroom learning gains or suitability for minors.','arXiv presence alone does not establish peer review.']})
    return rows
def run(config, output, fixture=None):
    cfg=json.loads(config.read_text()); stamp=now(); changes=[]
    lock=ROOT/'data/paper-fetch.lock';lock.parent.mkdir(exist_ok=True)
    with lock.open('a+') as fh:
        fcntl.flock(fh,fcntl.LOCK_EX)
        old={r['resource_id']:r for r in (map(json.loads,output.read_text().splitlines()) if output.exists() else [])}
        for query in cfg['queries'] if not fixture else cfg['queries'][:1]:
            if fixture:
                raw=fixture.read_bytes()
                feed=ET.fromstring(raw);query=feed.findtext('a:title',default='fixture query unknown',namespaces=NS)
            else:
                fh.seek(0);last=float(fh.read().strip() or '0');time.sleep(max(0,3.1-(time.time()-last)))
                params=urllib.parse.urlencode({'search_query':query,'start':0,'max_results':cfg.get('max_results_per_query',20),'sortBy':'submittedDate','sortOrder':'descending'})
                request=urllib.request.Request('https://export.arxiv.org/api/query?'+params,headers={'User-Agent':'EduAIBuilderRadar/1.0 metadata prototype'})
                try:
                    with urllib.request.urlopen(request,timeout=45) as response: raw=response.read()
                finally:
                    fh.seek(0);fh.truncate();fh.write(str(time.time()));fh.flush()
            rows=parse_feed(raw,query,stamp)
            if not rows: raise RuntimeError('No valid records; existing snapshot preserved')
            for r in rows:
                prev=old.get(r['resource_id']);r['first_seen_at']=prev.get('first_seen_at',stamp) if prev else stamp
                r['discovery_queries']=sorted(set(r['discovery_queries']+(prev.get('discovery_queries',[]) if prev else [])))
                if not prev or prev['version']!=r['version']:
                    changes.append({'resource_id':r['resource_id'],'previous_version':prev['version'] if prev else None,'version':r['version']})
                    with (ROOT/'data/paper-record-history.jsonl').open('a') as log:log.write(json.dumps({'observed_at':stamp,'previous':prev,'record':r},ensure_ascii=False)+'\n')
                old[r['resource_id']]=r
        body=''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in sorted(old.values(),key=lambda r:r['published_at'],reverse=True)); temp=output.with_suffix('.tmp');temp.write_text(body);temp.replace(output)
        history={'run_at':stamp,'count':len(old),'changes':changes,'sha256':hashlib.sha256(body.encode()).hexdigest(),'mode':'fixture-import' if fixture else 'live-api','queries':cfg['queries']}
        with (ROOT/'data/paper-update-history.jsonl').open('a') as f:f.write(json.dumps(history)+'\n')
    print(json.dumps(history))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--config',type=pathlib.Path,default=ROOT/'config/paper-queries.json');p.add_argument('--output',type=pathlib.Path,default=ROOT/'data/papers.jsonl');p.add_argument('--fixture',type=pathlib.Path);a=p.parse_args();run(a.config,a.output,a.fixture)
