const assert = require("node:assert/strict");
const test = require("node:test");

const objectPath = require("../public/javascript/newt/object-path");

test("gets and sets nested values", () => {
    const value = {currentGeneralProperties: {mapName: "Before"}};

    assert.equal(objectPath.get(value, "currentGeneralProperties.mapName"), "Before");
    objectPath.set(value, "currentGeneralProperties.mapName", "After");
    assert.equal(value.currentGeneralProperties.mapName, "After");
});

test("creates missing nested objects", () => {
    const value = {};

    objectPath.set(value, "currentGeneralProperties.mapName", "CausalPath");
    assert.deepEqual(value, {currentGeneralProperties: {mapName: "CausalPath"}});
});

test("rejects prototype-polluting paths", () => {
    assert.throws(() => objectPath.set({}, "__proto__.polluted", true), /Unsafe object path/);
    assert.equal({}.polluted, undefined);
});
