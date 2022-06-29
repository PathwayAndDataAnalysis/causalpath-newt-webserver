const jsFolderTree = $('#folder-tree-container');

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
        newNode.icon = "./images/tree-newt-icon.png"
    else if (newNode.text.endsWith(".sif"))
        newNode.icon = "./images/tree-sif-icon.png"
    else if (newNode.text.endsWith(".format"))
        newNode.icon = "./images/tree-sif-icon.png"
    else
        newNode.icon = ""

    treeNode.push(newNode);
    buildFolderTree(paths.splice(1, paths.length), newNode.children, file, nodeId);
}

function createConciseTree(hierarchy) {
    let data = [];
    hierarchy.forEach(rootNode => {
            // It means that the node is a file not a folder
            if (rootNode.children.length === 0) {
                if (rootNode.text.endsWith(".sif") || rootNode.text.endsWith(".nwt")) {
                    let node = {
                        'id': rootNode.id,
                        'text': rootNode.text.split(".")[0],
                        'children': [],
                        'state': {opened: true},
                        data: rootNode.data,
                    };
                    data.push(node);
                    createConciseTree(rootNode.children);
                }
            } else {
                let node = {
                    'id': rootNode.id,
                    'text': rootNode.text,
                    'children': [],
                    'state': {opened: true},
                    data: rootNode.data,
                };
                data.push(node);
                createConciseTree(rootNode.children);
            }
            createConciseTree(rootNode.children);
        }
    );
    return data;
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
        if (paths.at(-1).endsWith(".sif") || paths.at(-1).endsWith(".format") || paths.at(-1).endsWith(".nwt")) {
            buildFolderTree(paths, data, file)
        }
    })

    let hierarchy = {core: {data: data}};

    console.log('hierarchy');
    console.log(hierarchy);

    // let hierarchy2 = {core: {data: createConciseTree(hierarchy.core.data)}};
    // console.log('hierarchy2');
    // console.log(hierarchy2);


    $(function () {
        jsFolderTree.jstree(hierarchy);

        // JSTREE node click event
        jsFolderTree.on("dblclick.jstree", function (e) {
            const instance = $.jstree.reference(this);
            let node = instance.get_node(e.target)

            let makeRequest = () =>
                fetch('/api/getJsonAtPath', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(node.data),
                });

            let afterResolve = (fileContent) => {
                console.log('fileContent');
                console.log(fileContent);
            };

            let handleRequestError = (err) => {
                alert('The error message is: \n' + err);
                throw err;
            };

            makeRequest().then((res) =>
                handleResponse(res, afterResolve, handleRequestError)
            );
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

    document.getElementById('back_menu').style.display = 'flex';
    document.getElementById('graph_canvas').style.display = 'flex';
    document.getElementById('body_text').style.display = 'none';
    document.getElementById('selection_menus').style.display = 'none';

    this.loadAnalysisFilesFromClient(fileList);
});

document.getElementById("back_button_label").addEventListener("click", (event) => {
    document.getElementById('back_menu').style.display = 'none';
    document.getElementById('graph_canvas').style.display = 'none';
    document.getElementById('body_text').style.display = 'flex';
    document.getElementById('selection_menus').style.display = 'flex';
});