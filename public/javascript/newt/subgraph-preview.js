// floating preview panel for the "load subgraph" feature.
// renders a filtered sif in its own mini chise/cytoscape instance so the user
// can check out a subgraph without touching the graph they're working on.

var $ = require('jquery');
var chise = require('chise');
var subgraphUtils = require('./subgraph-utils');
var mainCanvasLoad = require('./main-canvas-load');

var PANEL_ID = 'subgraph-preview-panel';
var STYLE_ID = 'subgraph-preview-styles';
// the preview cy is intentionally NOT registered as an app network. the app's
// document-level load handlers detect that (getChiseInstance returns undefined)
// and skip their network-management work, leaving the preview fully isolated.
var CY_ID = 'subgraph-preview-cy';

// only one preview alive at a time -> { $panel, instance }
var current = null;

// scoped styles, injected once. keeps everything in this one file (no css build)
function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
        '.subgraph-preview-panel{position:fixed;bottom:16px;right:16px;width:420px;',
        'height:320px;background:#fff;border:1px solid #b5b5b5;border-radius:4px;',
        'box-shadow:0 4px 16px rgba(0,0,0,.25);display:flex;flex-direction:column;',
        'z-index:1040;overflow:hidden;}',
        '.subgraph-preview-header{flex:0 0 auto;display:flex;align-items:center;',
        'justify-content:space-between;padding:6px 10px;background:#f5f5f5;',
        'border-bottom:1px solid #ddd;cursor:move;user-select:none;}',
        '.subgraph-preview-title{font-weight:bold;font-size:12px;color:#333;',
        'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:8px;}',
        '.subgraph-preview-close{cursor:pointer;font-size:18px;line-height:1;',
        'color:#888;padding:0 4px;}',
        '.subgraph-preview-close:hover{color:#333;}',
        '.subgraph-preview-cy{flex:1 1 auto;min-height:0;background:#fff;}',
        '.subgraph-preview-footer{flex:0 0 auto;padding:6px 10px;border-top:1px solid #ddd;',
        'text-align:right;background:#fafafa;}',
        '.subgraph-preview-resize{position:absolute;width:14px;height:14px;right:2px;',
        'bottom:2px;cursor:nwse-resize;background:linear-gradient(135deg,transparent 50%,#bbb 50%);}',
    ].join('');
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
}

// "fileName — N genes", or "fileName — full graph" when nothing was picked
function titleText(fileName, genes) {
    var n = (genes || []).length;
    var base = fileName || 'subgraph';
    if (!n) return base + ' — full graph';
    return base + ' — ' + n + ' gene' + (n === 1 ? '' : 's');
}

// sif text -> a File, same shape the main load path uses
function sifToFile(subSif, fileName) {
    var blob = new Blob([(subSif || '').trim()], { type: 'text/plain;' });
    return new File([blob], fileName || 'subgraph.sif', {
        lastModified: new Date(),
        type: 'text/plain;',
    });
}

// tear down the live preview, destroys the mini cy to avoid instance leaks
function destroy() {
    if (!current) return;
    try {
        var cy = current.instance && current.instance.getCy();
        if (cy) cy.destroy();
    } catch (e) { /* instance already gone */ }
    if (current.$panel) current.$panel.remove();
    current = null;
}

function buildPanel(fileName, genes) {
    var $panel = $(
        '<div id="' + PANEL_ID + '" class="subgraph-preview-panel">' +
        '<div class="subgraph-preview-header">' +
        '<span class="subgraph-preview-title"></span>' +
        '<span class="subgraph-preview-close" title="Close">&times;</span>' +
        '</div>' +
        '<div id="' + CY_ID + '" class="subgraph-preview-cy"></div>' +
        '<div class="subgraph-preview-footer">' +
        '<button type="button" class="btn btn-primary btn-xs subgraph-preview-promote">' +
        'Promote to main canvas</button>' +
        '</div>' +
        '<div class="subgraph-preview-resize" title="Resize"></div>' +
        '</div>'
    );
    $panel.find('.subgraph-preview-title').text(titleText(fileName, genes));
    return $panel;
}

// drag the panel by its header
function wireDrag($panel) {
    $panel.find('.subgraph-preview-header').on('mousedown', function (e) {
        if ($(e.target).hasClass('subgraph-preview-close')) return;
        e.preventDefault();
        var rect = $panel[0].getBoundingClientRect();
        var offX = e.clientX - rect.left;
        var offY = e.clientY - rect.top;
        function move(ev) {
            $panel.css({
                left: (ev.clientX - offX) + 'px',
                top: (ev.clientY - offY) + 'px',
                right: 'auto',
                bottom: 'auto',
            });
        }
        function up() {
            $(document).off('mousemove', move).off('mouseup', up);
        }
        $(document).on('mousemove', move).on('mouseup', up);
    });
}

// drag the corner handle to resize while keeping the mini cy in sync
function wireResize($panel, cy) {
    $panel.find('.subgraph-preview-resize').on('mousedown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var startX = e.clientX, startY = e.clientY;
        var startW = $panel.width(), startH = $panel.height();
        function move(ev) {
            $panel.css({
                width: Math.max(260, startW + (ev.clientX - startX)) + 'px',
                height: Math.max(200, startH + (ev.clientY - startY)) + 'px',
            });
            if (cy) cy.resize();
        }
        function up() {
            $(document).off('mousemove', move).off('mouseup', up);
            if (cy) {
                cy.resize();
                cy.fit(cy.elements(':visible'), 20);
            }
        }
        $(document).on('mousemove', move).on('mouseup', up);
    });
}

