#!/usr/bin/env node
// Writes manifest.json: every distribution file in this repository, grouped
// by package (the top-level directories that release.yml zips), with its
// byte size and sha256.
//
// The web installer (nQuake/nquake-reborn) reads this manifest and then
// fetches each file straight from raw.githubusercontent.com, which serves
// repository files with `Access-Control-Allow-Origin: *`. GitHub release
// assets do not send that header, so a browser cannot download the zips —
// the manifest is what makes a zip-free, per-file install possible.
//
// Run from the repository root:
//
//   node scripts/build-manifest.mjs            # writes ./manifest.json
//   node scripts/build-manifest.mjs --check    # exit 1 if manifest.json is stale
//
// Shape:
//
//   {
//     "schema": 1,
//     "generated": "<ISO timestamp>",
//     "commit": "<sha the files were hashed at, or null>",
//     "packages": {
//       "<dir>": { "bytes": <total>, "files": [ { "path", "size", "sha256" } ] }
//     }
//   }
//
// `path` is relative to the package directory and uses forward slashes.
// Files are sorted by path so the output is deterministic.

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { execSync } from "node:child_process";
import process from "node:process";

const ROOT = process.cwd();
const OUT = join(ROOT, "manifest.json");
// Top-level entries that are not distribution packages.
const SKIP = new Set([".git", ".github", "scripts", "node_modules"]);

async function sha256(file) {
  return new Promise((resolve, reject) => {
    const h = createHash("sha256");
    createReadStream(file)
      .on("data", (c) => h.update(c))
      .on("end", () => resolve(h.digest("hex")))
      .on("error", reject);
  });
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === ".DS_Store" || entry.name === ".gitkeep") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function gitCommit() {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

async function build() {
  const packages = {};
  const dirs = (await readdir(ROOT, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && !SKIP.has(e.name) && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
  for (const pkg of dirs) {
    const files = [];
    let bytes = 0;
    const list = (await walk(join(ROOT, pkg))).sort();
    for (const file of list) {
      const { size } = await stat(file);
      const path = relative(join(ROOT, pkg), file).split(sep).join("/");
      files.push({ path, size, sha256: await sha256(file) });
      bytes += size;
    }
    packages[pkg] = { bytes, files };
    console.error(`${pkg}: ${files.length} files, ${bytes} bytes`);
  }
  return {
    schema: 1,
    generated: new Date().toISOString(),
    commit: gitCommit(),
    packages,
  };
}

// Compare everything except the volatile `generated` / `commit` fields.
function stable(manifest) {
  return JSON.stringify(manifest.packages);
}

const manifest = await build();
if (process.argv.includes("--check")) {
  let current;
  try {
    current = JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    console.error("manifest.json is missing");
    process.exit(1);
  }
  if (stable(current) !== stable(manifest)) {
    console.error("manifest.json is stale — run `node scripts/build-manifest.mjs`");
    process.exit(1);
  }
  console.error("manifest.json is up to date");
} else {
  await writeFile(OUT, JSON.stringify(manifest, null, 1) + "\n");
  console.error(`wrote ${relative(ROOT, OUT)}`);
}
