// Rebuilds sw.js: the list of files to keep offline and a version that changes with their content.
// Run after any change to the diary:  node tools/build-sw.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, sep } from "node:path";
const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const walk = d => readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = ["index.html", "manifest.webmanifest", ...walk(join(root, "assets")).map(p => relative(root, p).split(sep).join("/"))]
  .filter(f => !f.endsWith("_boxes.json"));
const h = createHash("sha256");
for (const f of files) h.update(f).update(readFileSync(join(root, f)));
const version = h.digest("hex").slice(0, 12);
const tpl = readFileSync(join(root, "tools", "sw.template.js"), "utf8");
writeFileSync(join(root, "sw.js"), tpl.replace("__VERSION__", version).replace("__FILES__", JSON.stringify(["./", ...files], null, 1)));
console.log(`sw.js: ${files.length} files, version ${version}`);
