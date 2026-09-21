#!/usr/bin/env node
// Enforces the rules AGENTS.md states in prose, so a change that would break
// an install fails here rather than in somebody's game folder.
//
// This repo has no build step: what you commit is what ships, straight to a
// browser through raw.githubusercontent.com. That makes it easy to add a file
// that looks fine in git and cannot be installed at all — the web installer
// found three such cases the hard way, and every one of them reached a player
// before it reached a test.
//
// Run from the repository root:
//
//   node scripts/check-contract.mjs
//
// Exits non-zero, listing every problem, with the fix for each.
//
// The rules below come from Chromium and from ezQuake/MVDSV, not from the
// installer's preferences, which is why they can live here without tracking
// nquake-reborn: they change when a browser or an engine changes. The deeper
// per-option audit still lives there
// (`.agents/skills/debug/scripts/audit-catalog.mjs`) and sees things this
// cannot, like which packages a given set of wizard answers actually pulls.

import { readdir, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const SKIP_DIRS = new Set([".git", ".github", "scripts", "node_modules"]);

// raw.githubusercontent.com refuses anything larger, and the web installer has
// no other source — release zips are unreachable from a browser (no CORS).
const RAW_LIMIT = 100 * 1024 * 1024;

// Chromium's File System Access API refuses these outright, on every OS
// (`IsSafePathComponent`): a .url can be made to read arbitrary files, a .lnk
// or .scf to execute code. Nothing in nQuake reads one, so the web installer
// leaves them out of the install entirely and tells the player so.
const SHORTCUT_EXTENSIONS = new Set(["lnk", "scf", "url"]);

// Refused as well, but only when the browser runs on Windows: Safe Browsing's
// download_file_types.asciipb marks them DANGEROUS there. `.cfg` is the one
// that matters — it is most of what this repo ships to the client.
const WINDOWS_BLOCKED_EXTENSIONS = new Set(["cfg", "dll", "ini", "manifest"]);

// Game dirs ezQuake always has in its search path. A client .cfg under one of
// these can be packed into id1/configs.pk3, which is how a Windows web
// install gets configs it is not allowed to write loose.
const CORE_GAMEDIRS = ["id1", "ezquake", "qw"];

// Client mod dirs, each of which gets its own configs.pk3. Adding a client
// game dir here means adding it to MOD_GAMEDIRS in
// nquake-reborn/src/domain/paths.ts as well, or its configs fall back to a
// repair script the player has to run by hand.
const CLIENT_MOD_GAMEDIRS = ["fortress", "prox", "arena", "cace"];

// Packages a client install pulls, and which platform pulls them — `linux`
// and `macosx` are alternatives, so a file in one never meets a file in the
// other and the two `ezquake/configs/platform.cfg` are not a clash.
//
// `qsw106` is deliberately absent: the installer takes `ID1/PAK0.PAK` out of
// it and nothing else, so the DOS installer's stray `.DLL`s never reach a
// game folder. Everything not listed is server-side, where none of these
// rules apply — a server is started from a script that can repair whatever
// the browser could not name.
const CLIENT_PACKAGES = {
  gpl: "any",
  "non-gpl": "any",
  textures: "any",
  "addon-textures": "any",
  "addon-fortress": "any",
  "addon-clanarena": "any",
  linux: "linux",
  macosx: "macos",
};
const PLATFORMS = ["windows", "linux", "macos"];

// Paths the installer's plan names explicitly (nquake-reborn/src/domain/
// plan.ts). Renaming or moving one needs a matching change there.
const CONTRACT_PATHS = [
  "qsw106/ID1/PAK0.PAK",
  "gpl/ezquake.exe",
  "gpl/id1/gpl_maps.pk3",
  "gpl/id1/readme.txt",
  "gpl/ezquake/configs/config.cfg",
  "non-gpl/qw/autoexec.cfg",
  "non-gpl/qw/nquake_default.cfg",
  "sv-gpl/ktx/port_template.cfg",
  "sv-gpl/qtv/qtv_template.cfg",
];

// The one shortcut this repo has always shipped. Listed so the check reports
// *new* ones; this file is simply left out of web installs.
const KNOWN_SHORTCUTS = new Set(["gpl/ezquake/Online Manual.url"]);

const problems = [];
const fail = (path, what, fix) => problems.push({ path, what, fix });

function extensionOf(name) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (dir === ROOT && SKIP_DIRS.has(entry.name)) continue;
      await walk(join(dir, entry.name), out);
    } else if (entry.isFile()) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

