/**
 * @typedef {import("marked").Renderer} Renderer
 * @typedef {import("path").ParsedPath} ParsedPath
 * @typedef {import("handlebars").HelperDelegate} HelperDelegate
 */

const { readFile, writeFile, mkdir } = require("fs/promises");
const { Glob } = require("glob");
const { join, dirname, parse } = require("path");
const { cwd } = process;
const toHTML = require("./to-html");
const handlerbars = require("handlebars");

class Builder {
  constructor() {
    /**
     * @private
     * @type {Glob<any> | null}
     */
    this._globMarkdown = null;

    /**
     * @private
     * @type {string | null}
     */
    this._outDir = null;

    /**
     * @private
     * @type {Renderer | undefined}
     */
    this._renderer = undefined;

    /**
     * @private
     * @type {(filename: string) => string}
     */
    this._filenameMapper = (filename) => filename;

    /**
     * @type {HelperDelegate}
     */
    this._template = handlerbars.compile("{{markdown}}");
  }

  /**
   * @param {string} pattern
   * @returns {this}
   */
  markdowns(pattern) {
    this._globMarkdown = new Glob(pattern, {});
    return this;
  }

  /**
   * @param {string} outDir
   * @returns {this}
   */
  outDir(outDir) {
    this._outDir = outDir;
    return this;
  }

  /**
   * @param {Renderer} renderer
   * @returns {this}
   */
  renderer(renderer) {
    this._renderer = renderer;
    return this;
  }

  /**
   * @param {(filename: string) => string} mapper
   */
  mapFilename(mapper) {
    this._filenameMapper = mapper;
    return this;
  }

  /**
   * @param {string} template
   */
  template(template) {
    this._template = handlerbars.compile(template);
    return this;
  }

  /**
   * @private
   * @param {string} input
   * @param {string} output
   * @returns {Promise<void>}
   */
  async buildMarkdown(input, output) {
    const inputAbs = join(cwd(), input);
    if (!this._outDir) {
      throw new Error("Unexpected empty outDir");
    }
    const outputAbs = join(cwd(), this._outDir, output);
    const markdown = await readFile(inputAbs, { encoding: "utf-8" });
    const markdownHTML = await toHTML(markdown, this._renderer);
    const html = this._template({ markdown: markdownHTML });
    await mkdir(dirname(outputAbs), { recursive: true });
    await writeFile(outputAbs, html);
  }

  async build() {
    if (!this._globMarkdown) {
      throw new Error("Unexpected empty input");
    }
    for (const markdownPath of this._globMarkdown) {
      if (typeof markdownPath === "string") {
        const parsed = parse(markdownPath);
        await this.buildMarkdown(
          markdownPath,
          join(parsed.dir, this._filenameMapper(parsed.name) + ".html")
        );
      }
    }
  }
}

module.exports = Builder;
