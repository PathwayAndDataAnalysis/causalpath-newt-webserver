const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {after, before, test} = require("node:test");

const app = require("../app");

let baseUrl;
let server;

before(async () => {
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });

    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
    if (!server || !server.listening) return;
    await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
    });
});

test("serves the CausalPath landing page", async () => {
    const response = await fetch(`${baseUrl}/`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /CausalPath works on a set of molecular profiles/);
    assert.match(body, /id="analysis-progress-overlay"[^>]*hidden/);
    assert.match(body, /id="analysis-progress-track"[\s\S]*role="progressbar"/);
    assert.match(body, /id="analysis-progress-status"/);
    assert.match(body, /id="download-results-container"[^>]*hidden/);
    assert.match(body, /id="download-results-button"[\s\S]*Download results/);
});

test("lists bundled demo graphs", async () => {
    const response = await fetch(`${baseUrl}/api/displayDemoGraphs`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /HRD-tumors\.nwt/);
});

test("downloads zipped analysis results for a completed analysis session", async () => {
    const sessionId = "test-download-session-" + Date.now();
    const analysisRoot = path.resolve("./analysisOut");
    const sessionDir = path.join(analysisRoot, sessionId);
    const zipPath = path.join(analysisRoot, `${sessionId}-results.zip`);

    await fs.promises.mkdir(path.join(sessionDir, "subfolder"), {recursive: true});
    await fs.promises.writeFile(path.join(sessionDir, "parameters.txt"), "proteomics-values-file = data.txt\n");
    await fs.promises.writeFile(path.join(sessionDir, "causative.sif"), "A\tphosphorylates\tB\n");
    await fs.promises.writeFile(path.join(sessionDir, "subfolder", "results.txt"), "result-row\n");

    try {
        const response = await fetch(`${baseUrl}/api/downloadResults/${sessionId}?name=sample-run`);
        const buffer = Buffer.from(await response.arrayBuffer());

        assert.equal(response.status, 200);
        assert.match(response.headers.get("content-disposition") || "", /sample-run-results\.zip/);
        // PK\x03\x04 ZIP magic header
        assert.equal(buffer.subarray(0, 4).toString("binary"), "PK\x03\x04");
        assert.ok(buffer.includes(Buffer.from("causative.sif")));
        assert.ok(buffer.includes(Buffer.from("subfolder/results.txt")));
    } finally {
        await fs.promises.rm(sessionDir, {recursive: true, force: true});
        await fs.promises.rm(zipPath, {force: true});
    }
});

test("returns 404 when downloading results for a non-existent session", async () => {
    const response = await fetch(`${baseUrl}/api/downloadResults/non-existent-session-id`);

    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.code, "RESULTS_NOT_FOUND");
});

test("returns JSON for unknown API routes", async () => {
    const response = await fetch(`${baseUrl}/api/not-a-route`);

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), {error: "Not Found"});
});
