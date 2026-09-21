/* Standalone tool localization. Embedded in each HTML so downloaded copies work offline.
   Source originals, stable IDs, math state, and editable values are never rewritten. */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof document.createTreeWalker !== 'function') return;
  let lang = 'zh';
  try { lang = new URLSearchParams(window.location.search).get('lang') || ''; } catch {}
  if (!lang) { try { lang = document.cookie.match(/(?:^|;\s*)edu-language=(en|zh)(?:;|$)/)?.[1] || 'zh'; } catch { lang = 'zh'; } }
  if (lang !== 'en') return;
  document.documentElement.lang = 'en';
  const dictionary = __DICTIONARY__;
  const normalize = text => String(text).replace(/\s+/g, ' ').trim();
  const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const entries = Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);
  const patterns = entries.filter(([key]) => /\{\d+\}/.test(key)).map(([key, value]) => {
    const slots = [];
    const parts = key.split(/(\{\d+\})/g).map(part => {
      if (/^\{\d+\}$/.test(part)) { slots.push(part); return '(.*?)'; }
      return escape(part);
    });
    return { expression: new RegExp('^' + parts.join('') + '$'), value, slots };
  });
  const plain = entries.filter(([key]) => !/\{\d+\}/.test(key));
  function translate(value, depth = 0) {
    const text = normalize(value);
    if (!/[\u3400-\u9fff]/.test(text) || depth > 5) return String(value);
    if (dictionary[text] !== undefined) return dictionary[text];
    // Dynamic feedback sometimes concatenates complete sentences into one text node.
    const sentences = text.match(/[^。！？]+[。！？]|[^。！？]+$/g);
    if (sentences && sentences.length > 1) {
      const joined = sentences.map(sentence => translate(sentence, depth + 1)).join(' ');
      if (joined !== text && !/[\u3400-\u9fff]/.test(joined)) return joined;
    }
    for (const pattern of patterns) {
      const match = pattern.expression.exec(text);
      if (match) {
        const values = Object.fromEntries(pattern.slots.map((slot, index) => [slot, translate(match[index + 1], depth + 1)]));
        return pattern.value.replace(/\{\d+\}/g, slot => values[slot] ?? slot);
      }
    }
    let result = text;
    for (const [source, english] of plain) {
      if (result.includes(source)) result = result.split(source).join(' ' + english + ' ');
    }
    return result.replace(/\s+/g, ' ').trim();
  }
  window.eduToolTranslate = translate;
  // Canvas has no text nodes: translate authored labels at the drawing boundary.
  if (typeof CanvasRenderingContext2D !== 'undefined') {
    for (const method of ['fillText', 'strokeText']) {
      const original = CanvasRenderingContext2D.prototype[method];
      CanvasRenderingContext2D.prototype[method] = function (text, ...args) { return original.call(this, translate(text), ...args); };
    }
  }
  const excluded = 'script,style,textarea,input,[contenteditable="true"],[data-user-content]';
  function localizeText(node) {
    if (!node.parentElement || node.parentElement.closest(excluded)) return;
    const original = node.nodeValue;
    if (!/[\u3400-\u9fff]/.test(original || '')) return;
    const translated = translate(original);
    if (normalize(translated) !== normalize(original)) node.nodeValue = ' ' + translated + ' ';
  }
  function localizeElement(element) {
    if (element.matches('script,style,[data-user-content]')) return;
    for (const attr of ['aria-label', 'title', 'placeholder', 'alt', 'content']) {
      const source = element.getAttribute(attr);
      if (source && /[\u3400-\u9fff]/.test(source)) {
        const translated = translate(source);
        if (translated !== source) element.setAttribute(attr, translated);
      }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) return localizeText(root);
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.nodeType === 1) localizeElement(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeType === 3) localizeText(node); else localizeElement(node);
    }
  }
  function start() {
    walk(document);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData') localizeText(record.target);
        else if (record.type === 'attributes') localizeElement(record.target);
        else for (const node of record.addedNodes) walk(node);
      }
    });
    observer.observe(document.documentElement, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['aria-label','title','placeholder','alt','content']});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
})();
