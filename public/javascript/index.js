"use strict";

const graphChoiceEnum = {
    JSON: 1,
    ANALYSIS: 2,
    DEMO: 3,
};

const generateUUID = () => {
    let d = new Date().getTime(),
        d2 = (performance && performance.now && performance.now() * 1000) || 0;
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        let r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === "x" ? r : (r & 0x7) | 0x8).toString(16);
    });
};

const userSessionNumber = generateUUID();

let handleResponse = async (res, afterResolve, handleRequestError, getResData) => {
    let {statusText, status, ok} = res;
    if (!ok) {
        let error = {error: `The request failed (${status}${statusText ? " - " + statusText : ""}). Please try again.`};
        try {
            const body = await res.text();
            if (body.trim()) {
                if ((res.headers.get("content-type") || "").includes("application/json")) {
                    const data = JSON.parse(body);
                    if (typeof data.error === "string" && data.error.trim()) error = data;
                } else if ((res.headers.get("content-type") || "").includes("text/plain")) {
                    error.error = body;
                }
            }
        } catch (_) {
            // A missing/unreadable response body still needs a useful HTTP fallback.
        }
        return handleRequestError(error);
    }
    if (!getResData) getResData = () => res.text();

    return getResData(res).then(afterResolve);
};

function showAnalysisError(error) {
    const dialog = document.getElementById("analysis-error-dialog");
    const message = error && typeof error.error === "string" ? error.error :
        "The analysis request could not be completed. Check your connection and try again.";
    const details = [];
    if (error && error.directory) details.push("Analysis folder: " + error.directory);
    if (error && error.details) details.push(error.details);
    if (error && error.stderr) details.push("Original error output (stderr):\n" + error.stderr);
    if (error && error.stdout) details.push("Original console output (stdout):\n" + error.stdout);
    if (error && Array.isArray(error.output)) {
        error.output.forEach((run) => {
            details.push("Analysis folder: " + run.directory);
            if (run.stderr) details.push("Original error output (stderr):\n" + run.stderr);
            if (run.stdout) details.push("Original console output (stdout):\n" + run.stdout);
        });
    }
    // Use textContent so diagnostics and uploaded file names are never interpreted as HTML.
    document.getElementById("analysis-error-message").textContent = message;
    document.getElementById("analysis-error-output").textContent = details.join("\n\n");
    document.getElementById("analysis-error-details").hidden = !details.length;
    if (!dialog.open) dialog.showModal();
}

let graphChoice = graphChoiceEnum.ANALYSIS;

const analysisProgressElements = {
    overlay: document.getElementById("analysis-progress-overlay"),
    card: document.querySelector("#analysis-progress-overlay .analysis-progress-card"),
    fileName: document.getElementById("analysis-progress-file"),
    track: document.getElementById("analysis-progress-track"),
    bar: document.getElementById("analysis-progress-bar"),
    status: document.getElementById("analysis-progress-status"),
};

function updateAnalysisProgress(message, progress) {
    analysisProgressElements.status.textContent = message;

    let isDeterminate = Number.isFinite(progress);
    analysisProgressElements.track.classList.toggle("is-determinate", isDeterminate);

    if (isDeterminate) {
        let normalizedProgress = Math.min(100, Math.max(0, progress));
        analysisProgressElements.bar.style.width = normalizedProgress + "%";
        analysisProgressElements.track.setAttribute("aria-valuemin", "0");
        analysisProgressElements.track.setAttribute("aria-valuemax", "100");
        analysisProgressElements.track.setAttribute("aria-valuenow", String(Math.round(normalizedProgress)));
    } else {
        analysisProgressElements.bar.style.removeProperty("width");
        analysisProgressElements.track.removeAttribute("aria-valuemin");
        analysisProgressElements.track.removeAttribute("aria-valuemax");
        analysisProgressElements.track.removeAttribute("aria-valuenow");
    }
}

function showAnalysisProgress(fileName) {
    analysisProgressElements.fileName.textContent = fileName || "your input";
    updateAnalysisProgress("Reading input file…", 0);

    analysisProgressElements.overlay.hidden = false;
    document.body.classList.add("analysis-in-progress");
    document.body.setAttribute("aria-busy", "true");
    analysisProgressElements.card.focus();
}

