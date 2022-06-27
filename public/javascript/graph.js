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
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___tumor___CausalPath-classical___causative.sif",
                                "text": "causative.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___tumor___CausalPath-classical___conflicting.sif",
                                "text": "conflicting.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___tumor___CausalPath-classical___causative.format",
                                "text": "causative.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
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
                                "text": "TF-activity.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___vehicle_epithelial___CausalPath-rank-based___vehicle_epithelial.TF-activity.format",
                                "text": "TF-activity.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
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
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___vehicle_epithelial___CausalPath-classical___causative.sif",
                                "text": "causative.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___vehicle_epithelial___CausalPath-classical___conflicting.sif",
                                "text": "conflicting.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___vehicle_epithelial___CausalPath-classical___causative.format",
                                "text": "causative.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
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
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___M-TPC___CausalPath-rank-based___M-TPC.TF-activity.sif",
                                "text": "M-TPC.TF-activity.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
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
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___M-TPC___CausalPath-classical___causative.sif",
                                "text": "causative.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___M-TPC___CausalPath-classical___conflicting.sif",
                                "text": "conflicting.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___M-TPC___CausalPath-classical___causative.format",
                                "text": "causative.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
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
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___T-TPC___CausalPath-rank-based___T-TPC.TF-activity.format",
                                "text": "T-TPC.TF-activity.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
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
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___T-TPC___CausalPath-classical___causative.sif",
                                "text": "causative.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___T-TPC___CausalPath-classical___conflicting.sif",
                                "text": "conflicting.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___T-TPC___CausalPath-classical___causative.format",
                                "text": "causative.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
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
                                "icon": "./images/tree-newt-icon.png"
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
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___4nqo_epithelial___CausalPath-classical___causative.sif",
                                "text": "causative.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___4nqo_epithelial___CausalPath-classical___conflicting.sif",
                                "text": "conflicting.sif",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
                            }, {
                                "id": "___TPC___4nqo_epithelial___CausalPath-classical___causative.format",
                                "text": "causative.format",
                                "children": [],
                                "state": {"opened": true},
                                "data": {},
                                "icon": "./images/tree-sif-icon.png"
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

    // jstree node click event
    $('#folder-tree-container').on('dblclick.jstree', function (e, data) {

        const instance = $('#folder-tree-container').jstree(true);
        let node = instance.get_node(e.target)
        console.log(node.path)

        console.log(node)
        //
        // // make requests
        // let makeRequest = () =>
        //     fetch('/api/getJsonAtPath', {
        //         method: 'POST',
        //         headers: {
        //             'content-type': 'application/json',
        //         },
        //         body: JSON.stringify(file),
        //     });
        //
        // let afterResolve = (fileContent) => {
        //     console.log(fileContent)
        // };
        //
        // let handleRequestError = (err) => {
        //     alert('The error message is:\n' + err);
        //     throw err;
        // };
        // makeRequest().then((res) =>
        //     handleResponse(res, afterResolve, handleRequestError)
        // );

    });
});


/*


{id: '___TPC___4nqo_epithelial___CausalPath-classical', text: 'CausalPath-classical', icon: true, parent: '___TPC___4nqo_epithelial', parents: Array(3), …}
a_attr: {href: '#', id: '___TPC___4nqo_epithelial___CausalPath-classical_anchor'}
children: []
children_d: []
data: File
    lastModified: 1651673993000
    lastModifiedDate: Wed May 04 2022 10:19:53 GMT-0400 (Eastern Daylight Time) {}
    name: "causative.json"
    size: 36
    type: "application/json"
    webkitRelativePath: "TPC/4nqo_epithelial/CausalPath-classical/causative.json"
[[Prototype]]: File
icon: true
id: "___TPC___4nqo_epithelial___CausalPath-classical"
li_attr: {id: '___TPC___4nqo_epithelial___CausalPath-classical'}
original: {id: '___TPC___4nqo_epithelial___CausalPath-classical', text: 'CausalPath-classical', state: {…}}
parent: "___TPC___4nqo_epithelial"
parents: (3) ['___TPC___4nqo_epithelial', '___TPC', '#']
state: {loaded: true, opened: false, selected: true, disabled: false}
text: "CausalPath-classical"
[[Prototype]]: Object


*
* **/

