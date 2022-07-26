const fs = require("fs");
const express = require("express");
const {exec} = require("child_process");
let router = express.Router();
let queue = require("queue");
let jobQueue = queue({concurrency: 5, autostart: true});

const sendStatus = (statusCode, res, err) => {
    if (err) console.log(err);
    res.sendStatus(statusCode);
};

router.post("/getJsonAtPath", function (req, res) {
    let {dir, file} = req.body;

    console.log("directory");
    console.log(dir);
    console.log(file);

    let sendStatus500 = (err) => sendStatus(500, res, err);
    let sendStatus400 = (err) => sendStatus(400, res, err);

    try {
        if (!fs.existsSync(dir)) {
            console.log("File does not exist " + dir);
            sendStatus400();
            res.send("File does not exist");
        } else {
            //Return the json file from the analysis directory to the client
            console.log("File does exist Wowww!!!!!" + dir);
            let fileName = dir.split("/")[dir.split("/").length - 1];
            let fileContentSif = readJsonFile(dir);
            let fileContentFormat = readJsonFile(dir.replace(".sif", ".format"));
            console.log(fileContentFormat);
            console.log("-----------------------------------------------------");
            console.log(fileContentSif);
            res.status(200);
            res.send(fileName + "||||" + fileContentSif + "||||" + fileContentFormat);
        }
    } catch (error) {
        console.log(error);
        sendStatus500(error);
    }
});

const readJsonFile = function (filePath) {
    return fs.readFileSync(filePath, "utf-8");
};

let runCausalPathJar = function (dir) {
    let cmd = "java -jar './jar/causalpath.jar' " + dir + " -ws";

    return new Promise((resolve, reject) => {
        let child = exec(cmd, (error, stdout, stderr) => {
            // console.log(stdout);
            // console.log("Causalpath.jar output");
            if (stderr) reject();
        });

        child.on("exit", function () {
            console.log("exited");
            resolve();
        });
    });
};

/***
 * Recursive function to run causalpath under all the directories containing parameters.txt
 * @param dirs: Array of paths containing parameters.txt
 * @param ind: index in the dirs array to run causalpath
 */
function runCausalPathForAll(dirs, ind) {
    return new Promise((resolve, reject) => {
        if (ind < dirs.length) {
            let dir = dirs[ind].replace("parameters.txt", "");
            runCausalPathJar(dir).then(() => {
                runCausalPathForAll(dirs, ind + 1).then((r) => {
                });
                resolve();
            });
        } else resolve();
    });
}

/***
 * Calls cmdStr on console and runs callback function with parameter content
 * @param cmdStr
 * @param content
 * @param callback
 */
let executeCommandLineProcess = function (cmdStr, rejectEmpty) {
    return new Promise((resolve, reject) => {
        try {
            exec(cmdStr, function (error, stdout, stderr) {
                if (error !== null) {
                    let errorMsg = error + "\n";
                    if (stderr) errorMsg += stderr;
                    reject(stdout);
                } else {
                    if (rejectEmpty && !stdout) {
                        reject();
                    }
                    resolve(stdout);
                }
            });
        } catch (error) {
            console.log("Caught error " + error);
            reject(error);
        }
    });
};

function analyzeFiles(room) {
    let cmd2 = "find ./analysisOut/" + room + ' -name "parameters.txt"';
    let rejectEmpty = true;

    return executeCommandLineProcess(cmd2, rejectEmpty).then(
        (data) => {
            let dirs = data.split("\n");
            console.log("Found parameters.txt as " + data);
            return runCausalPathForAll(dirs, 0).then(() => {
                let cmd3 = "find ./analysisOut/" + room + ' -name "*.sif"'; //now find the analysis files
                return executeCommandLineProcess(cmd3, rejectEmpty).then(
                    (data2) => {
                        console.log("Analysis is successful.");
                        console.log(cmd3);
                        console.log("In analysis zip found causative.json as " + data2);
                        return data2;
                    },
                    (error) => {
                        console.log("Analysis error. " + error);
                        throw "Analysis error. " + error;
                    }
                );
            });
        },
        (error) => {
            console.log("Analysis error. " + error);
            throw "Analysis error. " + error;
        }
    );
}