// color nodes/edges of the preview directly from the .format content. we set
// cytoscape style bypasses (not data + undo/redo like the app's sifStyle) so this
// works on the isolated overlay instance without the app's network machinery.
function applyColors(cy, formatText) {
    var styles = subgraphUtils.parseFormatStyles(formatText);
    if (!styles.length) return;
    cy.batch(function () {
        styles.forEach(function (s) {
            var eles;
            if (s.selector === 'all-nodes') eles = cy.nodes();
            else if (s.selector === 'all-edges') eles = cy.edges();
            else if (s.eleType === 'node') eles = cy.nodes().filter('[label="' + s.selector + '"]');
            else return; // per-named-edge styling skipped
            if (eles && eles.length) eles.style(s.styleName, s.styleValue);
        });
    });
}

// draw the little "unit of information" circles from the .format rppasite lines,
// the same badges the main canvas shows. sifStyle can't be reused here because it
// drives chise's undoRedo actions, which aren't registered on the overlay's
// undoable:false instance — so we call the public infobox methods directly (they
// have a non-undoable branch that hits elementUtilities synchronously). because
// each add lands immediately, statesandinfos.length gives the next index each time.
function applyInfoboxes(cy, instance, formatText) {
    var boxes = subgraphUtils.parseInfoboxes(formatText);
    if (!boxes.length) return;
    boxes.forEach(function (b) {
        var eles = b.selector === 'all-nodes'
            ? cy.nodes()
            : cy.nodes().filter('[label="' + b.selector + '"]');
        eles.forEach(function (ele) {
            var index = ele.data('statesandinfos').length;
            instance.addStateOrInfoBox(ele, {clazz: 'unit of information', label: {text: ''}});
            instance.updateInfoboxStyle(ele, index,
                {'border-color': b.borderColor, 'background-color': b.bgColor});
            instance.updateInfoboxObj(ele, index, {tooltip: b.tooltip});
            instance.changeStateOrInfoBox(ele, index, b.value, 'unit of information');
        });
    });
}

// group nodes with identical topology into compound boxes, the same way the main
// canvas does (chise's sifTopologyGrouping). needs expand-collapse initialized on
// the cy (done in open) so its lock/unlock cue calls are safe. best-effort: if it
// throws we keep the ungrouped graph rather than break the whole preview.
function applyGrouping(instance) {
    try {
        if (instance.sifTopologyGrouping) instance.sifTopologyGrouping.apply();
    } catch (e) {
        console.warn('[subgraph-preview] topology grouping skipped:', e && e.message);
    }
}

// load the subgraph into the active (main) instance, replacing the current graph.
// goes through the styled canvas loader so it gets colors + grouping too.
function promote(subSif, fileName, format) {
    if (!window.confirm('Load this subgraph into the main canvas? This replaces the current graph.')) {
        return;
    }
    mainCanvasLoad.loadStyledSifToCanvas(subSif, format, fileName);
    destroy();
}

// build + show the panel and render the filtered sif in its own mini instance.
// formatText (optional) drives node/edge colors from the .sif ".format" file.
function open(subSif, fileName, genes, formatText) {
    injectStyles();
    destroy(); // drop any previous preview first

    var $panel = buildPanel(fileName, genes);
    $('body').append($panel);
    current = { $panel: $panel, instance: null };

    // mini graph in its own instance, mirrors ReactionTemplateView preview
    var instance = chise({ networkContainerSelector: '#' + CY_ID, undoable: false });
    current.instance = instance;
    var cy = instance.getCy();

    // init expand-collapse on this cy so the topology grouping's lock/unlock cue
    // calls (cy.expandCollapse('get')...) don't crash on an uninitialized extension
    try {
        cy.expandCollapse({animate: false, undoable: false, fisheye: false});
    } catch (e) { /* extension optional; grouping just won't apply */ }

    // on a successful load: group topologically -> color -> layout the grouped
    // graph -> fit. passing a function as layoutBy means loadSIFFile runs it after
    // the elements are in (and mapType is set to SIF, which grouping requires).
    var file = sifToFile(subSif, fileName);
    instance.loadSIFFile(file, function () {
        applyGrouping(instance);
        applyColors(cy, formatText);
        applyInfoboxes(cy, instance, formatText);
        cy.one('layoutstop', function () {
            cy.resize();
            cy.fit(cy.elements(':visible'), 20);
        });
        cy.layout({
            name: 'fcose',
            animate: false,
            randomize: true,
            fit: true,
            nodeDimensionsIncludeLabels: true,
        }).run();
    });

    wireDrag($panel);
    wireResize($panel, cy);
    $panel.find('.subgraph-preview-close').on('click', destroy);
    $panel.find('.subgraph-preview-promote').on('click', function () {
        promote(subSif, fileName, formatText);
    });

    // div is in the dom now -> make sure cy picks up its real size
    setTimeout(function () { cy.resize(); }, 0);
    return current;
}

module.exports = {
    open: open,
    destroy: destroy,
    titleText: titleText, // exported for unit testing
};