// File:
// File {name: 'conflicting.sif', lastModified: 1654624258759, lastModifiedDate: Tue Jun 07 2022 13:50:58 GMT-0400 (Eastern Daylight Time), webkitRelativePath: 'TPC/T-TPC/CausalPath-classical/conflicting.sif', size: 707, …}
// lastModified: 1654624258759
// lastModifiedDate: Tue Jun 07 2022 13:50:58 GMT-0400 (Eastern Daylight Time) {}
// name: "conflicting.sif"
// size: 707
// type: ""
// webkitRelativePath: "TPC/T-TPC/CausalPath-classical/conflicting.sif"
//     [[Prototype]]: File


// New File
// File {name: 'conflicting.sif', lastModified: 1651673993000, lastModifiedDate: Wed May 04 2022 10:19:53 GMT-0400 (Eastern Daylight Time), webkitRelativePath: 'TPC/4nqo_epithelial/CausalPath-classical/conflicting.sif', size: 0, …}
// lastModified: 1651673993000
// lastModifiedDate: Wed May 04 2022 10:19:53 GMT-0400 (Eastern Daylight Time) {}
// name: "conflicting.sif"
// size: 0
// type: ""
// webkitRelativePath: "TPC/4nqo_epithelial/CausalPath-classical/conflicting.sif"
//     [[Prototype]]: File

