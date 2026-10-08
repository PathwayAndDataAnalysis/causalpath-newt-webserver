const fs = require("fs");
const express = require("express");
const path = require("node:path");
const {randomUUID} = require("node:crypto");
const {AnalysisError, runProcess, analyzeFiles} = require("./analysis");
const log = require("./log");
let router = express.Router();
let queue = require("queue");
let jobQueue = queue({concurrency: 5, autostart: true});

const sendStatus = (statusCode, res, err) => {
    if (err) log.error("API request failed", err);
    if (err instanceof AnalysisError) {
        res.status(err.status).json(err.response);
    } else {
        res.status(statusCode).json({error: "The server could not complete this request. Please try again."});
    }
};

router.post("/getJsonAtPath", function (req, res) {
    let {dir, file} = req.body;

    let sendStatus500 = (err) => sendStatus(500, res, err);

    try {
        if (!fs.existsSync(dir)) {
            res.status(400).send("File does not exist");
        } else {
            //Return the json file from the analysis directory to the client
            let fileName = dir.split("/")[dir.split("/").length - 1];
            let fileContentSif = readJsonFile(dir);
            let fileContentFormat = readJsonFile(dir.replace(".sif", ".format"));
            res.status(200);
            res.send(fileName + "||||" + fileContentSif + "||||" + fileContentFormat);
        }
    } catch (error) {
        sendStatus500(error);
    }
});

const readJsonFile = function (filePath) {
    return fs.readFileSync(filePath, "utf-8");
};

async function createAnalysisDirectory() {
    await fs.promises.mkdir("./analysisOut", {recursive: true});
    // The server owns the run ID. Reserve a new directory without reusing an
    // existing run, even when an older client sends the same room repeatedly.
    while (true) {
        const room = randomUUID();
        try {
            await fs.promises.mkdir("./analysisOut/" + room);
            return room;
        } catch (error) {
            if (error.code !== "EEXIST") throw error;
        }
    }
}

function queueAnalysis(room, res) {
    jobQueue.push(() => analyzeFiles(room)
        .then((dirStr) => res.status(200).send(dirStr))
        .catch((error) => sendStatus(500, res, error)));
}

function uploadError(message, error) {
    return new AnalysisError(message, {code: "UPLOAD_FAILED", details: error.message});
}

// Client sends analysis files in a zip file.
router.post("/analysisZip", async function (req, res) {
    res.setTimeout(500000);
    try {
        const {fileContent} = req.body;
        if (typeof fileContent !== "string" || !fileContent.length) {
            throw new AnalysisError("The uploaded ZIP archive is empty or missing. Select a ZIP archive containing your input files.",
                {status: 400, code: "EMPTY_UPLOAD"});
        }

        let room;
        try {
            room = await createAnalysisDirectory();
            await fs.promises.writeFile("./analysisOut/" + room + ".zip", fileContent, {encoding: "binary", flag: "wx"});
        } catch (error) {
            throw uploadError("The server could not save the uploaded ZIP archive. Please try again.", error);
        }
        await runProcess("unzip", ["-o", "./analysisOut/" + room + ".zip", "-d", "./analysisOut/" + room],
            "The ZIP archive could not be extracted. Check that it is a valid ZIP archive; if it is, ask the server administrator to check the extraction tools and storage.",
            "EXTRACTION_FAILED");
        queueAnalysis(room, res);
    } catch (error) {
        sendStatus(500, res, error);
    }
});

// Client sends analysis files in an array.
router.post("/analysisDir", async function (req, res) {
    res.setTimeout(1000000);
    try {
        const {inputFiles} = req.body;
        if (!Array.isArray(inputFiles) || !inputFiles.length) {
            throw new AnalysisError("No analysis input files were uploaded. Include parameters.txt and the data files it references.",
                {status: 400, code: "EMPTY_UPLOAD"});
        }
        for (const file of inputFiles) {
            if (!file || typeof file.name !== "string" || !file.name ||
                path.isAbsolute(file.name) || file.name.split(/[\\/]/).includes("..") ||
                typeof file.content !== "string") {
                throw new AnalysisError("An uploaded file has an invalid name or content. Use relative file names within the analysis folder.",
                    {status: 400, code: "INVALID_INPUT_FILE"});
            }
        }
        let room;
        try {
            room = await createAnalysisDirectory();
        } catch (error) {
            throw uploadError("The server could not create a folder for this analysis. Please try again.", error);
        }
        const dir = "./analysisOut/" + room;
        for (const file of inputFiles) {
            try {
                const destination = path.join(dir, file.name);
                await fs.promises.mkdir(path.dirname(destination), {recursive: true});
                await fs.promises.writeFile(destination, file.content);
            } catch (error) {
                throw uploadError(`The server could not save the input file "${file.name}". Please try again.`, error);
            }
        }
        queueAnalysis(room, res);
    } catch (error) {
        sendStatus(500, res, error);
    }
});

router.get("/displayDemoGraphs", function (req, res) {

    let sampleFile = "./samples/HRD-tumors.nwt";
    let sampleDir = "./samples/";

    let sendStatus500 = (err) => sendStatus(500, res, err);

    try {
        if (!fs.existsSync(sampleFile)) {
            res.status(400).send("File does not exist");
        } else {
            let filesList = "";
            fs.readdirSync(sampleDir).forEach(file => {
                filesList = filesList + file + "\n";
            });
            res.send(filesList);
        }

    } catch (error) {
        sendStatus500(error);
    }

});

module.exports = router;