// Client sends analysis files in a zip file
router.post("/analysisZip", function (req, res, next) {
    // TODO: find out a more optimal timeout?
    res.setTimeout(500000);

    let {room, fileContent} = req.body;
    let sendStatus500 = (err) => sendStatus(500, res, err);
    try {
        console.log("analysisZip");
        console.log(room);

        let dir = "./analysisOut/"
        if (!fs.existsSync(dir)) {
            console.log("Creating directory " + dir);
            fs.mkdirSync(dir);
        }

        new Promise(function (resolve, reject) {
            fs.writeFile("./analysisOut/" + room + ".zip", fileContent, "binary", function (err) {
                if (err) {
                    console.log("File could not be saved.", err);
                    reject();
                } else {
                    console.log("File is saved.");
                    resolve("success");
                }
            });
        })
            .then((content) => {
                // Unzip file
                let cmd = "unzip -o ./analysisOut/" + room + ".zip " + " -d ./analysisOut/" + room;
                return executeCommandLineProcess(cmd).then(function (data) {
                    console.log("Unzip is successful.");
                    jobQueue.push(function () {
                        return analyzeFiles(room)
                            .then((dirStr) => {
                                res.status(200);
                                res.send(dirStr);
                            })
                            .catch(sendStatus500);
                    });
                }, sendStatus500);
            })
            .catch(sendStatus500);
    } catch (error) {
        sendStatus500(error);
    }
});

//Client sends analysis files in an array
router.post("/analysisDir", function (req, res, next) {
    // TODO: find out a more optimal timeout?
    res.setTimeout(1000000);

    // console.log('req body is: ', req.body);
    let {room, inputFiles} = req.body;
    let sendStatus500 = (err) => sendStatus(500, res, err);
    // console.log('length: ', req.body.inputFiles.length);

    console.log("analysisDir");
    console.log(room);

    try {
        //get file and send it to the client for visualization
        const dir = "./analysisOut/" + room;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        let written = 0;
        //Make sure all the files are transferred from the socket
        let p1 = new Promise(function (resolve, reject) {
            for (let i = 0; i < inputFiles.length; i++) {
                (function (file) {
                    fs.writeFile("./analysisOut/" + room + "/" + file.name, file.content, function (err) {
                        if (err) {
                            console.log(err);
                            reject("Error while writing content of the file " + file.name);
                        }
                        written++;
                        if (written >= inputFiles.length) resolve("success");
                    });
                })(inputFiles[i]);
            }
        });

        p1.then(function (content) {
            jobQueue.push(function () {
                return analyzeFiles(room)
                    .then((dirStr) => {
                        res.status(200);
                        res.send(dirStr);
                    })
                    .catch(sendStatus500);
            });
        }).catch(sendStatus500);
    } catch (error) {
        sendStatus500(error);
    }
});

router.get("/displayDemoGraphs", function (req, res) {

    let sampleFile = "./samples/HRD-tumors.nwt";
    let sampleDir = "./samples/";

    let sendStatus500 = (err) => sendStatus(500, res, err);
    let sendStatus400 = (err) => sendStatus(400, res, err);

    try {
        if (!fs.existsSync(sampleFile)) {
            console.log("File does not exist " + sampleFile);
            sendStatus400();
            res.send("File does not exist");
        } else {
            let filesList = "";
            fs.readdirSync(sampleDir).forEach(file => {
                filesList = filesList + file + "\n";
            });
            console.log("Demo Files exist!!!" + sampleFile);
            res.send(filesList);
        }

    } catch (error) {
        console.log(error);
        sendStatus500(error);
    }

});

module.exports = router;
