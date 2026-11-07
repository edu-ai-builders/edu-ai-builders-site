import importlib.util, json, sys
from pathlib import Path
source=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/private/tmp/edu-skill-evals-20261012/fixtures/repos/practice/fractions_logic.py')
spec=importlib.util.spec_from_file_location('baseline_practice',source)
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
observations=[]
for left,right in [((1,2),(3,4)),((3,4),(1,2)),((1,2),(2,4)),((1,4),(1,4)),((2,4),(1,4)),((1,4),(2,4)),((-1,2),(0,1)),((1,-2),(-1,2))]:
    observations.append({'problem':[left,right],'compare':m.compare(left,right),'explanation':m.explanation(left,right),'render':m.render((left,right))})
# The contract requires a fully populated return value during this call.
assert m.render(((1,4),(1,4))) == {'verdict':'equal','explanation':'B has more equal-sized parts.'}
assert list(m.render(((1,2),(3,4)))) == ['verdict','explanation']
errors=[]
for label,fn in [('zero-denominator',lambda:m.render(((1,0),(1,2)))),('missing-problem',lambda:m.render(None)),('wrong-arity',lambda:m.render(((1,2),))),('malformed-tuple',lambda:m.compare((1,2,3),(1,2)))]:
    try: fn()
    except Exception as error: errors.append({'case':label,'type':type(error).__name__,'message':str(error)})
    else: raise AssertionError(label+' should raise')
print(json.dumps({'observations':observations,'errors':errors,'immediate_render_return':'verdict and explanation populated in same synchronous call','state_observation':'repeated calls return same values; no delayed learner actions in inspected source'},ensure_ascii=False,indent=2))
