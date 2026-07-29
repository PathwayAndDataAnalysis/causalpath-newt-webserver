const blockedKeys = new Set(['__proto__', 'constructor', 'prototype']);

function getPathParts(path) {
    if (Array.isArray(path)) return path;
    return String(path).split('.').filter(Boolean);
}

function assertSafePath(parts) {
    for (const part of parts) {
        if (blockedKeys.has(part)) {
            throw new Error('Unsafe object path');
        }
    }
}

exports.get = function (object, path) {
    const parts = getPathParts(path);
    assertSafePath(parts);

    return parts.reduce((value, part) => {
        if (value === undefined || value === null) return undefined;
        return value[part];
    }, object);
};

exports.set = function (object, path, nextValue) {
    const parts = getPathParts(path);
    assertSafePath(parts);

    if (parts.length === 0) return object;

    let target = object;
    for (let index = 0; index < parts.length - 1; index++) {
        const part = parts[index];
        const currentValue = target[part];

        if (currentValue === undefined || currentValue === null) {
            target[part] = {};
        } else if (typeof currentValue !== 'object') {
            throw new TypeError('Cannot set a nested property on a non-object value');
        }

        target = target[part];
    }

    target[parts[parts.length - 1]] = nextValue;
    return object;
};
