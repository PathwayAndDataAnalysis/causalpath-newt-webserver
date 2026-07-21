// little badge that sits above the file tree to remind the user the canvas is a
// selected-genes subgraph (not the full graph). lets them drop a seed gene at a
// time -> we recompute seeds + 1-hop neighbors from the original full sif and
// reload the canvas. removing the last one (or "show full graph") reloads the
// whole graph and hides the badge.

var $ = require('jquery');
var subgraphUtils = require('./subgraph-utils');
var mainCanvasLoad = require('./main-canvas-load');

var CONTAINER_ID = 'subgraph-indicator-container';
var STYLE_ID = 'subgraph-indicator-styles';

// null when inactive, else { fullSif, format, fileName, seeds:[], geneSet }
var state = null;
var expanded = false;
var note = ''; // transient message shown under the add-genes input
var focusInput = false; // refocus the add-genes input after the next render

// scoped styles, injected once (no css build, same trick as subgraph-preview)
function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
        '.subgraph-indicator{margin:8px 8px 4px;border:1px solid #cdd6e0;',
        'border-radius:4px;background:#f3f7fb;font-size:12px;color:#33475b;}',
        '.subgraph-indicator-bar{display:flex;align-items:center;justify-content:space-between;',
        'padding:6px 8px;cursor:pointer;user-select:none;}',
        '.subgraph-indicator-bar:hover{background:#e9f0f7;}',
        '.subgraph-indicator-label{font-weight:bold;overflow:hidden;text-overflow:ellipsis;',
        'white-space:nowrap;margin-right:6px;}',
        '.subgraph-indicator-caret{flex:0 0 auto;color:#7a8ba0;}',
        '.subgraph-indicator-body{padding:2px 8px 8px;}',
        '.subgraph-indicator-chip{display:inline-flex;align-items:center;background:#fff;',
        'border:1px solid #b9c6d6;border-radius:10px;padding:1px 6px;margin:2px 4px 2px 0;}',
        '.subgraph-indicator-chip-x{margin-left:5px;cursor:pointer;color:#8899aa;font-weight:bold;}',
        '.subgraph-indicator-chip-x:hover{color:#d33;}',
        '.subgraph-indicator-full{display:inline-block;margin-top:4px;color:#2a6ebb;',
        'cursor:pointer;text-decoration:underline;}',
        '.subgraph-indicator-add-row{display:flex;gap:4px;margin-top:4px;}',
        '.subgraph-indicator-input{flex:1 1 auto;min-width:0;border:1px solid #b9c6d6;',
        'border-radius:3px;padding:2px 6px;font-size:12px;}',
        '.subgraph-indicator-add{flex:0 0 auto;border:1px solid #2a6ebb;background:#2a6ebb;',
        'color:#fff;border-radius:3px;padding:2px 8px;cursor:pointer;font-size:12px;}',
        '.subgraph-indicator-add:hover{background:#215aa0;}',
        '.subgraph-indicator-note{margin-top:3px;color:#c0392b;min-height:0;}',
    ].join('');
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
}

function $container() {
    return $('#' + CONTAINER_ID);
}

// build the badge markup from current state + expanded flag
function render() {
    var $c = $container();
    if (!$c.length || !state) return;
    var n = state.seeds.length;
    var caret = expanded ? '&#9652;' : '&#9662;'; // ▲ / ▼
    var html = '<div class="subgraph-indicator">' +
        '<div class="subgraph-indicator-bar">' +
        '<span class="subgraph-indicator-label">Subgraph &bull; ' + n +
        ' gene' + (n === 1 ? '' : 's') + '</span>' +
        '<span class="subgraph-indicator-caret">' + caret + '</span>' +
        '</div>';
    if (expanded) {
        var chips = state.seeds.map(function (g) {
            return '<span class="subgraph-indicator-chip">' + _escape(g) +
                '<span class="subgraph-indicator-chip-x" data-gene="' + _escape(g) +
                '" title="Remove">&times;</span></span>';
        }).join('');
        html += '<div class="subgraph-indicator-body">' + chips +
            '<div class="subgraph-indicator-add-row">' +
            '<input type="text" class="subgraph-indicator-input" placeholder="add gene(s)…">' +
            '<button type="button" class="subgraph-indicator-add">Add</button>' +
            '</div>' +
            '<div class="subgraph-indicator-note">' + _escape(note) + '</div>' +
            '<div><span class="subgraph-indicator-full">Show full graph</span></div>' +
            '</div>';
    }
    html += '</div>';
    $c.html(html);
    // keep focus in the input across the re-render so the user can keep typing
    if (expanded && focusInput) {
        var el = $c.find('.subgraph-indicator-input')[0];
        if (el) el.focus();
    }
    focusInput = false;
}

