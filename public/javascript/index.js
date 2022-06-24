const graphChoiceEnum = {
    JSON: 1, ANALYSIS: 2,
    DEMO: 3,
};

let graphChoice = graphChoiceEnum.ANALYSIS;


function buildFolderTree(paths, treeNode, file, parentNodePath = '') {

    let idSeparator = '___';
    if (paths.length === 0) {
        return;
    }

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
    treeNode.push(newNode);
    buildFolderTree(paths.splice(1, paths.length), newNode.children, file, nodeId);
}

/***
 * Organizes data as a tree and displays the jstree associated with it
 * @param fileList: List of files to display
 * @param isFromClient: file list structure is different depending on whether it is coming from the server or client
 */
function buildAndDisplayFolderTree(fileList, isFromClient, chosenNodeId) {

    let data = [];

    fileList.forEach(file => {
        let paths = file.webkitRelativePath.split('/').slice(0, -1);
        buildFolderTree(paths, data, file)
    })

    let hierarchy = {core: {data: data}};

    console.log(JSON.stringify(hierarchy))
}

/***
 * Load graph directories as a tree in json format
 * In visualize results from a previous analysis
 */
function loadAnalysisFilesFromClient(fileList, chosenNodeId) {
    graphChoice = graphChoiceEnum.JSON;
    this.buildAndDisplayFolderTree(fileList, true, chosenNodeId);
}


document.getElementById('graph-file-input')
    .addEventListener('change', (event) => {
        let files = event.target.files;

        let fileList = Array.from(files);

        this.loadAnalysisFilesFromClient(fileList);
    });