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
        // else if (newNode.text.endsWith(".format"))
    //     newNode.icon = "./img/tree-sif-icon.png"
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
            /*|| paths.at(-1).endsWith(".format") */
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
            $('#folder-tree-container').jstree(hierarchy);

            // JSTREE node click event
            $('#folder-tree-container').on("dblclick.jstree", function (e) {
                const instance = $.jstree.reference(this);
                let node = instance.get_node(e.target)

                let file = node.data;
                // console.log('node');
                // console.log(node);
                // console.log(node.data);
                //
                // let reader = new FileReader();
                // reader.onload = function (e) {
                //     console.log(e.target.result)
                // }
                // reader.readAsText(node.data);

                console.log("clickedfile")
                console.log(file)
                $("#sif-file-input").trigger('click');


            });




            // After jsTree build is complete we can delete un-necessary nodes
            // jsFolderTree.on("loaded.jstree", function (e, data) {
            //     let lonelySIFs = getLonelySifNodes(hierarchy.core.data);
            //     let formatNodes = getFormatNodes(hierarchy.core.data);
            //     let lonelyLeaves = getLonelyLeaves(hierarchy.core.data);
            //
            //
            //     let nodesToDelete = lonelySIFs.concat(formatNodes)
            //     // .concat(lonelyLeaves);
            //
            //     // deleteNodesByID(nodesToDelete);
            //     var ref = $('#folder-tree-container').jstree(true)
            //     let ids = [];
            //     for (let i = 0; i < nodesToDelete.length; i++)
            //         ids.push(nodesToDelete[i].id);
            //     ref.delete_node(ids);
            //
            //     // Remove empty dirs from the tree
            //     // deleteEmptyDirs();
            //
            // });
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

// document.getElementById('graph-file-input').addEventListener('change', (event) => {
//
//     let files = event.target.files;
//
//     let fileList = Array.from(files);
//
//     event.target.value = null; //to make sure the same files can be loaded again
//
//     document.getElementById('back_menu').style.display = 'flex';
//     document.getElementById('graph_canvas').style.display = 'flex';
//     document.getElementById('body_text').style.display = 'none';
//     document.getElementById('selection_menus').style.display = 'none';
//
//     this.loadAnalysisFilesFromClient(fileList);
// });

document.getElementById('picker').addEventListener('change', event => {
    let files = event.target.files;

    let fileList = Array.from(files);

    event.target.value = null; //to make sure the same files can be loaded again

    document.getElementById('menu-text-buttons').style.display = 'none';
    document.getElementById('folder-trees-graphs').style.display = 'block';
    document.getElementById('back_menu').style.display = 'block';
    document.getElementById('graph-container').style.display = 'block';
    document.getElementById('folder-tree-container').style.display = 'block';

    this.loadAnalysisFilesFromClient(fileList);
});

document.getElementById("back_button_label").addEventListener("click", (event) => {
    document.getElementById('menu-text-buttons').style.display = 'block';
    document.getElementById('folder-trees-graphs').style.display = 'none';
    document.getElementById('back_menu').style.display = 'none';
    document.getElementById('graph-container').style.display = 'none';
    document.getElementById('folder-tree-container').style.display = 'none';
});