//
// {
//     "core"
// :
//     {
//         "data"
//     :
//         [{
//             "id": "___TPC",
//             "text": "TPC",
//             "children": [{
//                 "id": "___TPC___tumor",
//                 "text": "tumor",
//                 "children": [{
//                     "id": "___TPC___tumor___CausalPath-classical",
//                     "text": "CausalPath-classical",
//                     "children": [{
//                         "id": "___TPC___tumor___CausalPath-classical___conflicting.format",
//                         "text": "conflicting.format",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___tumor___CausalPath-classical___causative.sif",
//                         "text": "causative.sif",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___tumor___CausalPath-classical___conflicting.sif",
//                         "text": "conflicting.sif",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___tumor___CausalPath-classical___causative.format",
//                         "text": "causative.format",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }],
//                     "state": {"opened": true},
//                     "data": {}
//                 }],
//                 "state": {"opened": true},
//                 "data": {}
//             }, {
//                 "id": "___TPC___vehicle_epithelial",
//                 "text": "vehicle_epithelial",
//                 "children": [{
//                     "id": "___TPC___vehicle_epithelial___CausalPath-rank-based",
//                     "text": "CausalPath-rank-based",
//                     "children": [{
//                         "id": "___TPC___vehicle_epithelial___CausalPath-rank-based___vehicle_epithelial.TF-activity.sif",
//                         "text": "vehicle_epithelial.TF-activity.sif",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___vehicle_epithelial___CausalPath-rank-based___vehicle_epithelial.TF-activity.format",
//                         "text": "vehicle_epithelial.TF-activity.format",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }],
//                     "state": {"opened": true},
//                     "data": {}
//                 }, {
//                     "id": "___TPC___vehicle_epithelial___CausalPath-classical",
//                     "text": "CausalPath-classical",
//                     "children": [{
//                         "id": "___TPC___vehicle_epithelial___CausalPath-classical___conflicting.format",
//                         "text": "conflicting.format",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___vehicle_epithelial___CausalPath-classical___causative.sif",
//                         "text": "causative.sif",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___vehicle_epithelial___CausalPath-classical___conflicting.sif",
//                         "text": "conflicting.sif",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___vehicle_epithelial___CausalPath-classical___causative.format",
//                         "text": "causative.format",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }],
//                     "state": {"opened": true},
//                     "data": {}
//                 }],
//                 "state": {"opened": true},
//                 "data": {}
//             }, {
//                 "id": "___TPC___M-TPC",
//                 "text": "M-TPC",
//                 "children": [{
//                     "id": "___TPC___M-TPC___CausalPath-rank-based",
//                     "text": "CausalPath-rank-based",
//                     "children": [{
//                         "id": "___TPC___M-TPC___CausalPath-rank-based___M-TPC.TF-activity.format",
//                         "text": "M-TPC.TF-activity.format",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___M-TPC___CausalPath-rank-based___M-TPC.TF-activity.sif",
//                         "text": "M-TPC.TF-activity.sif",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }],
//                     "state": {"opened": true},
//                     "data": {}
//                 }, {
//                     "id": "___TPC___M-TPC___CausalPath-classical",
//                     "text": "CausalPath-classical",
//                     "children": [{
//                         "id": "___TPC___M-TPC___CausalPath-classical___conflicting.format",
//                         "text": "conflicting.format",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___M-TPC___CausalPath-classical___causative.sif",
//                         "text": "causative.sif",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___M-TPC___CausalPath-classical___conflicting.sif",
//                         "text": "conflicting.sif",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___M-TPC___CausalPath-classical___causative.format",
//                         "text": "causative.format",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }],
//                     "state": {"opened": true},
//                     "data": {}
//                 }],
//                 "state": {"opened": true},
//                 "data": {}
//             }, {
//                 "id": "___TPC___T-TPC",
//                 "text": "T-TPC",
//                 "children": [{
//                     "id": "___TPC___T-TPC___CausalPath-rank-based",
//                     "text": "CausalPath-rank-based",
//                     "children": [{
//                         "id": "___TPC___T-TPC___CausalPath-rank-based___T-TPC.TF-activity.sif",
//                         "text": "T-TPC.TF-activity.sif",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___T-TPC___CausalPath-rank-based___T-TPC.TF-activity.format",
//                         "text": "T-TPC.TF-activity.format",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }],
//                     "state": {"opened": true},
//                     "data": {}
//                 }, {
//                     "id": "___TPC___T-TPC___CausalPath-classical",
//                     "text": "CausalPath-classical",
//                     "children": [{
//                         "id": "___TPC___T-TPC___CausalPath-classical___conflicting.format",
//                         "text": "conflicting.format",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___T-TPC___CausalPath-classical___causative.sif",
//                         "text": "causative.sif",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___T-TPC___CausalPath-classical___conflicting.sif",
//                         "text": "conflicting.sif",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___T-TPC___CausalPath-classical___causative.format",
//                         "text": "causative.format",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }],
//                     "state": {"opened": true},
//                     "data": {}
//                 }, {
//                     "id": "___TPC___T-TPC___Newt Files",
//                     "text": "Newt Files",
//                     "children": [{
//                         "id": "___TPC___T-TPC___Newt Files___test.nwt",
//                         "text": "test.nwt",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-newt-icon.png"
//                     }],
//                     "state": {"opened": true},
//                     "data": {}
//                 }],
//                 "state": {"opened": true},
//                 "data": {}
//             }, {
//                 "id": "___TPC___4nqo_epithelial",
//                 "text": "4nqo_epithelial",
//                 "children": [{
//                     "id": "___TPC___4nqo_epithelial___CausalPath-classical",
//                     "text": "CausalPath-classical",
//                     "children": [{
//                         "id": "___TPC___4nqo_epithelial___CausalPath-classical___conflicting.format",
//                         "text": "conflicting.format",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___4nqo_epithelial___CausalPath-classical___causative.sif",
//                         "text": "causative.sif",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___4nqo_epithelial___CausalPath-classical___conflicting.sif",
//                         "text": "conflicting.sif",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }, {
//                         "id": "___TPC___4nqo_epithelial___CausalPath-classical___causative.format",
//                         "text": "causative.format",
//                         "children": [],
//                         "state": {"opened": true},
//                         "data": {},
//                         "icon": "./images/tree-sif-icon.png"
//                     }],
//                     "state": {"opened": true},
//                     "data": {}
//                 }],
//                 "state": {"opened": true},
//                 "data": {}
//             }],
//             "state": {"opened": true},
//             "data": {}
//         }]
//     }
// }