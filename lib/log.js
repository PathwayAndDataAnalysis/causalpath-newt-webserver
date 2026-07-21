const MAX_LOG_LENGTH = 300;

const compact = function (value, maxLength = MAX_LOG_LENGTH) {
    if (value === undefined || value === null) return "";

    let text = value instanceof Error ? value.message : String(value);
    text = text.replace(/\s+/g, " ").trim();

    if (text.length <= maxLength) return text;
    return text.slice(0, Math.max(0, maxLength - 1)) + "…";
};

const error = function (context, value) {
    let message = compact(value);
    console.error(message ? context + ": " + message : context);
};

module.exports = {compact, error};
