import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createContext, runInContext } from "node:vm";

const base = new URL("../public/tools/", import.meta.url);
async function runtime({ query = "?lang=en", cookie = "", nodes = [] } = {}) {
  const html = await readFile(new URL("angle-measure.html", base), "utf8");
  const script = html.match(
    /<script data-edu-tool-language>([\s\S]*?)<\/script>/,
  )[1];
  let start, callback;
  class Canvas {
    fillText(text) {
      return text;
    }
    strokeText(text) {
      return text;
    }
  }
  const document = {
    nodeType: 9,
    documentElement: { lang: "zh" },
    readyState: "loading",
    get cookie() {
      if (cookie === "blocked") throw new Error("Opaque origin");
      return cookie;
    },
    addEventListener(type, fn) {
      if (type === "DOMContentLoaded") start = fn;
    },
    createTreeWalker() {
      let at = -1;
      return {
        nextNode() {
          return ++at < nodes.length;
        },
        get currentNode() {
          return nodes[at];
        },
      };
    },
  };
  const window = { location: { search: query } };
  class Observer {
    constructor(fn) {
      callback = fn;
    }
    observe() {}
  }
  runInContext(
    script,
    createContext({
      window,
      document,
      URLSearchParams,
      CanvasRenderingContext2D: Canvas,
      MutationObserver: Observer,
      NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4 },
    }),
  );
  return {
    t: window.eduToolTranslate,
    document,
    canvas: new Canvas(),
    start: () => start?.(),
    notify: (records) => callback?.(records),
  };
}
test("standalone locale respects URL override and works in opaque sandbox origins", async () => {
  const en = await runtime({ query: "?lang=en", cookie: "blocked" });
  assert.equal(en.document.documentElement.lang, "en");
  assert.equal(
    (await runtime({ query: "?lang=zh", cookie: "edu-language=en" })).t,
    undefined,
  );
  assert.equal((await runtime({ query: "", cookie: "blocked" })).t, undefined);
  assert.equal(
    (await runtime({ query: "", cookie: "edu-language=en" })).document
      .documentElement.lang,
    "en",
  );
});
test("standalone translations cover dynamic mathematical feedback and canvas labels", async () => {
  const { t, canvas } = await runtime();
  for (const text of [
    "你向左跳了 3 格，从 2 到达了 -1。所以 2 − 3 = -1。",
    "k = 0：直线水平，y 值恒为 2.0，x 怎么变 y 都不变。",
    "直线走向：向右上方向。",
    "下移 3.0",
    "5 × 4 = 20 个方格",
    "正在铺第 19 格……",
    "造了 2 / 3 条 · 认出了连不上的那一对",
    "第 1 步 / 共 3 步",
  ]) {
    const result = t(text);
    assert.doesNotMatch(result, /[\u3400-\u9fff]/);
    assert.notEqual(result, text);
  }
  assert.equal(canvas.fillText("顶点"), "Vertex");
  assert.equal(canvas.strokeText("1/2 = 2/4"), "1/2 = 2/4");
});
test("standalone localization preserves editable text and does not loop on partial matches", async () => {
  const parent = { closest: () => false };
  let written = 0,
    text = "未知词和";
  const authored = {
    nodeType: 3,
    parentElement: parent,
    get nodeValue() {
      return text;
    },
    set nodeValue(value) {
      written++;
      text = value;
    },
  };
  const user = {
    nodeType: 3,
    parentElement: { closest: () => true },
    nodeValue: "我的个人笔记",
  };
  const r = await runtime({ nodes: [authored, user] });
  r.start();
  const afterInitial = written;
  for (let i = 0; i < 5; i++)
    r.notify([{ type: "characterData", target: authored }]);
  assert.equal(written, afterInitial);
  assert.equal(user.nodeValue, "我的个人笔记");
  authored.nodeValue = "角度测量器";
  r.notify([{ type: "characterData", target: authored }]);
  assert.match(authored.nodeValue, /Angle Explorer/);
});