function hideAnalysisProgress() {
    analysisProgressElements.overlay.hidden = true;
    document.body.classList.remove("analysis-in-progress");
    document.body.removeAttribute("aria-busy");
}

function hideAnalysisProgressAfterPaint() {
    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(hideAnalysisProgress);
    });
}

/**
 * Right-click context menu items for file-tree nodes. "Graph Statistics" is
 * enabled for .sif graph files and greyed out for folders and other file
 * types. The stats are computed inside the newt bundle (it needs appUtilities,
 * which this plain script can't see), exposed as window.newtShowGraphStatistics.
 * This menu is also where the upcoming subgraph/quick-preview actions will live.
 */
function treeContextMenuItems(node) {
    let name = (node && (node.text || (node.data && node.data.name))) || "";
    let isSif = name.endsWith(".sif");

    // the sibling ".format" node (if any) carries node colors/infoboxes for
    // client-uploaded .sif files; analyzed files bundle it in their content.
    let getFormatNode = function (instance, targetNode) {
        let formatId = String(targetNode.id).replace(".sif", ".format");
        let formatNode = instance.get_node(formatId);
        return formatNode || null;
    };

    return {
        open: {
            label: "Open",
            _disabled: !isSif,
            action: function (data) {
                let instance = $.jstree.reference(data.reference);
                let targetNode = instance.get_node(data.reference);
                if (typeof window.newtOpenFile === "function") {
                    window.newtOpenFile(targetNode, getFormatNode(instance, targetNode));
                }
            },
        },
        loadSubgraph: {
            label: "Load Subgraph...",
            _disabled: !isSif,
            action: function (data) {
                let instance = $.jstree.reference(data.reference);
                let targetNode = instance.get_node(data.reference);
                if (typeof window.newtLoadSubgraphCanvas === "function") {
                    window.newtLoadSubgraphCanvas(targetNode, getFormatNode(instance, targetNode));
                }
            },
        },
        loadSubgraphOverlay: {
            label: "Load Subgraph (overlay)...",
            _disabled: !isSif,
            action: function (data) {
                let instance = $.jstree.reference(data.reference);
                let targetNode = instance.get_node(data.reference);
                if (typeof window.newtLoadSubgraph === "function") {
                    window.newtLoadSubgraph(targetNode, getFormatNode(instance, targetNode));
                }
            },
        },
        graphStatistics: {
            label: "Graph Statistics",
            _disabled: !isSif,
            action: function (data) {
                let instance = $.jstree.reference(data.reference);
                let targetNode = instance.get_node(data.reference);
                if (typeof window.newtShowGraphStatistics === "function") {
                    window.newtShowGraphStatistics(targetNode);
                }
            },
        },
    };
}

/** Enable the jsTree context-menu plugin on a tree config (in place). */
function withTreeContextMenu(config) {
    config.plugins = (config.plugins || []).concat(["contextmenu"]);
    config.contextmenu = {items: treeContextMenuItems};
    return config;
}

function buildFolderTree(paths, treeNode, file, parentNodePath = "") {
    let idSeparator = "___";
    if (paths.length === 0) return;

    for (let i = 0; i < treeNode.length; i++) {
        let nodeText = treeNode[i].text;

        if (paths[0] === nodeText) {
            buildFolderTree(
                paths.splice(1, paths.length),
                treeNode[i].children,
                file,
                parentNodePath + idSeparator + nodeText
            );
            return;
        }
    }

    let nodeId = parentNodePath + idSeparator + paths[0];
    let newNode = {
        id: nodeId,
        text: paths[0],
        a_attr: {title: paths[0]}, // native tooltip shows the full name when truncated
        children: [],
        state: {opened: true},
        data: file,
    };

    if (newNode.text.endsWith(".nwt")) newNode.icon = "./img/tree-newt-icon.png";
    else if (newNode.text.endsWith(".sif")) newNode.icon = "./img/tree-sif-icon.png";
    else if (newNode.text.endsWith(".format")) newNode.icon = "./img/tree-sif-icon.png";
    else if (newNode.text.endsWith(".json")) newNode.icon = "./img/tree-json-icon.png";
    else newNode.icon = "";

    treeNode.push(newNode);
    buildFolderTree(paths.splice(1, paths.length), newNode.children, file, nodeId);
}