const files = (await walk(ROOT)).map((f) =>
  relative(ROOT, f).split(sep).join("/"),
);
const present = new Set(files);
// Top-level files (README.md, manifest.json…) are not package content.
const packaged = files.filter((f) => f.includes("/"));

for (const path of CONTRACT_PATHS) {
  if (present.has(path)) continue;
  fail(
    path,
    "a path the installer names explicitly is missing",
    "restore it, or change nquake-reborn/src/domain/plan.ts in the same breath",
  );
}

// archive entry -> the file that claimed it, one map per platform, since a
// file only clashes with another the same install would also write.
const entries = new Map(PLATFORMS.map((p) => [p, new Map()]));

for (const path of packaged) {
  const [pkg, ...rest] = path.split("/");
  const name = rest[rest.length - 1];
  const ext = extensionOf(name);
  const on = CLIENT_PACKAGES[pkg];
  const client = on !== undefined;

  const size = (await stat(join(ROOT, path))).size;
  if (size > RAW_LIMIT) {
    fail(
      path,
      `${(size / 1024 / 1024).toFixed(1)} MB is over raw.githubusercontent.com's 100 MB limit`,
      "split it — the web installer has no other way to fetch a file",
    );
  }

  if (SHORTCUT_EXTENSIONS.has(ext) && !KNOWN_SHORTCUTS.has(path)) {
    fail(
      path,
      `a browser is not allowed to create a .${ext} file, on any OS`,
      "ship the information some other way — a .txt, or a line in a readme",
    );
  }

  if (!client) continue;

  // A client file a browser on Windows cannot name has to be packable into a
  // pk3, or the install needs a batch file again.
  if (WINDOWS_BLOCKED_EXTENSIONS.has(ext) && ext !== "cfg") {
    fail(
      path,
      `a browser on Windows cannot create a .${ext} file, and only .cfg can be packed into a pk3`,
      "move it server-side, or give it an extension Safe Browsing does not flag",
    );
  }

  if (ext !== "cfg") continue;

  const gamedir = rest.length > 1 ? rest[0] : null;
  const known =
    gamedir !== null &&
    (CORE_GAMEDIRS.includes(gamedir) || CLIENT_MOD_GAMEDIRS.includes(gamedir));
  if (!known) {
    fail(
      path,
      `a client config in "${gamedir ?? "the package root"}", which the installer cannot pack`,
      "add the game dir to MOD_GAMEDIRS in nquake-reborn/src/domain/paths.ts," +
        " or a Windows web install will need nquake-finish.bat again",
    );
    continue;
  }

  // Entries in a pack resolve against the game dir the pack sits in, so the
  // game dir is stripped. Two configs that strip to the same entry inside one
  // archive are ambiguous: minizip reads the first, other readers the last.
  const archive = CORE_GAMEDIRS.includes(gamedir)
    ? "id1/configs.pk3"
    : `${gamedir}/configs.pk3`;
  const key = `${archive} :: ${rest.slice(1).join("/")}`;
  for (const platform of PLATFORMS) {
    if (on !== "any" && on !== platform) continue;
    const claimed = entries.get(platform);
    if (claimed.has(key)) {
      fail(
        path,
        `on ${platform}, packs to the same entry as ${claimed.get(key)} (${key})`,
        "rename one — a zip may hold both names but readers disagree which wins",
      );
    } else {
      claimed.set(key, path);
    }
  }
}

if (problems.length) {
  console.error(
    `\n${problems.length} problem(s) with the install contract (see AGENTS.md):\n`,
  );
  for (const p of problems) {
    console.error(`  ${p.path}`);
    console.error(`      ${p.what}`);
    console.error(`      fix: ${p.fix}\n`);
  }
  process.exit(1);
}

console.log(
  `install contract OK — ${packaged.length} packaged files; ` +
    PLATFORMS.map((p) => `${p}: ${entries.get(p).size} client configs`).join(
      ", ",
    ) +
    ", all packable and uniquely named",
);
