const { readFileSync } = require("fs");
const Builder = require("./builder");
const path = require("path");

const blogTemplate = readFileSync(
  path.join(__dirname, "./templates/dev-blog.html"),
  "utf-8"
);

/**
 * @param {string} filename
 * @returns {string}
 */
function mapFilename(filename) {
  if (filename === "README") return "index";
  return filename;
}

function build() {
  new Builder()
    .markdowns("dev-blog/**/*.md")
    .template(blogTemplate)
    .mapFilename(mapFilename)
    .outDir("out")
    .build();
}

build();
