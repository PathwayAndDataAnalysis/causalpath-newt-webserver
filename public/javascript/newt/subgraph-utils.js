// helpers for the "load subgraph" feature

// split a sif line into tokens
function splitSifLine(line) {
    return (line || '').trim().split(/\s+/).filter(function (t) {
        return t.length > 0;
    });
}

// split a pasted/typed blob into gene tokens
function splitPastedGenes(text) {
    return (text || '').split(/[\s,]+/).map(function (t) {
        return t.trim();
    }).filter(function (t) {
        return t.length > 0;
    });
}

// read sif text -> { genes: sorted uniq list, adjacency: Map<gene, Set<neighbor>> }
// adjacency is undirected so neighbor expansion works both ways
function parseSifGenes(sifText) {
    var adjacency = new Map();
    function ensure(g) {
        if (!adjacency.has(g)) adjacency.set(g, new Set());
        return adjacency.get(g);
    }
    (sifText || '').split(/\r?\n/).forEach(function (line) {
        var cols = splitSifLine(line);
        if (cols.length === 0) return;
        ensure(cols[0]);
        if (cols.length < 3) return; // standalone node, no edge
        var source = cols[0];
        var target = cols[2];
        ensure(target);
        adjacency.get(source).add(target);
        adjacency.get(target).add(source);
    });
    var genes = Array.from(adjacency.keys()).sort();
    return { genes: genes, adjacency: adjacency };
}

// selected genes + their 1-hop neighbors -> Set of node names (unknown genes skipped)
function expandWithNeighbors(adjacency, selectedGenes) {
    var nodeSet = new Set();
    (selectedGenes || []).forEach(function (g) {
        if (!adjacency.has(g)) return;
        nodeSet.add(g);
        adjacency.get(g).forEach(function (n) {
            nodeSet.add(n);
        });
    });
    return nodeSet;
}

// keep sif lines whose both endpoints are in nodeSet (induced subgraph)
function filterSif(sifText, nodeSet) {
    var out = [];
    (sifText || '').split(/\r?\n/).forEach(function (line) {
        var cols = splitSifLine(line);
        if (cols.length === 0) return;
        if (cols.length < 3) {
            // standalone node line: keep if that node is in the set
            if (nodeSet.has(cols[0])) out.push(line.trim());
            return;
        }
        if (nodeSet.has(cols[0]) && nodeSet.has(cols[2])) out.push(line.trim());
    });
    return out.join('\n');
}

// "R G B" (0-255 each) -> "#rrggbb"
function rgbToHex(rgbStr) {
    var parts = (rgbStr || '').trim().split(/\s+/);
    if (parts.length < 3) return null;
    return '#' + parts.slice(0, 3).map(function (n) {
        var h = Number(n).toString(16);
        return h.length < 2 ? '0' + h : h;
    }).join('');
}

// parse a .sif ".format" file into a flat list of cytoscape style directives:
//   { eleType:'node'|'edge', selector:'all-nodes'|'all-edges'|<name>,
//     styleName:<cy style prop>, styleValue:<string|number> }
// only visual color/border styles are handled here (rppasite infoboxes and
// tooltips are skipped) — enough to color the nodes/edges of the overlay.
function parseFormatStyles(formatText) {
    var nameMapping = {
        node: {color: 'background-color', bordercolor: 'border-color',
            borderwidth: 'border-width', textcolor: 'color'},
        edge: {color: 'line-color', width: 'width'},
    };
    var out = [];
    (formatText || '').split(/\r?\n/).forEach(function (line) {
        if (!line.trim()) return;
        var cols = line.split('\t');
        if (cols.length < 4) return;
        var eleType = cols[0];
        var selector = cols[1];
        var feature = cols[2];
        var value = cols[3];
        var map = nameMapping[eleType];
        if (!map || !map[feature]) return; // skip rppasite/tooltip/unknown
        var styleName = map[feature];
        var styleValue;
        if (styleName.indexOf('-color') !== -1 || styleName === 'color') {
            styleValue = rgbToHex(value);
            if (!styleValue) return;
        } else {
            styleValue = parseInt(value, 10); // width / border-width
            if (isNaN(styleValue)) return;
        }
        out.push({eleType: eleType, selector: selector,
            styleName: styleName, styleValue: styleValue});
    });
    return out;
}

// pull the ".format" rppasite lines into infobox descriptors so the overlay can
// draw the little "unit of information" circles each node carries, same as the
// main canvas does (see sif-style-factory's rppasite handling). each descriptor:
//   { selector:'all-nodes'|<name>, value, bgColor:'#rrggbb', borderColor, tooltip }
// mirrors parseFormatStyles above but for the infobox side it deliberately skips.
function parseInfoboxes(formatText) {
    var out = [];
    (formatText || '').split(/\r?\n/).forEach(function (line) {
        if (!line.trim()) return;
        var cols = line.split('\t');
        if (cols.length < 4) return;
        if (cols[0] !== 'node' || cols[2] !== 'rppasite') return;
        // featureVal is "siteName|value|bg r g b|border r g b|tooltipSuffix"
        var parts = cols[3].split('|');
        if (parts.length < 5) return;
        out.push({
            selector: cols[1],
            value: parts[1],
            bgColor: rgbToHex(parts[2]),
            borderColor: rgbToHex(parts[3]),
            tooltip: parts[0] + ', ' + parts[4],
        });
    });
    return out;
}

// drop one seed gene from a seed list, returning a new array (original untouched)
function removeSeed(seeds, name) {
    return (seeds || []).filter(function (g) {
        return g !== name;
    });
}

module.exports = {
    splitSifLine: splitSifLine,
    splitPastedGenes: splitPastedGenes,
    parseSifGenes: parseSifGenes,
    expandWithNeighbors: expandWithNeighbors,
    filterSif: filterSif,
    rgbToHex: rgbToHex,
    parseFormatStyles: parseFormatStyles,
    parseInfoboxes: parseInfoboxes,
    removeSeed: removeSeed,
};
