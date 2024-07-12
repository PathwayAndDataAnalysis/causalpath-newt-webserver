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

let handleResponse = (res, afterResolve, handleRequestError, getResData) => {
    let {statusText, status, ok} = res;
    if (!ok) {
        let errStr = status + " - " + statusText;
        return handleRequestError(errStr);
    }
    if (!getResData) getResData = () => res.text();

    return getResData(res).then(afterResolve);
};

let graphChoice = graphChoiceEnum.ANALYSIS;

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
    let hierarchy = {
        core: {
            animation: 0,
            check_callback: true,
            force_text: true,
            data: data,
        },
    };

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
    return {
        core: {
            animation: 0,
            check_callback: true,
            force_text: true,
            data: data,
        },
    };
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
    return {
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
    };
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

    return {
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
    };
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
    //document.getElementById("graph-container").style.display = "none";
    document.getElementById("newt-graph-container").style.visibility = "hidden";
    document.getElementById("newt-graph-container").style.position = "absolute";
    document.getElementById("folder-tree-container").style.display = "none";
}

function showGraphAndFolders() {
    document.getElementById("menu-text-buttons").style.display = "none";
    document.getElementById("folder-trees-graphs").style.display = "block";
    document.getElementById("back_menu").style.display = "block";
    //document.getElementById("graph-container").style.display = "block";
    document.getElementById("newt-graph-container").style.visibility = "visible";
    document.getElementById("newt-graph-container").style.position = "relative";
    document.getElementById("folder-tree-container").style.display = "block";
    window.dispatchEvent(new Event('resize'));
}


let analysisMenuOverlay = document.getElementById("analysis-status-menu-overlay")
let errorTextArea = document.getElementById("analysis-error-message-text-area");
let viewWarningsLabel = document.getElementById("view-warnings-label");

function showAnalysisErrorMenu(fileList) {
    let foundErrorFiles = fileList.filter(file => file.endsWith("errors.log"));
    analysisMenuOverlay.style.display = "block";
    displayStatusMessages(errorTextArea, foundErrorFiles)
}

function prepareAnalysisWarningDisplay(fileList) 
{
    let foundWarningFiles = fileList.filter(file => file.endsWith("warnings.log"));
    displayStatusMessages(errorTextArea, foundWarningFiles);
    viewWarningsLabel.style.display = "block";
}

function displayStatusMessages(textArea, fileList)
{
    textArea.innerHTML = "";
    for (let file of fileList) {
        fetch(`/api/getFile?filePath=${encodeURIComponent(file)}`, {
            method: "GET",
        }).then(response => {
            if (!response.ok) {
                throw new Error("Network response not okay");
            }
            return response.text();
        }).then((text) => {
            let lines = text.split("\n");
            for (let line of lines) {
                textArea.innerHTML += line + "<br>";
            }
        }).catch(error => {
            console.log("There was an error with fetch", error);
        })
    }
}

document.getElementById("analysis-error-okay-button").addEventListener("click", () => {
    analysisMenuOverlay.style.display = "none";
});


viewWarningsLabel.addEventListener("click", () => {
    analysisMenuOverlay.style.display = "block";
})

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

    let fileContents = [];

    let fileNameSplit = file.name.split(".");

    //Sending a zip file
    if (fileNameSplit.pop().toLowerCase() === "zip") {
        let reader = new FileReader();
        reader.onload = function (e) {
            fileContents.push({name: file.name, content: e.target.result});

            let q = {
                fileContent: e.target.result,
                room: userSessionNumber,
            };

            let makeRequest = () =>
                fetch("/api/analysisZip", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(q),
                });

            let afterResolve = (dirStr) => {
                dirStr = dirStr.trim();
                let fileList = dirStr.split("\n");
                
                console.log("file list is: ");
                for (let element of fileList) console.log(element);

                let hasErrors = fileList.some(str => str.endsWith("errors.log"));
                let hasWarnings = fileList.some(str => str.endsWith("warnings.log"));

                if (hasErrors) {
                    showAnalysisErrorMenu(fileList);
                    return;
                }
                
                let fileListToBuild = fileList.filter(file => file.endsWith(".sif"));

                let analyzedFileHierarchy = buildTreeHierarchyAnalyzedFiles(fileNameSplit[0], fileListToBuild);

                showGraphAndFolders();

                generateJSTree(analyzedFileHierarchy);

                if (hasWarnings) {
                    prepareAnalysisWarningDisplay(fileList);   
                }
            };

            let handleRequestError = (err) => {
                alert("The error message is:\n" + err);
            };

            makeRequest().then((res) => handleResponse(res, afterResolve, handleRequestError));
        };

        reader.readAsBinaryString(file);
    }
});

document.getElementById("back_button_label").addEventListener("click", (event) => {
    showChoosingMenus();
    viewWarningsLabel.style.display = "none";
});


document.getElementById("display-demo-graphs").addEventListener("click", (event) => {
    console.log("display-demo-graphs");
``
    let makeRequest = () =>
        fetch("/api/displayDemoGraphs", {
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        });

    let afterResolve = (dirsList) => {
        dirsList = dirsList.trim();

        console.log("dirsList", dirsList);

        let folderTree = buildTreeHierarchySampleFiles(dirsList.split("\n"));

        showGraphAndFolders();

        generateJSTree(folderTree);
    };

    let handleRequestError = (err) => {
        alert("The error message is:\n" + err);
    };

    makeRequest().then((res) => handleResponse(res, afterResolve, handleRequestError));
});
