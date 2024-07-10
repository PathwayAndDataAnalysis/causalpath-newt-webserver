const chise = require('chise');
const sbgnviz = require('sbgnviz');
const filesaver = require('file-saver');
const konva = require('konva');
const tippy = require('tippy.js');
window.jQuery = window.jquery = window.$ = require('jquery'); // jquery should be global because jquery.qtip extension is not compatible with commonjs
const cytoscape = require('cytoscape');

require('jquery-expander')($);
require('bootstrap');

// const appUtilities = require("./js/app-utilities");
// const appMenu = require("./js/app-menu");
const appUtilities = require('./newt/app-utilities');
const appMenu = require('./newt/app-menu');

// Get cy extension instances
var cyPanzoom = require('cytoscape-panzoom');
//var cyQtip = require('cytoscape-qtip');
var cyFcose = require('cytoscape-fcose');
var cyUndoRedo = require('cytoscape-undo-redo');
var cyClipboard = require('cytoscape-clipboard');
var cyContextMenus = require('cytoscape-context-menus');
var cyExpandCollapse = require('cytoscape-expand-collapse');
var cyEdgeEditing = require('cytoscape-edge-editing');
var cyViewUtilities = require('cytoscape-view-utilities');
var cyEdgehandles = require('cytoscape-edgehandles');
var cyGridGuide = require('cytoscape-grid-guide');
var cyAutopanOnDrag = require('cytoscape-autopan-on-drag');
var cyNodeResize = require('cytoscape-node-resize');
var cyPopper = require('cytoscape-popper');
var cyLayoutUtilities = require('cytoscape-layout-utilities');

// Register cy extensions
cyPanzoom( cytoscape, $ );
//cyQtip( cytoscape, $ );
cyFcose( cytoscape );
cyUndoRedo( cytoscape );
cyClipboard( cytoscape, $ );
cyContextMenus( cytoscape, $ );
cyExpandCollapse( cytoscape, $ );
cyEdgeEditing( cytoscape, $ );
cyViewUtilities( cytoscape, $ );
cyEdgehandles( cytoscape );
cyGridGuide( cytoscape, $ );
cyAutopanOnDrag( cytoscape );
cyNodeResize( cytoscape, $, konva );
cyPopper( cytoscape );
cyLayoutUtilities( cytoscape );


// Libraries to pass sbgnviz
var libs = {};

libs.filesaver = filesaver;
libs.jquery = jquery;
libs.cytoscape = cytoscape;
libs.sbgnviz = sbgnviz;
libs.tippy = tippy;


$(document).ready(function () {

  // Register chise with libs
  chise.register(libs);

  appMenu();

  // create a new network and access the related chise.js instance
  appUtilities.createNewNetwork();

  // launch with model file if exists
  appUtilities.launchWithModelFile();
});
