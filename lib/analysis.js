const {execFile} = require("node:child_process");
const path = require("node:path");

class AnalysisError extends Error {
    constructor(message, {status = 500, code = "ANALYSIS_FAILED", ...details} = {}) {
        super(message);
        this.status = status;
        this.response = {error: message, code, ...details};
    }
}

// Resolve only after the process has ended AND its output streams have closed.
// stderr alone is not a failure: Java and its libraries can write warnings there.
function runProcess(command, args, message, code) {
    return new Promise((resolve, reject) => {
        execFile(command, args, {maxBuffer: 10 * 1024 * 1024}, (error, stdout, stderr) => {
            if (!error) {
                resolve({stdout, stderr});
                return;
            }

            let reason;
            if (error.code === "ENOENT") {
                reason = `The server could not start ${command}; the executable was not found.`;
            } else if (error.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") {
                reason = "The process exceeded the server's 10 MiB output limit per stream. The captured output below may be incomplete.";
            } else if (error.signal) {
                reason = `The process was terminated by signal ${error.signal}.`;
            } else if (typeof error.code === "number") {
                reason = `The process exited with code ${error.code}.`;
            } else {
                reason = `The server could not complete the process: ${error.message}`;
            }

            if (!stdout && !stderr) reason += " No diagnostic output was produced.";
            reject(new AnalysisError(`${message} ${reason}`, {
                code,
                stdout,
                stderr,
                exitCode: typeof error.code === "number" ? error.code : null,
                signal: error.signal || null,
            }));
        });
    });
}

async function runCausalPathJar(dir) {
    try {
        // Pass paths as arguments rather than interpolating them into a shell command.
        return await runProcess("java", ["-jar", "./jar/causalpath.jar", dir],
            "CausalPath could not complete the analysis. Review the original output below for the reported cause.",
            "CAUSALPATH_FAILED");
    } catch (error) {
        if (error instanceof AnalysisError) error.response.directory = dir;
        throw error;
    }
}

async function analyzeFiles(room) {
    const root = "./analysisOut/" + room;
    const {stdout} = await runProcess("find", [root, "-name", "parameters.txt"],
        "The server could not locate the analysis parameters.", "PARAMETER_SEARCH_FAILED");
    const files = stdout.split("\n").filter(Boolean);
    if (!files.length) {
        throw new AnalysisError("No parameters.txt file was found in the uploaded input. Include parameters.txt and the data files it references in your ZIP archive.",
            {status: 400, code: "MISSING_PARAMETERS"});
    }

    // Serial execution of CausalPath runs
    // const output = [];
    // for (const file of files) {
    //     const directory = path.dirname(file);
    //     const result = await runCausalPathJar(directory);
    //     output.push({directory, ...result});
    // }

    // Parallel execution of CausalPath runs
    const analysisPromises = files.map(file => {
        const directory = path.dirname(file);
        return runCausalPathJar(directory).then(result => ({
            directory,
            ...result
        }));
    });
    const output = await Promise.all(analysisPromises);
    
    const graphs = await runProcess("find", [root, "-name", "*.sif"],
        "The server could not locate the analysis results.", "RESULT_SEARCH_FAILED");
    if (!graphs.stdout.trim()) {
        throw new AnalysisError("CausalPath finished without producing any .sif network files. Review its output below and check the analysis parameters and input data.",
            {status: 422, code: "NO_NETWORK_FILES", output});
    }
    return graphs.stdout;
}

module.exports = {AnalysisError, runProcess, runCausalPathJar, analyzeFiles};
