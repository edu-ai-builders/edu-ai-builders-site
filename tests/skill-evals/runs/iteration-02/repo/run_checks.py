import json, subprocess
from pathlib import Path
out=Path('/private/tmp/edu-skill-evals-20261012/candidate-repo')
helper='/private/tmp/edu-skill-evals-20261012/candidate/edu-repo-adapter/scripts/repo_evidence.py'
base=Path('/private/tmp/edu-skill-evals-20261012/fixtures/repos')
records=[]
def run(case,args,cwd=None):
    p=subprocess.run(args,cwd=cwd,capture_output=True,text=True)
    r={'case':case,'argv':args,'cwd':str(cwd) if cwd else None,'exit_code':p.returncode,'stdout':p.stdout,'stderr':p.stderr}
    records.append(r)
    print(json.dumps(r,ensure_ascii=False))
    (out/'commands.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
run('C',['python3',helper,'inventory',str(base/'practice'),'--query','render','--query','compare','--query','explanation','--output',str(out/'case-c'/'practice-snapshot.json')])
run('C',['python3','-B','test_fractions.py'],base/'practice')
for repo,entry in [('practice','fractions_logic.py'),('retriever','query.py'),('viewer','answer.mjs')]:
    run('D',['python3',helper,'inventory',str(base/repo),'--path','README.md','--path',entry,'--query','optical','--query','光学','--query','simulation','--query','ray','--query','lens','--query','refraction','--max-files','2','--max-bytes','1800','--max-file-bytes','1400','--max-matches','12','--output',str(out/'case-d'/f'{repo}-snapshot.json')])
