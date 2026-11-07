"""Isolated B proof: real retriever -> typed adapter -> real viewer with escaped boundary."""
import sys
sys.dont_write_bytecode = True
import importlib.util
import json
from pathlib import Path
import subprocess
import html

OUT = Path(__file__).resolve().parent
SOURCE = Path('/private/tmp/edu-skill-evals-20261012/fixtures/repos')
spec = importlib.util.spec_from_file_location('fixture_retriever', SOURCE / 'retriever/query.py')
retriever = importlib.util.module_from_spec(spec)
spec.loader.exec_module(retriever)
documents = json.loads((OUT / 'owned-documents.json').read_text())
for d in documents:
    assert isinstance(d['id'], str) and d['id'] == 'owned-science-1'
    assert type(d['page']) is int and d['page'] > 0
    assert isinstance(d['text'], str)
known = {(d['id'], d['page']): d['text'] for d in documents}

def adapt(query):
    assert isinstance(query, str) and query.strip()
    hits = retriever.retrieve(query.strip(), documents)
    if not hits:
        return {'status': 'no_evidence', 'answer': '所选资料中未找到支持此问题的页面。', 'citations': []}
    for hit in hits:
        src = hit['source']
        assert type(src['page']) is int and src['page'] > 0
        assert known.get((src['document_id'], src['page'])) == hit['text']
    return {'status': 'supported', 'answer': '资料原文：\n' + '\n'.join(h['text'] for h in hits),
            'citations': [{'url': '#owned-science-1-page-' + str(h['source']['page']),
                           'label': '自有科学短文，第 ' + str(h['source']['page']) + ' 页',
                           'document_id': h['source']['document_id'], 'page': h['source']['page']}
                          for h in hits]}

# Every document-derived value is plain text. URLs come only from validated local anchors.
node_script = '''
import {renderAnswer} from "/private/tmp/edu-skill-evals-20261012/fixtures/repos/viewer/answer.mjs";
let input = ""; for await (const chunk of process.stdin) input += chunk;
const model = JSON.parse(input);
const escapeText = value => value.replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const safe = {answer: escapeText(model.answer), citations: model.citations.map(c => {
  if (!/^#owned-science-1-page-[1-9][0-9]*$/.test(c.url)) throw new Error("Invalid citation URL");
  return {url: escapeText(c.url), label: escapeText(c.label)};
})};
process.stdout.write(renderAnswer(safe));
'''

def render(model):
    return subprocess.run(['node', '--input-type=module', '-e', node_script],
                          input=json.dumps(model, ensure_ascii=False), text=True,
                          capture_output=True, check=True).stdout

results=[]
for query, expected_page in [('水受热', 1), ('闭合回路', 2), ('光合作用', None)]:
    model=adapt(query)
    rendered=render(model)
    if expected_page is None:
        assert model['status']=='no_evidence' and model['citations']==[]
    else:
        assert model['status']=='supported' and model['citations'][0]['page']==expected_page
        assert '第 '+str(expected_page)+' 页' in rendered
    assert '<img' not in rendered
    if expected_page==1:
        assert '&lt;img' in rendered and '&quot;alert(1)&quot;' in rendered
        (OUT/'answer-payload.json').write_text(json.dumps(model,ensure_ascii=False,indent=2)+'\n')
        sections=''.join('<section id="owned-science-1-page-'+str(d['page'])+'"><h2>自有科学短文，第 '+str(d['page'])+' 页</h2><p>'+html.escape(d['text'])+'</p></section>' for d in documents)
        (OUT/'minimal-answer.html').write_text('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>课堂问答最小流程</title><body>'+rendered+sections+'</body></html>')
    results.append({'query':query,'status':model['status'],'pages':[c['page'] for c in model['citations']]})
# Unsafe caller URL must be rejected, even though original viewer would accept it.
try:
    render({'answer':'text','citations':[{'url':'javascript:alert(1)','label':'test'}]})
except subprocess.CalledProcessError:
    results.append({'unsafe_url':'rejected'})
else:
    raise AssertionError('unsafe URL accepted')
print(json.dumps({'integration':'actual query.py -> adapter -> actual answer.mjs via Node', 'results':results, 'html_text':'escaped', 'external_services':False},ensure_ascii=False,indent=2))
