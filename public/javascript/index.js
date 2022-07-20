const graphChoiceEnum = {
    JSON: 1, ANALYSIS: 2,
    DEMO: 3,
};

let handleResponse = (res, afterResolve, handleRequestError, getResData) => {
    let {statusText, status, ok} = res;
    if (!ok) {
        let errStr = status + ' - ' + statusText;
        return handleRequestError(errStr);
    }
    if (!getResData)
        getResData = () => res.text();

    return getResData(res).then(afterResolve);
};

let graphChoice = graphChoiceEnum.ANALYSIS;

function buildFolderTree(paths, treeNode, file, parentNodePath = '') {
    let idSeparator = '___';
    if (paths.length === 0)
        return;

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
        'id': nodeId,
        'text': paths[0],
        'children': [],
        'state': {opened: true},
        data: file,
    };

    if (newNode.text.endsWith(".nwt"))
        newNode.icon = "./img/tree-newt-icon.png"
    else if (newNode.text.endsWith(".sif"))
        newNode.icon = "./img/tree-sif-icon.png"
    else if (newNode.text.endsWith(".format"))
        newNode.icon = "./img/tree-sif-icon.png"
    else if (newNode.text.endsWith(".json"))
        newNode.icon = "./img/tree-json-icon.png"
    else
        newNode.icon = ""

    treeNode.push(newNode);
    buildFolderTree(paths.splice(1, paths.length), newNode.children, file, nodeId);
}

function getLonelySifNodes(hierarchy, sifNodes = []) {
    hierarchy.forEach(rootNode => {
            if (rootNode.children.length !== 0) {
                for (let i = 0; i < rootNode.children.length; i++) {
                    if (rootNode.children[i].text.endsWith(".sif")) {
                        let fileName = rootNode.children[i].text.substring(0, rootNode.children[i].text.length - 4);
                        let lookUpFileName = fileName + ".format";

                        let isFound = false;

                        for (let j = 0; j < rootNode.children.length; j++) {
                            if (rootNode.children[j].text === lookUpFileName) {
                                isFound = true;
                                break;
                            }
                        }
                        if (!isFound)
                            sifNodes.push(rootNode.children[i]);
                    }
                }
            }
            getLonelySifNodes(rootNode.children, sifNodes);
        }
    );
    return sifNodes;
}

function getFormatNodes(hierarchy, formatNodes = []) {
    hierarchy.forEach(rootNode => {
            // this is leaf node
            if (rootNode.children.length === 0) {
                if (rootNode.data.name.endsWith(".format")) {
                    formatNodes.push(rootNode);
                }
            }
            getFormatNodes(rootNode.children, formatNodes);
        }
    );
    return formatNodes;
}

function deleteEmptyDirs() {
    let jsonNodes = $('#folder-tree-container').jstree(true).get_json('#', {flat: true});
    console.log('jsonNodes');
    console.log(jsonNodes);

    $.each(jsonNodes, function (i, node) {
        $.each(jsonNodes, function (i, otherNode) {
            if (
                !otherNode.id.includes(node.id)
                && otherNode.id !== node.id
                && !otherNode.id.includes('.format')
                && !otherNode.id.includes('.sif')
            ) {
                console.log('deleting ' + node.id);
                $('#folder-tree-container').jstree(true).delete_node(node.id);
            }
        });
    });
}

function getLonelyLeaves(hierarchy, toDeleteNode = []) {
    hierarchy.forEach(rootNode => {
            let deleteNode = false;
            // not a leaf node
            if (rootNode.children.length !== 0) {
                if (rootNode.children.length === 1
                    && !rootNode.children[0].data.name.endsWith(".nwt")) {
                    deleteNode = true;
                }
            }
            if (deleteNode) {
                toDeleteNode.push(rootNode);
            }
            getLonelyLeaves(rootNode.children, toDeleteNode);
        }
    );
    return toDeleteNode;
}

function deleteNodesByID(nodes) {
    $(function () {
        let ref = $('#folder-tree-container').jstree(true);
        let ids = [];
        for (let i = 0; i < nodes.length; i++)
            ids.push(nodes[i].id);
        ref.delete_node(ids);
    });
}

/***
 * Organizes data as a tree and displays the jstree associated with it
 * @param fileList: List of files to display
 * @param isFromClient: file list structure is different depending on whether it is coming from the server or client
 */
