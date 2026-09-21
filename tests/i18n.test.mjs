import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  createTranslator,
  resolveLocale,
  translateData,
} from "../app/i18n/core.ts";
import { courses } from "../app/content/courses.ts";
import { resolveFigure } from "../app/learn/figure-model.ts";

const catalogs = await Promise.all(
  ["common", "learning", "atlas", "directory", "courses"].map(async (name) =>
    JSON.parse(
      await readFile(
        new URL(`../app/i18n/${name}.en.json`, import.meta.url),
        "utf8",
      ),
    ),
  ),
);
const messages = Object.assign({}, ...catalogs);
const english = createTranslator("en", messages);

test("language defaults safely and translates text without changing identifiers", () => {
  assert.equal(resolveLocale(undefined), "zh");
  assert.equal(resolveLocale("en"), "en");
  assert.equal(resolveLocale("unexpected"), "zh");
  assert.equal(createTranslator("zh", messages)("学习"), "学习");
  assert.equal(english("  学习  "), "  Learn  ");
  assert.equal(
    english("pedagogy:self-explanation"),
    "pedagogy:self-explanation",
  );
  assert.equal(
    english("https://example.com/path?q=test"),
    "https://example.com/path?q=test",
  );
  const t = createTranslator("en", {
    "共 {0} 个（{1}）": "{0} items ({1})",
    工具: "tools",
  });
  assert.equal(t("共 6 个（工具）"), "6 items (tools)");
});

test("all 74 English lessons preserve routes, progress IDs, figures and answer correctness", () => {
  const translated = translateData(courses, english);
  for (let c = 0; c < courses.length; c++) {
    const source = courses[c],
      target = translated[c];
    assert.equal(target.slug, source.slug);
    assert.deepEqual(target.conceptIds, source.conceptIds);
    assert.equal(target.lessons.length, source.lessons.length);
    for (let i = 0; i < source.lessons.length; i++) {
      const a = source.lessons[i],
        b = target.lessons[i];
      assert.equal(b.id, a.id);
      assert.deepEqual(b.conceptIds, a.conceptIds);
      assert.deepEqual(
        b.question.options.map((x) => x.correct),
        a.question.options.map((x) => x.correct),
      );
      assert.equal(
        resolveFigure(source.slug, a),
        resolveFigure(target.slug, b),
      );
    }
  }
  const missing = [];
  function walk(value, path) {
    if (typeof value === "string" && /[\u3400-\u9fff]/.test(value))
      missing.push(path + ": " + value.slice(0, 80));
    else if (value && typeof value === "object")
      for (const [k, v] of Object.entries(value)) walk(v, path + "." + k);
  }
  walk(translated, "courses");
  assert.deepEqual(missing, [], "Untranslated authored course content");
});
