
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
    $('#folder-tree-container').jstree(
        {
            "core": {
                "data": [{
                    "id": "___TPC",
                    "text": "TPC",
                    "children": [{
                        "id": "___TPC___tumor",
                        "text": "tumor",
                        "children": [{
                            "id": "___TPC___tumor___CausalPath-classical",
                            "text": "CausalPath-classical",
                            "children": [{
                                "id": "___TPC___tumor___CausalPath-classical___conflicting.format",
                                "text": "conflicting.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___tumor___CausalPath-classical___causative.sif",
                                "text": "causative.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___tumor___CausalPath-classical___conflicting.sif",
                                "text": "conflicting.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___tumor___CausalPath-classical___causative.format",
                                "text": "causative.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }],
                            "state": {"opened": true},
                            "data": {}
                        }],
                        "state": {"opened": true},
                        "data": {}
                    }, {
                        "id": "___TPC___vehicle_epithelial",
                        "text": "vehicle_epithelial",
                        "children": [{
                            "id": "___TPC___vehicle_epithelial___CausalPath-rank-based",
                            "text": "CausalPath-rank-based",
                            "children": [{
                                "id": "___TPC___vehicle_epithelial___CausalPath-rank-based___vehicle_epithelial.TF-activity.sif",
                                "text": "vehicle_epithelial.TF-activity.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___vehicle_epithelial___CausalPath-rank-based___vehicle_epithelial.TF-activity.format",
                                "text": "vehicle_epithelial.TF-activity.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }],
                            "state": {"opened": true},
                            "data": {}
                        }, {
                            "id": "___TPC___vehicle_epithelial___CausalPath-classical",
                            "text": "CausalPath-classical",
                            "children": [{
                                "id": "___TPC___vehicle_epithelial___CausalPath-classical___conflicting.format",
                                "text": "conflicting.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___vehicle_epithelial___CausalPath-classical___causative.sif",
                                "text": "causative.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___vehicle_epithelial___CausalPath-classical___conflicting.sif",
                                "text": "conflicting.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___vehicle_epithelial___CausalPath-classical___causative.format",
                                "text": "causative.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }],
                            "state": {"opened": true},
                            "data": {}
                        }],
                        "state": {"opened": true},
                        "data": {}
                    }, {
                        "id": "___TPC___M-TPC",
                        "text": "M-TPC",
                        "children": [{
                            "id": "___TPC___M-TPC___CausalPath-rank-based",
                            "text": "CausalPath-rank-based",
                            "children": [{
                                "id": "___TPC___M-TPC___CausalPath-rank-based___M-TPC.TF-activity.format",
                                "text": "M-TPC.TF-activity.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___M-TPC___CausalPath-rank-based___M-TPC.TF-activity.sif",
                                "text": "M-TPC.TF-activity.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }],
                            "state": {"opened": true},
                            "data": {}
                        }, {
                            "id": "___TPC___M-TPC___CausalPath-classical",
                            "text": "CausalPath-classical",
                            "children": [{
                                "id": "___TPC___M-TPC___CausalPath-classical___conflicting.format",
                                "text": "conflicting.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___M-TPC___CausalPath-classical___causative.sif",
                                "text": "causative.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___M-TPC___CausalPath-classical___conflicting.sif",
                                "text": "conflicting.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___M-TPC___CausalPath-classical___causative.format",
                                "text": "causative.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }],
                            "state": {"opened": true},
                            "data": {}
                        }],
                        "state": {"opened": true},
                        "data": {}
                    }, {
                        "id": "___TPC___T-TPC",
                        "text": "T-TPC",
                        "children": [{
                            "id": "___TPC___T-TPC___CausalPath-rank-based",
                            "text": "CausalPath-rank-based",
                            "children": [{
                                "id": "___TPC___T-TPC___CausalPath-rank-based___T-TPC.TF-activity.sif",
                                "text": "T-TPC.TF-activity.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___T-TPC___CausalPath-rank-based___T-TPC.TF-activity.format",
                                "text": "T-TPC.TF-activity.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }],
                            "state": {"opened": true},
                            "data": {}
                        }, {
                            "id": "___TPC___T-TPC___CausalPath-classical",
                            "text": "CausalPath-classical",
                            "children": [{
                                "id": "___TPC___T-TPC___CausalPath-classical___conflicting.format",
                                "text": "conflicting.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___T-TPC___CausalPath-classical___causative.sif",
                                "text": "causative.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___T-TPC___CausalPath-classical___conflicting.sif",
                                "text": "conflicting.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___T-TPC___CausalPath-classical___causative.format",
                                "text": "causative.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }],
                            "state": {"opened": true},
                            "data": {}
                        }, {
                            "id": "___TPC___T-TPC___Newt Files",
                            "text": "Newt Files",
                            "children": [{
                                "id": "___TPC___T-TPC___Newt Files___test.nwt",
                                "text": "test.nwt",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-newt-icon.png"
                            }],
                            "state": {"opened": true},
                            "data": {}
                        }],
                        "state": {"opened": true},
                        "data": {}
                    }, {
                        "id": "___TPC___4nqo_epithelial",
                        "text": "4nqo_epithelial",
                        "children": [{
                            "id": "___TPC___4nqo_epithelial___CausalPath-classical",
                            "text": "CausalPath-classical",
                            "children": [{
                                "id": "___TPC___4nqo_epithelial___CausalPath-classical___conflicting.format",
                                "text": "conflicting.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___4nqo_epithelial___CausalPath-classical___causative.sif",
                                "text": "causative.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___4nqo_epithelial___CausalPath-classical___conflicting.sif",
                                "text": "conflicting.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___4nqo_epithelial___CausalPath-classical___causative.format",
                                "text": "causative.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./img/tree-sif-icon.png"
                            }],
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
        }
    );

    // JSTREE node click event
    $('#folder-tree-container').on('dblclick.jstree', function (e) {
        // const instance = $('#folder-tree-container').jstree(true);
        const instance = $.jstree.reference(this);
        let node = instance.get_node(e.target)

        console.log('node')
        // console.log(node)


        // // make requests
        // let makeRequest = () =>
        //     fetch('/api/getJsonAtPath', {
        //         method: 'POST',
        //         headers: {
        //             'content-type': 'application/json',
        //         },
        //         body: JSON.stringify(file),
        //     });
        // let afterResolve = (fileContent) => {
        //     console.log(fileContent)
        // };
        // let handleRequestError = (err) => {
        //     alert('The error message is:\n' + err);
        //     throw err;
        // };
        // makeRequest().then((res) =>
        //     handleResponse(res, afterResolve, handleRequestError)
        // );
    });
});