function buildAndDisplayFolderTree(
    fileList,
    isFromClient,
    chosenNodeId
) {
    let data = [];
    fileList.forEach(file => {
        let paths = file.webkitRelativePath.split('/');
        if (paths.at(-1).endsWith(".sif")
            || paths.at(-1).endsWith(".format")
            || paths.at(-1).endsWith(".nwt")
            // || paths.at(-1).endsWith(".json")
        ) {
            buildFolderTree(paths, data, file)
        }
    })
    let hierarchy = {
        core: {
            animation: 0,
            check_callback: true,
            force_text: true,
            data: data
        }
    };

    $(function () {
            console.log('hierarchy');
            console.log(hierarchy);

            $('#folder-tree-container').jstree(hierarchy);

            $('#folder-tree-container').jstree(true).settings = hierarchy;
            $('#folder-tree-container').jstree(true).refresh();

            // After jsTree build is completed hide .format nodes
            $('#folder-tree-container').on("model.jstree", function (e, data) {
                // let formatNodes = getFormatNodes(hierarchy.core.data);
                let formatNodes = getFormatNodes($('#folder-tree-container').jstree(true).settings.core.data);
                console.log('formatNodesModel');
                console.log(formatNodes);
                formatNodes.forEach(node => {
                    $('#folder-tree-container').jstree(true).hide_node(node);
                })

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

        }
    );
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
    fileList.forEach(file => {
        let paths = file.webkitRelativePath.split('/');
        if (paths.at(-1).endsWith(".sif")
            || paths.at(-1).endsWith(".format")
            || paths.at(-1).endsWith(".nwt")
        ) {
            buildFolderTree(paths, data, file)
        }
    })
    return {
        core: {
            animation: 0,
            check_callback: true,
            force_text: true,
            data: data
        }
    };
}

function generateJSTree(treeHierarchy) {
    $(function () {

        $('#folder-tree-container').jstree(treeHierarchy);

        $('#folder-tree-container').jstree(true).settings = treeHierarchy;
        $('#folder-tree-container').jstree(true).refresh();

        // After jsTree build is completed hide .format nodes
        $('#folder-tree-container').on("model.jstree", function (e, data) {
            let formatNodes = getFormatNodes($('#folder-tree-container').jstree(true).settings.core.data);
            console.log('formatNodesModel');
            console.log(formatNodes);
            formatNodes.forEach(node => {
                $('#folder-tree-container').jstree(true).hide_node(node);
            })
        });

    });
}

document.getElementById('picker').addEventListener('change', event => {
    let files = event.target.files;

    let fileList = Array.from(files);

    event.target.value = null; // to make sure the same files can be loaded again

    document.getElementById('menu-text-buttons').style.display = 'none';
    document.getElementById('folder-trees-graphs').style.display = 'block';
    document.getElementById('back_menu').style.display = 'block';
    document.getElementById('graph-container').style.display = 'block';
    document.getElementById('folder-tree-container').style.display = 'block';

    // this.loadAnalysisFilesFromClient(fileList);

    let treeHierarchy = this.buildTreeHierarchy(fileList);
    generateJSTree(treeHierarchy);

});

document.getElementById("back_button_label").addEventListener("click", (event) => {

    document.getElementById('menu-text-buttons').style.display = 'block';
    document.getElementById('folder-trees-graphs').style.display = 'none';
    document.getElementById('back_menu').style.display = 'none';
    document.getElementById('graph-container').style.display = 'none';
    document.getElementById('folder-tree-container').style.display = 'none';
});


const readSamples = () => {
    fetch('/samples/HRD-tumors.nwt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(myBlob => {
            console.log(myBlob);
            let files = new File([myBlob], "test.nwt");

            console.log(files);
            // const reader = new FileReader();
            // reader.onload = e => {
            //     console.log(e.target.result);
            // };
            // reader.readAsDataURL(myBlob);
        })
        .catch(error => {
            console.error(
                'There has been a problem with your fetch operation:',
                error
            );
        });
};


document.getElementById("display-demo-graphs").addEventListener("click", (event) => {
    console.log("display-demo-graphs");
    // let dataTransfer = new DataTransfer();
    // const file = new File(['Hello world!'], 'hello.txt', {type: 'text/plain'})
    //
    // dataTransfer.items.add(file);
    //
    // document.getElementById('picker').files = dataTransfer.files;

    readSamples();

});

