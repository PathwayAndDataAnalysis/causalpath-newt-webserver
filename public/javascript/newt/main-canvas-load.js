// loads a graph onto the MAIN canvas (the active instance) with the proper sif
// look: node colors + infoboxes from the .format file (via sifStyle) and the
// topology grouping that the active instance applies during load. same result
// as double-clicking the file. used by the "open" and "load subgraph" menu items.
//
// this deliberately targets the ACTIVE instance (not a standalone one) so all the
// app's styling/grouping machinery runs normally -> that's why the colors and
// grouping come out right here, unlike the isolated overlay preview.

var appUtilities = require('./app-utilities');
var sifStyleFactory = require('./sif-style-factory');

// sif text -> a File, same shape the dblclick load builds
function sifFileFrom(sifText, fileName) {
    var blob = new Blob([(sifText || '').trim()], {type: 'text/plain;'});
    return new File([blob], fileName || 'graph.sif', {
        lastModified: new Date(),
        type: 'text/plain;',
    });
}

// load sifText into the active instance, then apply the .format styling once the
// graph is in. mirrors the ANALYZED_FILE dblclick path (triggerLayout + sifStyle).
function loadStyledSifToCanvas(sifText, formatText, fileName, onInvalid) {
    var chiseInstance = appUtilities.getActiveChiseInstance();
    var cy = appUtilities.getActiveCy();
    var sifStyle = sifStyleFactory();
    var file = sifFileFrom(sifText, fileName);

    var layoutBy = function () {
        appUtilities.triggerLayout(cy, true);
        // colors + infoboxes come from the .format file; grouping is applied by
        // the instance itself during load. skip if there's no format content.
        if (formatText) {
            sifStyle(chiseInstance);
            sifStyle.apply(formatText.trim());
        }
    };

    chiseInstance.loadSIFFile(file, layoutBy, onInvalid || function () {});
}

module.exports = {
    sifFileFrom: sifFileFrom,
    loadStyledSifToCanvas: loadStyledSifToCanvas,
};
