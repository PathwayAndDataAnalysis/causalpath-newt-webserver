const fs = require("fs");
const express = require("express");
const {exec} = require("child_process");
const os = require("os");
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
            console.log("File does exist !" + dir);
            let fileName = dir.split("/")[dir.split("/").length - 1];
            let fileContentSif = readJsonFile(dir);
            let fileContentFormat = readJsonFile(dir.replace(".sif", ".format"));
            //console.log(fileContentFormat);
            //console.log("-----------------------------------------------------");
            //console.log(fileContentSif);
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
    let cmd = "java -jar ./jar/causalpath.jar " + dir + " -ws";
    console.log("Running causal path for " + dir);
    console.log("The command is: " + cmd);
    return new Promise((resolve, reject) => {
        let child = exec(cmd, (error, stdout, stderr) => {
            // console.log(stdout);
            // console.log("Causalpath.jar output");
            console.log(stderr);
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
                    if (stderr) 
                    {
                        errorMsg += stderr;
                        console.log(errorMsg);
                    }
                    console.log(stderr)
                    console.log(error);
                    reject(stdout);
                } else {
                    if (rejectEmpty && !stdout) {
                        console.log("Rejecting empty");
                        console.log("Stdout: ");
                        console.log(stdout);
                        console.log(stderr);
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
    let cmdFindParameters = "";
    let cmdFindSif = "";
    let cmdFindInvalid = "";

    if (os.platform() === "win32") {
        cmdFindParameters = `powershell -Command "Get-ChildItem -Path './analysisOut/${room}' -Recurse -Filter 'parameters.txt' | ForEach-Object { $_.FullName.Replace((Get-Location).Path + '\\', '') }"`;
        cmdFindSif = cmdFindSifFiles = `powershell -Command "Get-ChildItem -Path './analysisOut/${room}' -Recurse -Filter '*.sif' | ForEach-Object { $_.FullName.Replace((Get-Location).Path + '\\', '') }"`;
        cmdFindInvalid = `powershell -Command "Get-ChildItem -Path './analysisOut/${room}' -Recurse -Filter 'invalid*' | ForEach-Object { $_.FullName.Replace((Get-Location).Path + '\\', '') }"`;
    } else {
        cmdFindParameters = "find ./analysisOut/" + room + ' -name "parameters.txt"';
        cmdFindSif = "find ./analysisOut/" + room + ' -name "*.sif"'; 
        cmdFindInvalid = "find ./analysisOut/" + room + ' -name "invalid*"'; 
    }

    let rejectEmpty = true;
    let filePathsToReturn = "";

    return executeCommandLineProcess(cmdFindParameters, rejectEmpty).then(
        (data) => {
            let dirs = data.split("\n");
            // On linux, find returns a string starting with ./, but windows doesn't
            // Make the windows format match linux
            if (os.platform() === "win32") {
                for (let dir of dirs) {
                    dir = "./" + dir;
                }
            }
            console.log("Found parameters.txt as " + data);
            return runCausalPathForAll(dirs, 0).then(() => {
                return executeCommandLineProcess(cmdFindInvalid, false).then(
                    (invalidData) => {
                        if (invalidData) {
                            console.log("Error parsing parameter or data files.");
                            filePathsToReturn += invalidData;
                        }
                        return executeCommandLineProcess(cmdFindSif, false).then(
                            (sifData) => {
                                console.log("Attempting to find sif files.");
                                filePathsToReturn += sifData;

                                // Make it so that the filepaths windows returns matches the format of linux
                                if (os.platform() === "win32") {
                                    let directories = filePathsToReturn.split("\n");
                                    filePathsToReturn = "";
                                    for (let i = 0; i <= directories.length - 2; i++) {
                                        filePathsToReturn += "./" + directories[i].replace(/\\/g, '/').replace(/\r/g, '');
                                        if (i < directories.length - 1) {
                                            filePathsToReturn += "\n";
                                        }
                                    }
                                }

                                return filePathsToReturn;
                            },
                            (error) => {
                                console.log("Analysis error. " + error);
                                throw "Analysis error. " + error;
                            }
                        )
                    }
                )
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
                let cmdUnzip = "";

                // Delete the folder where the file will be unzipped to
                let cmdDeleteRoom = "";
                let directoryPath = "./analysisOut/" + room;

                // rm -rf will not throw an error if the directory doesn't exist however rmdir does
                // if on windows and the directory doesn't exist yet, run echo as a lightweight command that does nothing
                if (os.platform() === "win32") {
                    if (fs.existsSync(directoryPath)) {
                        cmdDeleteRoom = `rmdir /s /q "${directoryPath}"`;
                    }
                    else {
                        cmdDeleteRoom = "echo" 
                    }
                    cmdUnzip = `powershell -Command "Expand-Archive -Path './analysisOut/${room}.zip' -DestinationPath './analysisOut/${room}' -Force"`;
                } else {
                    cmdDeleteRoom = "rm -rf " + directoryPath;
                    cmdUnzip = "unzip -o ./analysisOut/" + room + ".zip " + " -d ./analysisOut/" + room;
                }

                return executeCommandLineProcess(cmdDeleteRoom).then(() => {
                    console.log("Deleting file");
                    // Unzip file
                    return executeCommandLineProcess(cmdUnzip).then(function (data) {
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

const readFileContents = (filePath, callback) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, data);
    });
};

router.get("/getFile", (req, res) => {
    const filePath = decodeURIComponent(req.query.filePath);
    
    if (!filePath) {
        return res.status(400).send("File path is required");
    }

    readFileContents(filePath, (error, data) => {
        if (error) {
            console.error("Error reading file: " + filePath);
            res.status(500).send("Error reading file: " + filePath);
        }

        res.send(data);
    })
});
