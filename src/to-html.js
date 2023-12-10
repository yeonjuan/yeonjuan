/**
 * @typedef {import("marked").RendererObject} RendererObject
 */
const { Marked } = require("marked");
const { markedHighlight } = require("marked-highlight");
const hljs = require("highlight.js").default;

/**
 * @param {string} markdown
 * @param {RendererObject} [renderer]
 * @returns {Promise<string>}
 */
async function toHTML(markdown, renderer) {
  const marked = new Marked();
  // markedHighlight({
  //   highlight(code) {
  //     return hljs.highlight(code, "js").value;
  //   },
  // })
  if (renderer) {
    marked.use({ renderer });
  }
  return marked.parse(markdown);
}

module.exports = toHTML;
