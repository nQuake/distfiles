# Agent guidance for nQuake/distfiles

The canonical source of truth for AI coding agents working in this repo.
`CLAUDE.md` is a symlink to this file.

## What this repository is

The **distribution files of nQuake**, the QuakeWorld package. nQuake bundles
everything a newcomer needs to play (or host) QuakeWorld — the shareware game
data, the ezQuake client, replacement models and textures, community maps,
a tuned default config — so nobody has to spend hours collecting it by hand.
The installers download these files and lay them out into one game folder.

This repo holds the *files*, not an installer. Every **top-level directory is
one package**; the directory's contents are exactly the tree that lands in
the install folder when that package is chosen. There is no build step: what
you commit is what ships.

Three consumers read it:

| Consumer | How it reads this repo |
| --- | --- |
| The **web installer** ([nQuake/nquake-reborn](https://github.com/nQuake/nquake-reborn), the current one, live at https://nquake.com/nquake-reborn/) | Fetches `manifest.json` from `master`, then every file individually from `raw.githubusercontent.com` at the commit the manifest names. |
| The legacy installers (`nQuake/client-win32` NSIS `.exe`, `client-linux` / `server-linux` bash scripts, `server-docker`) | Download `<package>.zip` from the `snapshot` GitHub release (URL in `client-win32/etc/nquake.ini`) and unzip. |
| The historical mirrors (e.g. `nquake.fnu.nu`) | Synced from the release zips. |

The web installer cannot use the zips: GitHub release assets are served
without `Access-Control-Allow-Origin`, so a browser is not allowed to fetch
them. `raw.githubusercontent.com` does send that header, which is why the
manifest and per-file layout exist. **Never rely on the zips being the only
way in.**

## Layout

```
<package>/…          one directory per package (see the inventory below)
manifest.json        every file with size + sha256, grouped by package (generated)
scripts/build-manifest.mjs   the generator
.github/workflows/release.yml   on push to master: regenerate manifest, zip every
                                package, re-create the `snapshot` release
README.md            short human intro
.gitattributes       `* -text` — nothing is ever CRLF/LF-converted by git
```

## Package inventory

Sizes are raw bytes on disk (from `manifest.json`), not zip sizes. "Client"
and "Server" say which install type pulls the package.

| Package | Files | Size | What it is | Client | Server |
| --- | ---: | ---: | --- | :-: | :-: |
| `qsw106` | 16 | 19.7 MB | The Quake 1.06 **shareware** DOS release. Only `ID1/PAK0.PAK` is used (renamed to `id1/pak0.pak`); the rest is DOS junk. Redistributable. | ✓ | ✓ |
| `gpl` | 27 | 29.5 MB | GPL-licensed client bits: `id1/gpl_maps.pk3` (stand-ins for the registered maps) + `id1/readme.txt`, `ezquake/ezquake.pk3` and `ezquake/configs/` (the blank first-run `config.cfg`, sample configs), `ezquake.exe` (the **bundled Windows client**, older than upstream), `qw/skins/player_*.png`, `LICENSE`. | ✓ | |
| `non-gpl` | 496 | 110 MB | The heart of the client package: `qw/nquake.pk3`, `qw/models.pk3` (replacement models), `qw/scoreboard_flags.pk3`, `qw/autoexec.cfg` + `qw/nquake_default.cfg` (the nQuake config, see below), sounds, skins, map `.txt` info files, `readme.txt` (the nQuake FAQ). | ✓ | |
| `textures` | 1 | 21.4 MB | `qw/textures.pk3` — the standard 24-bit world textures. | ✓ (default on) | |
| `addon-textures` | 6 | 404 MB | Quake Retexturing Project hi-res packs (`qw/qrp_*.pk3`). **Contains the largest files in the repo (99 MB).** | opt | |
| `addon-fortress` | 15 | 23.4 MB | Team Fortress client files (`fortress/`). | opt | |
| `addon-clanarena` | 3 | 14.1 MB | Clan Arena client files (`arena/`, `prox/`). | opt | |
| `linux` | 3 | 1.1 MB | `ezquake/configs/platform.cfg` + `gnu.txt` for Linux, and an **obsolete** `ezquake-ubuntu-3.2.2.tar.gz` nobody should install. | ✓ (cfg only) | |
| `macosx` | 7 | 20.3 MB | `platform.cfg`, `gnu.txt`, and an old `ezQuake.app` (fallback when the upstream mirror is unavailable). | ✓ | |
| `sv-gpl` | 136 | 10.1 MB | GPL server base: `id1/` replacements (progs, sounds, `b_*` maps), `ktx/` (`port_template.cfg`, `listip.cfg`, `ban_ip.cfg`, `vip_ip.cfg`, `mvdfinish.qws`, `demos/`), `qtv/` (`qtv_template.cfg` + the QTV web page assets), `addons/install_*.sh` (legacy bash addon installers). | | ✓ |
| `sv-non-gpl` | 656 | 131 MB | Server data: `id1/progs`, `ktx/sound`, `ktx/progs`, `ktx/locs`, some `qw/maps`. | | ✓ |
| `sv-configs` | 219 | 0.7 MB | KTX configuration: `ktx/server.cfg`, `mvdsv.cfg`, `ktx.cfg`, `matchless.cfg`, `configs/usermodes/…`, `modes/`, `bots/`, `race/`. | | ✓ |
| `sv-maps-gpl` | 14 | 9.2 MB | GPL versions of the id1 deathmatch maps (`qw/maps/dm1–dm6, e2m2, e3m7, end`). | | ✓ |
| `sv-maps` | 403 | 610 MB | The community map pack (`qw/maps/*.bsp`, `.ent`, `.txt`). Optional but expected on a public server. | | opt (default on) |
| `sv-bin-x64` | 4 | 11.7 MB | Linux x86_64 binaries: `mvdsv`, `ktx/qwprogs.so`, `qtv/qtv.bin`, `qwfwd/qwfwd.bin`. | | ✓ Linux |
| `sv-bin-win32` | 4 | 13.3 MB | Windows binaries: `mvdsv.exe`, `ktx/qwprogs.dll`, `qtv/qtv.exe`, `qwfwd/qwfwd.exe`. | | ✓ Windows |
| `sv-ffa` | 7 | 13 KB | A matchless free-for-all port (`ffa/`). Configs carry `NQUAKESV_*` placeholders. | | opt |
| `sv-ca` | 21 | 0.6 MB | Clan Arena server (`cace/`, runs `qwprogs.dat`, `sv_progtype 0`). Placeholders. | | opt |
| `sv-fortress` | 192 | 85.7 MB | Team Fortress server (`fortress/`, `thundervote/`). Placeholders. | | opt |
| `sv-docker` | 4 | 358 B | `$VARIABLE`-templated cfgs for the `niclaslindstedt/nquakesv` Docker image. | | (docker) |
| `sv-win32` | 1 | 2 KB | The Windows server FAQ (`readme.txt`). | | |

There is **no macOS server binary** anywhere; MVDSV/KTX/QTV/QWFWD don't
publish them.

## Things you must know before changing files

- **Paths are a contract.** The web installer's plan
  (`nquake-reborn/src/domain/plan.ts`) names packages and some paths
  explicitly: `qsw106/ID1/PAK0.PAK`, `gpl/ezquake.exe`, `gpl/id1/gpl_maps.pk3`,
  `gpl/id1/readme.txt`, `sv-gpl/ktx/port_template.cfg`,
  `sv-gpl/qtv/qtv_template.cfg`, `sv-gpl/addons/*`, the `sv-bin-*` binaries,
  and the `linux`/`macosx` platform files. Renaming or moving any of these, or
  a package directory, needs a matching change there in the same breath. New
  files inside a package just flow through.
- **Case matters.** The installer writes paths verbatim onto case-sensitive
  file systems. `qsw106/ID1/PAK0.PAK` is uppercase on purpose (that is how
  id Software shipped it) and is the one path the installer renames.
- **Keep every file under 100 MB.** `raw.githubusercontent.com` refuses
  larger files, and the web installer has no other source. The current
  ceiling is `addon-textures/qw/qrp_maps_textures_1.pk3` at 99 MB. Split a
  bigger pk3 rather than exceeding it.
- **A browser is not allowed to create every name.** Chromium's File System
  Access API refuses `.lnk`, `.scf` and `.url` on every OS, and — only when
  the browser runs on **Windows** — every extension Safe Browsing marks
  dangerous there: `cfg`, `dll`, `ini`, `manifest`. That is most of what this
  repo ships to the client, so the web installer packs client `.cfg` files
  into `id1/configs.pk3` (and a `configs.pk3` per mod dir) and ezQuake reads
  them out of the pack. Three consequences for anything you add here:
  - A **client** config must live under `id1/`, `ezquake/`, `qw/` or a mod
    dir the installer knows (`fortress/`, `prox/`, `arena/`, `cace/`).
    Anywhere else and it cannot be packed, so a Windows web install goes back
    to making the player run a repair script by hand. A new client game dir
    needs a line in `MOD_GAMEDIRS` in `nquake-reborn/src/domain/paths.ts`.
  - Two client configs must not **strip to the same name**: the game dir is
    removed when a file goes into the pack, so `qw/configs/x.cfg` and
    `ezquake/configs/x.cfg` would both become `configs/x.cfg`. A zip can hold
    both and stay valid, but minizip reads the first and other readers the
    last, so which one a player gets would be luck.
  - A **client** `.dll`, `.ini`, `.manifest` or shortcut cannot be installed
    from a browser at all. Server-side files are exempt: a server is started
    from a script, which repairs whatever the browser could not name.
- **`scripts/check-contract.mjs` enforces all of the above**, and runs in CI
  on every pull request and before the release workflow zips anything. Run it
  yourself after adding or moving files:

  ```sh
  node scripts/check-contract.mjs
  ```

  It prints the fix for each problem. Nothing here has a build step, so a
  file that cannot be installed looks exactly like one that can until it
  reaches a player — this check is what makes the difference.
- **No zips, no archives inside packages.** The browser writes files
  directly; anything archived would just sit there. (The `linux` tarball is
  a legacy leftover the installer skips.)
- **`* -text` in `.gitattributes`.** Binary paks/pk3s and CRLF cfgs are
  stored byte-for-byte. Do not "normalise" line endings; ezQuake and MVDSV
  read both.
- **Text templates.** Server cfgs in `sv-ffa`, `sv-ca`, `sv-fortress` carry
  `NQUAKESV_HOSTNAME`, `NQUAKESV_ADMIN`, `NQUAKESV_IP`, `NQUAKESV_PORT`; the
  installers substitute them. `sv-gpl/ktx/port_template.cfg` and
  `sv-gpl/qtv/qtv_template.cfg` end with a `// generated` marker after which
  the installers append the per-install lines. `sv-docker` uses `$SHELL_VARS`
  instead. Keep those conventions when editing or adding such files.
- **The nQuake config mechanism** (why `gpl/ezquake/configs/config.cfg` is
  almost empty): it only sets `_nquake_first_startup 1`. `non-gpl/qw/autoexec.cfg`
  execs `configs/config.cfg`, then, on that first run only,
  `nquake_default.cfg` and `configs/preset.cfg` (the installer writes
  `preset.cfg` with the user's name, mouse and keys). `cfg_save_onquit` then
  saves the merged result to `config.cfg` and the defaults are never loaded
  again. Don't put per-user values anywhere but `preset.cfg` — with one
  deliberate exception, worth knowing before you "fix" it. `cl_fakename` is
  set to `"pla"` here, and that is not a leftover: ezQuake rewrites every
  `say_team` as `<cl_fakename><suffix><message>` (`cl_cmd.c`, `CL_Say_f`), so
  a short fakename is how a team message spends its width on the message
  rather than on a nick. `"pla"` is the abbreviation of ezQuake's default
  `name "player"`. What it cannot do is follow a player who renames
  themselves — no name cvar feeds it — so team chat reads `PLA: …` until
  something overwrites it, and the installer, which is the only part of
  nQuake that knows the player's name, writes it into `preset.cfg`. The
  default stays for everyone who never runs the installer, with a comment in
  the file saying what it does.
- **Licensing split is deliberate.** `gpl`/`sv-gpl`/`sv-maps-gpl` hold only
  GPL-compatible content; `non-gpl`/`sv-non-gpl` hold community assets with
  other terms; `qsw106` is the id shareware licence. Put new files in the
  matching bucket. `pak1.pak` (registered Quake) is **never** here; the
  installers copy it from the user's own Quake.

## The release workflow

`.github/workflows/release.yml`, on every push to `master`:

1. `node scripts/build-manifest.mjs` regenerates `manifest.json` and commits
   it (`chore: update manifest.json`) if anything changed. `paths-ignore:
   manifest.json` stops that commit from re-triggering the workflow; a push
   made with `GITHUB_TOKEN` wouldn't retrigger anyway.
2. Zips every top-level directory into `<name>.zip`.
3. Deletes and re-creates the `snapshot` tag and release and uploads the zips.

So the manifest on `master` always describes the commit **before** its own
`chore:` commit, and the installer fetches files at exactly that commit
(`manifest.commit`), so a manifest and the bytes it lists can never disagree.
`node scripts/build-manifest.mjs --check` exits 1 when the manifest is stale;
run it locally after moving files if you want to see the effect before CI.

Hashing 1.6 GB takes about 15 s locally; the manifest is ~350 KB.

### `manifest.json` shape

```json
{
  "schema": 1,
  "generated": "<ISO timestamp>",
  "commit": "<sha the files were hashed at>",
  "packages": {
    "<dir>": { "bytes": 123, "files": [ { "path": "id1/gpl_maps.pk3", "size": 123, "sha256": "…" } ] }
  }
}
```

`path` is relative to the package directory, forward slashes, sorted. Bump
`schema` (and `nquake-reborn/src/domain/manifest.ts`) if the shape changes;
the installer rejects unknown schemas rather than guessing.

## Legacy metadata still in use

`client-win32/etc/nquake.ini` lists per-package zip sizes, mirror URLs and
installer version numbers for the old NSIS/bash installers. The web installer
ignores it. If a package's size changes materially, that file is where the
legacy installers' progress bars get their numbers.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `chore:`), PRs squash-merge.
- Commit content as it was received upstream first, then a second commit
  with the intended change, so a revert to the original is one step (the
  README's long-standing rule).
- After merging a content change, the web installer picks it up on the next
  run of `release.yml` with no deploy on its side.
