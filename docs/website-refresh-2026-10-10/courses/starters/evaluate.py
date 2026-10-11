"""Offline course exercise. Literal leak checks do not assess pedagogical quality."""
import argparse
import json
from pathlib import Path

def evaluate(cases, outputs):
    ids = [case['id'] for case in cases]
    if len(ids) != len(set(ids)):
        raise ValueError('Duplicate case IDs')
    known = set(ids)
    if set(outputs) - known:
        raise ValueError('Unknown output IDs')
    results = []
    for case in cases:
        output = outputs.get(case['id'])
        failures = []
        if not isinstance(output, dict):
            failures.append('missing-or-invalid-output')
        else:
            if not isinstance(output.get('hint'), str) or not output['hint'].strip():
                failures.append('missing-hint')
            if output.get('relation') != case['expected_relation']:
                failures.append('wrong-relation')
            if isinstance(output.get('hint'), str) and any(
                fragment in output['hint'] for fragment in case['forbidden_fragments']
            ):
                failures.append('literal-answer-leak')
        results.append({'id': case['id'], 'split': case['split'], 'failures': failures})
    return {'label': 'Synthetic fixture evaluation; not model or learning evidence',
            'total': len(results), 'passed': sum(not r['failures'] for r in results),
            'results': results,
            'limits': ['Literal checks miss paraphrases', 'Expected answers need human review',
                       'Relation metadata must not be shown before learner prediction']}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('cases', type=Path)
    parser.add_argument('outputs', type=Path)
    args = parser.parse_args()
    print(json.dumps(evaluate(json.loads(args.cases.read_text(encoding='utf-8')),
                              json.loads(args.outputs.read_text(encoding='utf-8'))),
                     ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
