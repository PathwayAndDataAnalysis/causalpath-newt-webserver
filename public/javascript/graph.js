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

$(function () {
    $('#folder-tree-container').jstree({
        "core":
            {
                "data":
                    [{
                        "id": "___T-TPC",
                        "text": "T-TPC",
                        "children": [{
                            "id": "___T-TPC___CausalPath-rank-based",
                            "text": "CausalPath-rank-based",
                            "children": [],
                            "state": {"opened": true},
                            "data": {}
                        }, {
                            "id": "___T-TPC___CausalPath-classical",
                            "text": "CausalPath-classical",
                            "children": [{
                                "id": "___T-TPC___CausalPath-classical___.panda",
                                "text": ".panda",
                                "children": [{
                                    "id": "___T-TPC___CausalPath-classical___.panda___SignedPC",
                                    "text": "SignedPC",
                                    "children": [],
                                    "state": {"opened": true},
                                    "data": {}
                                }, {
                                    "id": "___T-TPC___CausalPath-classical___.panda___PC",
                                    "text": "PC",
                                    "children": [],
                                    "state": {"opened": true},
                                    "data": {}
                                }],
                                "state": {"opened": true},
                                "data": {}
                            }],
                            "state": {"opened": true},
                            "data": {}
                        }, {
                            "id": "___T-TPC___.panda",
                            "text": ".panda",
                            "children": [{
                                "id": "___T-TPC___.panda___SignedPC",
                                "text": "SignedPC",
                                "children": [],
                                "state": {"opened": true},
                                "data": {}
                            }, {
                                "id": "___T-TPC___.panda___PC",
                                "text": "PC",
                                "children": [],
                                "state": {"opened": true},
                                "data": {}
                            }],
                            "state": {"opened": true},
                            "data": {}
                        }],
                        "state": {"opened": true},
                        "data": {}
                    }]
            }
    });

// jstree node click event
    $('#folder-tree-container').on('dblclick.jstree', function (e, data) {

        const instance = $('#folder-tree-container').jstree(true);
        let node = instance.get_node(e.target)
        let file = node.data

        // make requests
        let makeRequest = () =>
            fetch('/api/getJsonAtPath', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify(file),
            });

        let afterResolve = (fileContent) => {
            console.log(fileContent)
        };

        let handleRequestError = (err) => {
            alert('The error message is:\n' + err);
            throw err;
        };
        makeRequest().then((res) =>
            handleResponse(res, afterResolve, handleRequestError)
        );

    });
});