function getLonelySifNodes(hierarchy, sifNodes = []) {
    hierarchy.forEach((rootNode) => {
        if (rootNode.children.length !== 0) {
            for (let i = 0; i < rootNode.children.length; i++) {
                if (rootNode.children[i].text.endsWith(".sif")) {
                    let fileName = rootNode.children[i].text.substring(
                        0,
                        rootNode.children[i].text.length - 4
                    );
                    let lookUpFileName = fileName + ".format";

                    let isFound = false;

                    for (let j = 0; j < rootNode.children.length; j++) {
                        if (rootNode.children[j].text === lookUpFileName) {
                            isFound = true;
                            break;
                        }
                    }
                    if (!isFound) sifNodes.push(rootNode.children[i]);
                }
            }
        }
        getLonelySifNodes(rootNode.children, sifNodes);
    });
    return sifNodes;
}

function getFormatNodes(hierarchy, formatNodes = []) {
    hierarchy.forEach((rootNode) => {
        // this is leaf node
        if (rootNode.children.length === 0) {
            if (rootNode.data.name.endsWith(".format")) {
                formatNodes.push(rootNode);
            }
        }
        getFormatNodes(rootNode.children, formatNodes);
    });
    return formatNodes;
}

function deleteEmptyDirs() {
    let jsonNodes = $("#folder-tree-container").jstree(true).get_json("#", {flat: true});
    $.each(jsonNodes, function (i, node) {
        $.each(jsonNodes, function (i, otherNode) {
            if (
                !otherNode.id.includes(node.id) &&
                otherNode.id !== node.id &&
                !otherNode.id.includes(".format") &&
                !otherNode.id.includes(".sif")
            ) {
                $("#folder-tree-container").jstree(true).delete_node(node.id);
            }
        });
    });
}

function getLonelyLeaves(hierarchy, toDeleteNode = []) {
    hierarchy.forEach((rootNode) => {
        let deleteNode = false;
        // not a leaf node
        if (rootNode.children.length !== 0) {
            if (rootNode.children.length === 1 && !rootNode.children[0].data.name.endsWith(".nwt")) {
                deleteNode = true;
            }
        }
        if (deleteNode) {
            toDeleteNode.push(rootNode);
        }
        getLonelyLeaves(rootNode.children, toDeleteNode);
    });
    return toDeleteNode;
}

function deleteNodesByID(nodes) {
    $(function () {
        let ref = $("#folder-tree-container").jstree(true);
        let ids = [];
        for (let i = 0; i < nodes.length; i++) ids.push(nodes[i].id);
        ref.delete_node(ids);
    });
}

/***
 * Organizes data as a tree and displays the jstree associated with it
 * @param fileList: List of files to display
 * @param isFromClient: file list structure is different depending on whether it is coming from the server or client
 */
function buildAndDisplayFolderTree(fileList, isFromClient, chosenNodeId) {
    let data = [];
    fileList.forEach((file) => {
        let paths = file.webkitRelativePath.split("/");
        if (
            paths.at(-1).endsWith(".sif") ||
            paths.at(-1).endsWith(".format") ||
            paths.at(-1).endsWith(".nwt")
            // || paths.at(-1).endsWith(".json")
        ) {
            buildFolderTree(paths, data, file);
        }
    });
    let hierarchy = withTreeContextMenu({
        core: {
            animation: 0,
            check_callback: true,
            force_text: true,
            data: data,
        },
    });

    $(function () {
        $("#folder-tree-container").jstree(hierarchy);

        $("#folder-tree-container").jstree(true).settings = hierarchy;
        $("#folder-tree-container").jstree(true).refresh();

        // After jsTree build is completed hide .format nodes
        $("#folder-tree-container").on("model.jstree", function (e, data) {
            // let formatNodes = getFormatNodes(hierarchy.core.data);
            let formatNodes = getFormatNodes($("#folder-tree-container").jstree(true).settings.core.data);
            formatNodes.forEach((node) => {
                $("#folder-tree-container").jstree(true).hide_node(node);
            });

            // let lonelySIFs = getLonelySifNodes(hierarchy.core.data);
            // let formatNodes = getFormatNodes(hierarchy.core.data);
            // let lonelyLeaves = getLonelyLeaves(hierarchy.core.data);
            //
            // let nodesToDelete = lonelySIFs.concat(formatNodes)
            // // .concat(lonelyLeaves);
            //
            // // deleteNodesByID(nodesToDelete);
            // var ref = $('#folder-tree-container').jstree(true)
            // let ids = [];
            // for (let i = 0; i < nodesToDelete.length; i++)
            //     ids.push(nodesToDelete[i].id);
            // ref.delete_node(ids);
            // Remove empty dirs from the tree
            // deleteEmptyDirs();
        });
    });
}

