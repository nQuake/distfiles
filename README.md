# nQuake distribution files

This repository contains the files needed by the nQuake client and server setup. The files will automatically sync to the nQuake mirrors every 10 minutes. If a file is missing from this repository but present @ https://nquake.fnu.nu/, download the original file from there, upload it to this repository as-is (so that reverting is easy), and then commit an update to the file with the desired changes. The change will then propagate to all the mirrors.

## manifest.json

`manifest.json` lists every file in this repository (grouped by package
directory) with its byte size and sha256. The [nQuake web
installer](https://github.com/nQuake/nquake-reborn) reads it and downloads
each file straight from `raw.githubusercontent.com`, which — unlike GitHub
release assets — serves files with CORS headers a browser accepts.

It is regenerated and committed by the release workflow on every push to
`master`. To refresh it locally:

```sh
node scripts/build-manifest.mjs          # writes manifest.json
node scripts/build-manifest.mjs --check  # exit 1 if it is stale
```

Files larger than 100 MB cannot be served by `raw.githubusercontent.com`;
keep individual files under that limit (the largest today is 99 MB).