// minimal html escaper (gene names are simple, but stay safe)
function _escape(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch];
    });
}

// recompute the subgraph from the current seeds and reload the canvas
function reFilter() {
    var parsed = subgraphUtils.parseSifGenes(state.fullSif);
    var nodeSet = subgraphUtils.expandWithNeighbors(parsed.adjacency, state.seeds);
    var subSif = subgraphUtils.filterSif(state.fullSif, nodeSet);
    mainCanvasLoad.loadStyledSifToCanvas(subSif, state.format, state.fileName);
    render();
}

// reload the original full graph and drop the badge
function showFull() {
    if (!state) return;
    mainCanvasLoad.loadStyledSifToCanvas(state.fullSif, state.format, state.fileName);
    hide();
}

function removeGene(name) {
    if (!state) return;
    state.seeds = subgraphUtils.removeSeed(state.seeds, name);
    if (!state.seeds.length) {
        showFull();
    } else {
        reFilter();
    }
}

// add one or more typed gene names to the seeds. only genes present in the full
// graph count; anything else is reported in the note. re-filters if we added any.
function addFromText(text) {
    if (!state) return;
    var tokens = subgraphUtils.splitPastedGenes(text);
    var added = [];
    var unknown = [];
    tokens.forEach(function (name) {
        if (!state.geneSet.has(name)) {
            if (unknown.indexOf(name) === -1) unknown.push(name);
        } else if (state.seeds.indexOf(name) === -1) {
            state.seeds.push(name);
            added.push(name);
        }
    });
    note = unknown.length ? ('not in graph: ' + unknown.join(', ')) : '';
    focusInput = true;
    if (added.length) {
        reFilter(); // recompute + render
    } else {
        render(); // nothing added, just surface the note
    }
}

// delegated click handlers, bound once against the container
function wireEvents() {
    var $c = $container();
    if (!$c.length || $c.data('wired')) return;
    $c.data('wired', true);
    $c.on('click', '.subgraph-indicator-bar', function () {
        expanded = !expanded;
        note = '';
        render();
    });
    $c.on('click', '.subgraph-indicator-chip-x', function (e) {
        e.stopPropagation();
        removeGene($(this).attr('data-gene'));
    });
    $c.on('click', '.subgraph-indicator-full', function (e) {
        e.stopPropagation();
        showFull();
    });
    // add genes: click the button or press Enter in the input
    $c.on('click', '.subgraph-indicator-add', function (e) {
        e.stopPropagation();
        var $input = $c.find('.subgraph-indicator-input');
        addFromText($input.val());
    });
    $c.on('keydown', '.subgraph-indicator-input', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addFromText(this.value);
        }
    });
}

// show the badge for a freshly loaded selected-genes subgraph
function show(opts) {
    opts = opts || {};
    if (!opts.seeds || !opts.seeds.length) {
        hide();
        return;
    }
    injectStyles();
    var fullSif = opts.fullSif || '';
    state = {
        fullSif: fullSif,
        format: opts.format || '',
        fileName: opts.fileName || '',
        seeds: opts.seeds.slice(),
        // gene names present in the full graph, for validating typed additions
        geneSet: new Set(subgraphUtils.parseSifGenes(fullSif).genes),
    };
    expanded = false;
    note = '';
    wireEvents();
    render();
}

function hide() {
    state = null;
    expanded = false;
    note = '';
    $container().empty();
}

module.exports = {
    show: show,
    hide: hide,
};