/***
 * Load graph directories as a tree in json format
 * In visualize results from a previous analysis
 */
function loadAnalysisFilesFromClient(fileList, chosenNodeId) {
    graphChoice = graphChoiceEnum.JSON;
    this.buildAndDisplayFolderTree(fileList, true, chosenNodeId);
}

function buildTreeHierarchy(fileList) {
    let data = [];
    fileList.forEach((file) => {
        let paths = file.webkitRelativePath.split("/");
        if (
            paths.at(-1).endsWith(".sif") ||
            paths.at(-1).endsWith(".format") ||
            paths.at(-1).endsWith(".nwt")
        ) {
            buildFolderTree(paths, data, file);
        }
    });
    return withTreeContextMenu({
        core: {
            animation: 0,
            check_callback: true,
            force_text: true,
            data: data,
        },
    });
}

function buildTreeHierarchyAnalyzedFiles(rootDirName, fileList) {
    let data = [];
    fileList.forEach((file) => {
        let paths = file.split("/");

        let newNode = {
            id: paths.at(2) + "_" + paths.at(3),
            text: paths[3],
            children: [],
            state: {opened: true},
            data: {
                name: paths[3],
                type: "ANALYZED_FILE",
                sessionId: userSessionNumber,
            },
        };

        if (newNode.text.endsWith(".nwt")) newNode.icon = "./img/tree-newt-icon.png";
        else if (newNode.text.endsWith(".sif")) newNode.icon = "./img/tree-sif-icon.png";
        else if (newNode.text.endsWith(".format")) newNode.icon = "./img/tree-sif-icon.png";
        else if (newNode.text.endsWith(".json")) newNode.icon = "./img/tree-json-icon.png";
        else newNode.icon = "";

        data.push(newNode);
    });
    return withTreeContextMenu({
        core: {
            animation: 0,
            check_callback: true,
            force_text: true,
            data: [
                {
                    text: rootDirName,
                    id: rootDirName,
                    state: {opened: true},
                    children: data,
                },
            ],
        },
    });
}

function buildTreeHierarchySampleFiles(dirsList) {
    let data = [];

    dirsList.forEach(file => {
        let newNode = {
            id: file,
            text: file,
            children: [],
            state: {opened: true},
            data: {
                name: file,
                type: "SAMPLE_FILE"
            },
        };

        if (newNode.text.endsWith(".nwt")) newNode.icon = "./img/tree-newt-icon.png";
        else if (newNode.text.endsWith(".sif")) newNode.icon = "./img/tree-sif-icon.png";
        else if (newNode.text.endsWith(".format")) newNode.icon = "./img/tree-sif-icon.png";
        else if (newNode.text.endsWith(".json")) newNode.icon = "./img/tree-json-icon.png";
        else newNode.icon = "";

        data.push(newNode);
    });

    return withTreeContextMenu({
        core: {
            animation: 0,
            check_callback: true,
            force_text: true,
            data: [
                {
                    text: "Sample Files",
                    id: "samples",
                    state: {opened: true},
                    children: data,
                },
            ],
        },
    });
}

function generateJSTree(treeHierarchy) {
    $(function () {
        $("#folder-tree-container").jstree(treeHierarchy);

        $("#folder-tree-container").jstree(true).settings = treeHierarchy;
        $("#folder-tree-container").jstree(true).refresh();

        // After jsTree build is completed hide .format nodes
        $("#folder-tree-container").on("model.jstree", function (e, data) {
            let formatNodes = getFormatNodes($("#folder-tree-container").jstree(true).settings.core.data);
            formatNodes.forEach((node) => {
                $("#folder-tree-container").jstree(true).hide_node(node);
            });
        });
    });
}

