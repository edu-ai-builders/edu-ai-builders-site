// Keep new authored Chinese UI text from silently leaking into the English site.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
const catalogs = ["common", "learning", "atlas", "directory", "courses"].map(
  (name) => JSON.parse(fs.readFileSync(`app/i18n/${name}.en.json`, "utf8")),
);
const messages = Object.assign({}, ...catalogs);
const missing = new Map();
const normalize = (text) => text.replace(/\s+/g, " ").trim();
function scan(file) {
  const text = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  function visit(node) {
    let value;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
      value = node.text;
    else if (ts.isJsxText(node)) value = node.text;
    else if (ts.isTemplateExpression(node))
      value =
        node.head.text +
        node.templateSpans
          .map((span, index) => `{${index}}` + span.literal.text)
          .join("");
    if (value && /[\u3400-\u9fff]/.test(value) && !messages[normalize(value)]) {
      const key = normalize(value);
      if (file === "app/content/atlas-zh.ts" && value.includes("|")) {
        for (const row of value.trim().split("\n"))
          for (const cell of row.split("|").slice(1))
            if (cell && !messages[normalize(cell)])
              missing.set(file + ":" + cell.slice(0, 15), cell);
        return;
      }
      // These are original content or the intentionally bilingual language chooser.
      if (!["中文", "Language / 语言"].includes(key))
        missing.set(
          file +
            ":" +
            (source.getLineAndCharacterOfPosition(node.getStart(source)).line +
              1),
          key,
        );
    }
    if (!ts.isTemplateExpression(node)) ts.forEachChild(node, visit);
  }
  visit(source);
}
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== "i18n") walk(file);
    } else if (/\.tsx?$/.test(file)) scan(file);
  }
}
walk("app");
for (const [location, value] of missing)
  console.error(location + " " + value.slice(0, 150));
console.log(`${missing.size} untranslated authored strings`);
process.exitCode = missing.size ? 1 : 0;
