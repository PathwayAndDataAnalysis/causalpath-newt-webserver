const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const createError = require("http-errors");
const app = express();
const api = require("./lib/api");

// view engine setup
app.set("views", path.join(__dirname, "views"));
// app.set('view engine', "ejs");

// init middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(cors({ origin: true, credentials: true }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api", api);

// init static folder
app.use(express.static(path.join(__dirname, "/public")));

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
	console.log("/api/submitFolders");
	console.log(req.body);
});

app.get("/node_modules/cytoscape-node-editing/resizeCue.svg", (req, res) => {
	res.sendFile(path.join(__dirname, "node_modules/cytoscape-node-editing/resizeCue.svg"));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