function showChoosingMenus() {
    document.getElementById("menu-text-buttons").style.display = "block";
    document.getElementById("folder-trees-graphs").style.display = "none";
    document.getElementById("back_menu").style.display = "none";
    document.getElementById("graph-container").style.display = "none";
    document.getElementById("folder-tree-container").style.display = "none";
}

function showGraphAndFolders() {
    document.getElementById("menu-text-buttons").style.display = "none";
    document.getElementById("folder-trees-graphs").style.display = "block";
    document.getElementById("back_menu").style.display = "block";
    document.getElementById("graph-container").style.display = "flex";
    document.getElementById("folder-tree-container").style.display = "block";

    // Wait until the graph workspace has been painted before measuring it.
    // Calling Newt directly avoids the debounce and hidden-layout measurements
    // that previously left the canvas short until the window was resized.
    window.requestAnimationFrame(() => {
        if (typeof window.newtResizeWorkspace === "function") {
            window.newtResizeWorkspace();
        } else {
            window.dispatchEvent(new Event("resize"));
        }
    });
}

document.getElementById("picker").addEventListener("change", (event) => {
    let files = event.target.files;
    let fileList = Array.from(files);

    event.target.value = null; // to make sure the same files can be loaded again

    showGraphAndFolders();

    // this.loadAnalysisFilesFromClient(fileList);

    let treeHierarchy = buildTreeHierarchy(fileList);
    generateJSTree(treeHierarchy);
});

document.getElementById("file-analysis-input").addEventListener("change", (event) => {
    let file = event.target.files[0];
    event.target.value = null; // clear the input field

    if (!file) return;

    let fileNameSplit = file.name.split(".");

    //Sending a zip file
    if (fileNameSplit.pop().toLowerCase() === "zip") {
        showAnalysisProgress(file.name);

        let reader = new FileReader();
        reader.onprogress = function (e) {
            if (e.lengthComputable) {
                updateAnalysisProgress("Reading input file…", (e.loaded / e.total) * 100);
            }
        };

        reader.onload = function (e) {
            let q = {
                fileContent: e.target.result,
                room: userSessionNumber,
            };

            updateAnalysisProgress("Uploading files and running CausalPath…");

            let makeRequest = () =>
                fetch("/api/analysisZip", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(q),
                });

            let afterResolve = (dirStr) => {
                updateAnalysisProgress("Preparing the Newt workspace…");

                dirStr = dirStr.trim();
                let fileList = dirStr.split("\n");

                let analyzedFileHierarchy = buildTreeHierarchyAnalyzedFiles(fileNameSplit[0], fileList);

                showGraphAndFolders();

                generateJSTree(analyzedFileHierarchy);
                hideAnalysisProgressAfterPaint();
            };

            let handleRequestError = (err) => {
                hideAnalysisProgress();
                showAnalysisError(err);
            };

            Promise.resolve()
                .then(makeRequest)
                .then((res) => handleResponse(res, afterResolve, handleRequestError))
                .catch(handleRequestError);
        };

        reader.onerror = function () {
            hideAnalysisProgress();
            alert("The input file could not be read. Please try selecting it again.");
        };

        reader.onabort = hideAnalysisProgress;
        reader.readAsBinaryString(file);
    }
});

document.getElementById("back_button_label").addEventListener("click", (event) => {
    showChoosingMenus();
});


document.getElementById("display-demo-graphs").addEventListener("click", (event) => {
    let makeRequest = () =>
        fetch("/api/displayDemoGraphs", {
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        });

    let afterResolve = (dirsList) => {
        dirsList = dirsList.trim();

        let folderTree = buildTreeHierarchySampleFiles(dirsList.split("\n"));

        showGraphAndFolders();

        generateJSTree(folderTree);
    };

    let handleRequestError = (err) => {
        alert(err.error || String(err));
    };

    makeRequest().then((res) => handleResponse(res, afterResolve, handleRequestError)).catch(handleRequestError);
});
