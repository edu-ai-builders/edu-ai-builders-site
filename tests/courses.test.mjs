import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import { courses } from '../app/content/courses.ts';
import { gitStep, initialGitState, resolveFigure, figureKeys } from '../app/learn/figure-model.ts';

const rack = JSON.parse(await readFile(new URL('../public/learning-sciences/0.2.0/rack.json', import.meta.url), 'utf8'));
const ids = new Set(rack.entries.map(e => e.id));
test('course routes retain explicit concepts and complete navigable lessons', () => {
  assert.equal(courses.length, 7);
  for (const slug of ['learning-sciences-starter','github-starter','vibe-coding-basics','landing-page','personal-learning-assistant']) assert.ok(courses.some(c => c.slug === slug), slug);
  assert.ok(!courses.some(c => c.slug === 'git-first-checkpoint'), 'the merged Git route must not come back as a second course');
  assert.equal(new Set(courses.map(c => c.slug)).size, courses.length);
  for (const course of courses) {
    assert.ok(course.lessons.length >= 10 && course.lessons.length <= 12, course.slug);
    assert.equal(new Set(course.lessons.map(l => l.id)).size, course.lessons.length);
    for (const id of course.conceptIds) assert.ok(ids.has(id), id);
    for (const lesson of course.lessons) {
      for (const id of lesson.conceptIds) { assert.ok(ids.has(id), id); assert.ok(course.conceptIds.includes(id)); }
      assert.ok(lesson.task && lesson.checklist.length >= 3 && lesson.sources.length > 0);
      assert.ok(lesson.paragraphs.length >= 3);
      assert.equal(lesson.question.options.length, 3);
      assert.equal(new Set(lesson.paragraphs).size, lesson.paragraphs.length, `${course.slug}/${lesson.id}: duplicate paragraphs`);
      if (lesson.figureKey) assert.ok(figureKeys.includes(lesson.figureKey), `unimplemented figure ${lesson.figureKey}`);
      assert.equal(lesson.question.options.filter(o => o.correct).length, 1);
      assert.ok(lesson.question.options.every(o => o.feedback.trim()));
      for (const source of lesson.sources) assert.ok(source.url.startsWith('/atlas?') || new URL(source.url).protocol === 'https:');
      for (const [, script] of (lesson.example.code || '').matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
        assert.doesNotThrow(() => new Script(script, { filename: `${course.slug}/${lesson.id}` }));
      }
    }
  }
});

test('Git model retains staged snapshot after later edits, until explicitly restaged', () => {
  let state = gitStep(initialGitState, 'edit');
  state = gitStep(state, 'add');
  state = gitStep(state, 'edit');
  state = gitStep(state, 'commit');
  assert.deepEqual(state, { working: 3, staged: 2, committed: 2, remote: 1 });
  state = gitStep(state, 'push');
  assert.equal(state.remote, 2);
  assert.equal(state.working, 3);
  state = gitStep(state, 'add');
  state = gitStep(state, 'unstage');
  assert.equal(state.staged, 2);
  assert.equal(state.working, 3);
  assert.deepEqual(gitStep(state, 'reset'), initialGitState);
});
test('all course lessons resolve to implemented mechanisms', () => {
  for (const course of courses) for (const lesson of course.lessons) {
    assert.ok(figureKeys.includes(resolveFigure(course.slug, lesson)));
  }
});

test('expanded courses keep previously published lesson links and progress IDs', () => {
  const original = {
    'learning-sciences-starter': ['retrieve', 'scaffold', 'feedback'],
    'github-starter': ['snapshot', 'review', 'branch', 'account-platform', 'fork-clone', 'issue', 'pull-request', 'handoff'],
    'vibe-coding-basics': ['three-layers', 'brief', 'debug'],
    'landing-page': ['promise', 'structure', 'test'],
    'personal-learning-assistant': ['learning-loop', 'local-prototype', 'evaluate'],
  };
  for (const [slug, lessonIds] of Object.entries(original)) {
    const course = courses.find(c => c.slug === slug);
    for (const id of lessonIds) assert.ok(course.lessons.some(l => l.id === id), `${slug}/${id}`);
  }
});

test('beginner routes introduce learning sciences and lead from local Git into GitHub', () => {
  const learning = courses.find(course => course.slug === 'learning-sciences-starter');
  assert.equal(learning.lessons[0].id, 'what-is-learning-science');
  assert.match(learning.lessons[0].paragraphs[0], /学习科学研究/);
  const github = courses.find(course => course.slug === 'github-starter');
  for (const id of ['account-platform', 'fork-clone', 'issue', 'pull-request', 'handoff']) assert.ok(github.lessons.some(lesson => lesson.id === id));
  // One merged route: local version control first, the platform half second.
  const modules = [...new Set(github.lessons.map(lesson => lesson.module))];
  assert.equal(modules.length, 4);
  assert.deepEqual(github.lessons.map(lesson => lesson.module), github.lessons.map(lesson => lesson.module).slice().sort((a, b) => modules.indexOf(a) - modules.indexOf(b)), 'modules must not interleave');
  assert.ok(github.lessons.findIndex(lesson => lesson.id === 'snapshot') < github.lessons.findIndex(lesson => lesson.id === 'account-platform'));
  assert.ok(github.lessons.some(lesson => lesson.figureKey === 'git-flow') && github.lessons.some(lesson => lesson.figureKey === 'github-flow'));
  for (const course of courses) assert.ok(course.lessons.some(lesson => lesson.figureKey), `${course.slug}: no interactive learning figure`);
});

test('every course states who it is for, the complaint it answers and what you walk away holding', () => {
  const seen = new Set();
  for (const course of courses) {
    const { who, pain, win } = course.audience;
    for (const [field, value] of Object.entries({ who, pain, win })) {
      assert.equal(typeof value, 'string', `${course.slug}.${field}`);
      assert.ok(value.trim().length >= 12, `${course.slug}.${field}: too thin`);
      // 中英夹杂: only established product nouns may appear in Latin letters.
      const strays = value.replace(/Git|GitHub|AI|HTML|CSS|JavaScript|README|Issue|PR|Atlas/g, '').match(/[A-Za-z]+/g) || [];
      assert.deepEqual(strays, [], `${course.slug}.${field}: stray English inside Chinese copy`);
    }
    // The complaint is spoken by the learner, not written at them.
    assert.match(pain, /我|他|她|孩子/u, `${course.slug}: pain must be first person`);
    assert.match(pain, /[。？！]$/u, `${course.slug}: pain must be a whole sentence`);
    // The payoff names something you can point at, not a feeling.
    assert.doesNotMatch(win, /掌握了|精通|变得自信|爱上|轻松掌握/u, `${course.slug}: win overclaims`);
    for (const value of [who, pain, win]) {
      assert.ok(!seen.has(value), `duplicated audience line: ${value}`);
      seen.add(value);
    }
  }
});

test('the merged Git route keeps every progress key it inherited', () => {
  const github = courses.find(course => course.slug === 'github-starter');
  const kept = ['why-versions', 'snapshot', 'review', 'branch', 'merge', 'undo', 'account-platform', 'fork-clone', 'remote-sync', 'issue', 'pull-request', 'handoff'];
  assert.deepEqual(github.lessons.map(lesson => lesson.id), kept);
});
