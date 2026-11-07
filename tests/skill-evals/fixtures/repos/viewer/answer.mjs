export function renderAnswer(answer) {
  const citations = answer.citations.map(c => `<a href="${c.url}">${c.label}</a>`).join('');
  return `<article>${answer.answer}${citations}</article>`;
}
