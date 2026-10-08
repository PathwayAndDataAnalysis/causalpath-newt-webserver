# CausalPath Newt Webserver

CausalPath Newt Webserver is the web interface for running
[CausalPath](https://github.com/PathwayAndDataAnalysis/causalpath) analyses and
exploring their molecular interaction networks in the Newt graph editor.

The hosted application is available at
[causalpath.cs.umb.edu](https://causalpath.cs.umb.edu/).

## Features

- Submit a ZIP archive containing CausalPath input files.
- Reopen results from an existing analysis directory.
- Explore bundled example networks from previous studies.
- Inspect and edit networks with Newt's layout, query, experiment, and SBGN
  tools.

## Requirements

- [Node.js 24 LTS](https://nodejs.org/) (`>=24 <25`)
- npm 11 or newer
- Java 11 or newer for running the CausalPath JAR
- `unzip` for extracting submitted analyses

The repository includes `.nvmrc` and `.node-version` files so supported Node
version managers can select the correct runtime automatically.

On Debian or Ubuntu, the non-Node runtime dependencies can be installed with:

```bash
sudo apt-get update
sudo apt-get install openjdk-11-jdk unzip
```

## Installation

Clone the repository and install the exact dependency versions recorded in
`package-lock.json`:

```bash
git clone https://github.com/PathwayAndDataAnalysis/causalpath-newt-webserver.git
cd causalpath-newt-webserver
nvm install
nvm use
npm ci
```

If you do not use [nvm](https://github.com/nvm-sh/nvm), install Node.js 24 LTS
with your preferred Node version manager or the official Node.js installer,
then run `npm ci`.

Verify the active runtime when troubleshooting an installation:

```bash
node --version
npm --version
```

The Node version should begin with `v24` and the npm version should be 11 or
newer.

Before submitting analyses, place your CausalPath JAR at `jar/causalpath.jar`.
Create the `jar/` directory if needed. The JAR is not tracked by Git on this
branch and must be supplied separately; `.gitignore` prevents it from being
committed accidentally.

## Running the application

Build the browser assets and start the server:

```bash
npm start
```

The application is available at [http://localhost:3000](http://localhost:3000)
by default. To use another port:

```bash
PORT=4000 npm start
```

For development with automatic server restarts:

```bash
npm run dev
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Build all assets and start the Express server. |
| `npm run dev` | Build all assets and start the server with Nodemon. |
| `npm run build` | Build the CSS and JavaScript browser bundles. |
| `npm run bundle:css` | Build `public/build/bundle.css` with PostCSS. |
| `npm run watch:css` | Rebuild the CSS bundle when source files change. |
| `npm run bundle-js` | Build `public/build/newt-bundle.js` with Browserify. |
| `npm test` | Run the Node.js test suite. |

## Using the application

The landing page provides three workflows:

1. **Load input files for analysis** — prepare the files according to the
   [CausalPath input guide](https://github.com/PathwayAndDataAnalysis/causalpath/blob/master/wiki/InputFormat.md),
   place them at the root of a ZIP archive, and upload the archive.
2. **View results from a previous analysis** — select the root directory of a
   completed analysis.
3. **Display demo graphs** — load one of the bundled sample networks.

In the analysis workspace, double-click a network filename in the left sidebar
to open it in the graph editor.

## Development notes

- Use `npm ci` for clean, reproducible installs. It respects the npm v11 lockfile
  without rewriting dependency versions.
- The Cytoscape, SBGNViz, libSBGN, and related graph packages are pinned to
  tested commits because this application depends on project-specific legacy
  behavior. Update them only with focused graph loading and editing tests.
- `.npmrc` enables legacy peer-dependency resolution for SBGNViz's historical,
  non-semver Cytoscape peer declaration.
- Server-side HTTP requests use the `fetch` API built into Node.js 24; no
  separate request client is required.

## Testing changes

Before opening a pull request, run:

```bash
npm test
npm run build
```

The tests cover the main server routes and the safe nested-object utilities
used by the graph editor. For graph-related changes, also open a bundled demo
network and verify that it renders and remains editable.

## Project structure

| Path | Purpose |
| --- | --- |
| `server/` | HTTP server entry point and startup handling. |
| `lib/` | Express routes and analysis execution logic. |
| `views/` | Server-rendered application pages. |
| `public/javascript/` | Browser application and Newt integration. |
| `public/stylesheets/` | Source styles bundled by PostCSS. |
| `public/build/` | Generated browser bundles. |
| `samples/` | Demo analysis networks. |
| `jar/` | Locally supplied CausalPath Java application (not tracked by Git). |
| `test/` | Node.js test suite. |

## Contact

For questions or comments, email
[causalpath@cs.umb.edu](mailto:causalpath@cs.umb.edu).

See [LICENSE](LICENSE) for the repository's license terms.
