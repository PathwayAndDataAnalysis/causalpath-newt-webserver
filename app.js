const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const app = express();
const api = require("./lib/api");
const log = require("./lib/log");

logger.token("short-url", (req) => log.compact(req.originalUrl, 200));

// init middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(logger(":method :short-url :status :response-time ms", {
	skip: (req, res) => res.statusCode < 400,
}));
app.use(cookieParser());
app.use("/api", api);

// init static folder
app.use(express.static(path.join(__dirname, "/public")));

// libsbml.js resolves its WebAssembly binary relative to the page URL.
app.get("/libsbml.wasm", (req, res) => {
	res.type("application/wasm");
	res.sendFile(path.join(__dirname, "node_modules/libsbmljs_stable/libsbml.wasm"));
});

// user bootstrap styles
app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use("/js", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));
app.use("/js", express.static(path.join(__dirname, "node_modules/jquery/dist")));
app.use("/js", express.static(path.join(__dirname, "node_modules/jquery/dist/jquery.min.js")));

// init routers
/* GET home page. */
app.get("/", (req, res, next) => {
	res.sendFile(path.join(__dirname, "views/index.html"));
});

// end point
app.post("/api/submitFolders", (req, res, next) => {
	res.sendStatus(204);
});

app.get("/node_modules/cytoscape-node-editing/resizeCue.svg", (req, res) => {
	res.sendFile(path.join(__dirname, "node_modules/cytoscape-node-editing/resizeCue.svg"));
});

// Return a response directly because this application does not configure a view engine.
app.use(function (req, res) {
	if (req.path.startsWith("/api/")) {
		res.status(404).json({error: "Not Found"});
		return;
	}

	res.status(404).type("text/plain").send("Not Found");
});

// error handler
app.use(function (err, req, res, next) {
	if (res.headersSent) {
		next(err);
		return;
	}

	let status = err.status || 500;
	let message = status >= 500 ? "Internal Server Error" : err.message;
	log.error(req.method + " " + log.compact(req.originalUrl, 200) + " failed", err);

	if (req.path.startsWith("/api/")) {
		res.status(status).json({error: message});
		return;
	}

	res.status(status).type("text/plain").send(message);
});

module.exports = app;
