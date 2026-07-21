const assert = require("node:assert/strict");
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
});

test("lists bundled demo graphs", async () => {
    const response = await fetch(`${baseUrl}/api/displayDemoGraphs`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /HRD-tumors\.nwt/);
});

test("returns JSON for unknown API routes", async () => {
    const response = await fetch(`${baseUrl}/api/not-a-route`);

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), {error: "Not Found"});
});
