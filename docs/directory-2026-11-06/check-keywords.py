"""Check discovery boundaries and the product's required search coverage."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONFIG = ROOT / 'radar/config'
FACETS = {'audiences', 'subjects', 'platforms', 'scenarios', 'capabilities'}


def read(name):
    return json.loads((CONFIG / name).read_text())


def check():
    builder = read('builder-discovery.json')
    families = {row['id']: row for row in builder['families']}
    queries = builder['queries']
    ids = [row['query_id'] for row in queries]
    assert ids and len(ids) == len(set(ids)), 'query IDs must stay unique'
    assert builder['query_revision'] == '2026-11-06', 'changed searches need a cursor revision'
    assert builder['budgets']['queries_per_run'] <= 8
    assert builder['budgets']['manifest_attempts'] <= 24
    assert builder['budgets']['api_requests'] <= 100
    for group in ('families', 'queries', 'sources'):
        assert all(not FACETS.intersection(row) for row in builder[group]), 'search leads cannot assert confirmed facets'
    for row in queries:
        assert row['family'] in families
        assert len(row['query']) < 256
        assert row['query'].count('"') % 2 == 0
        if row['kind'] == 'skill':
            assert row['query'].startswith('filename:SKILL.md ')
            assert 'archived:' not in row['query'], 'repository qualifiers are invalid in legacy code search'
            assert 'in:name' not in row['query']
        else:
            assert row['kind'] == 'repo'
            assert 'archived:false' in row['query']
    for name in ('self-learning', 'teachers', 'educational-research', 'system-admin', 'tutor-evaluation',
                 'training-data', 'open-textbooks', 'knowledge-graphs', 'mathematics', 'science',
                 'languages', 'humanities', 'arts', 'computing', 'biology', 'chemistry', 'statistics'):
        assert {row['kind'] for row in queries if row['family'] == name} == {'skill', 'repo'}, name
    assert not {'art', 'history', 'writing'}.intersection(word for family in families.values() for word in family['keywords'])
    for name in ('directory-query-matrix.json', 'query-matrix.json'):
        rows = read(name)
        assert len({row['id'] for row in rows}) == len(rows)
        assert all(row['enabled'] and row['kind_hint'] == 'repo' for row in rows), 'queries are neutral discovery leads'
    assert len(read('skill-query-matrix.json')['queries']) == sum(row['kind'] == 'skill' for row in queries)
    sources = builder['sources']
    assert not any(row['repository'] == 'openai/skills' for row in sources), 'deprecated source cannot be the current example feed'
    assert any(row['repository'] == 'openai/plugins' for row in sources)
    seeds = read('seeds.json')
    assert len({row['lead_id'] for row in seeds}) == len(seeds)
    exact = {row.get('full_name') for row in seeds}
    assert {'HKUDS/DeepTutor', 'openai/plugins', 'openai/openai-agents-python', 'openai/openai-agents-js',
            'openai/evals', 'openai/grade-school-math', 'd2l-ai/d2l-en', 'jupyterhub/jupyterhub',
            'THU-MAIC/OpenMAIC', 'THU-KEG/EDUKG'}.issubset(exact)
    print(json.dumps({'status': 'PASS', 'families': len(families), 'builder_queries': len(queries),
                      'directory_queries': len(read('directory-query-matrix.json')), 'exact_source_checks': 10}))


if __name__ == '__main__':
    check()
