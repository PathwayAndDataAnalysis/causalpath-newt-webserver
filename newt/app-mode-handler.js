var appUtilities = require('./app-utilities');

var modeHandler = {
	initialMode: 'selection-mode',
	initialSustainMode: false,
	initialSelectedNodeType: 'macromolecule',
	initialSelectedEdgeType: 'consumption',
	initialSelectedNodeLanguage: 'PD',
	initialSelectedEdgeLanguage: 'PD',

	// inilizes modeProperties field in the scratch pad of cy
	initModeProperties: function (_cy) {
		// if _cy param is not set use the active cy instance
		var cy = _cy || appUtilities.getActiveCy();

		// create an object for mode properties of cy
		var modeProperties = {
			mode: modeHandler.initialMode,
			sustainMode: modeHandler.initialSustainMode,
			selectedNodeType: modeHandler.initialSelectedNodeType,
			selectedEdgeType: modeHandler.initialSelectedEdgeType,
			selectedNodeLanguage: modeHandler.initialSelectedNodeLanguage,
			selectedEdgeLanguage: modeHandler.initialSelectedEdgeLanguage,
		};

		// register mode properties to the scratch pad of cy
		appUtilities.setScratch(cy, 'modeProperties', modeProperties);
	},

	// Set the current mode to add node mode, if nodeType is specified than switch the current node type to the given value,
	// if the nodeType will remain same, add node mode is already enabled and sustain mode is not set before, then set the sustain mode
	// so that users will be able to add the current node type in a sustainable way.
	setAddNodeMode: function (nodeType, language, _cy) {
		// if _cy param is not set use the active cy instance
		var cy = _cy || appUtilities.getActiveCy();
		$(cy.container()).find('canvas').removeClass('add-edge-cursor');
		$(cy.container()).find('canvas').removeClass('zoom-cursor');
		$(cy.container()).find('canvas').addClass('add-node-cursor');
		// access mode properties of the cy
		var modeProperties = appUtilities.getScratch(cy, 'modeProperties');

		var typeChange =
			nodeType && nodeType != modeProperties.selectedNodeType; // See if the type will change
		// Handle sustainable mode
		$('.selected-mode-sustainable').removeClass(
			'selected-mode-sustainable'
		);
		if (
			!typeChange &&
			modeProperties.mode == 'add-node-mode' &&
			!modeProperties.sustainMode
		) {
			modeProperties.sustainMode = true;
			$('#add-node-mode-icon')
				.parent()
				.addClass('selected-mode-sustainable');
			$('.node-palette .selected-mode').addClass(
				'selected-mode-sustainable'
			);
		} else {
			modeProperties.sustainMode = false;
		}

		if (modeProperties.mode == 'marquee-zoom-mode') {
			var viewUtilities = cy.viewUtilities('get');
			viewUtilities.disableMarqueeZoom();
		}

		if (modeProperties.mode != 'add-node-mode') {
			cy.elements().unselect();
			modeProperties.mode = 'add-node-mode';

			$('#select-mode-icon').parent().removeClass('selected-mode');
			$('#add-edge-mode-icon').parent().removeClass('selected-mode');
			$('#add-node-mode-icon').parent().addClass('selected-mode');
			$('#marquee-zoom-mode-icon').parent().removeClass('selected-mode');
			$('.node-palette img').removeClass('inactive-palette-element');
			$('.edge-palette img').addClass('inactive-palette-element');

			modeHandler.autoEnableMenuItems(false);

			cy.edgehandles('drawoff');

			cy.autoungrabify(true);
			cy.autounselectify(true);
		} else if (!modeProperties.sustainMode && !typeChange) {
			modeHandler.setSelectionMode(cy);
		}

		// Check if there is a needed type change if there is perform it.
		if (typeChange) {
			modeProperties.selectedNodeType = nodeType;
		}
		if (language) {
			modeProperties.selectedNodeLanguage = language;
		}

		// reset mode properties of cy
		appUtilities.setScratch(cy, 'modeProperties', modeProperties);
	},
	// Set the current mode to add edge mode, if edgeType is specified than switch the current edge type to the given value,
	// if the edgeType will remain same, add edge mode is already enabled and sustain mode is not set before, then set the sustain mode
	// so that users will be able to add the current edge type in a sustainable way.
	setAddEdgeMode: function (edgeType, language, _cy) {
		// if _cy param is not set use the active cy instance
		var cy = _cy || appUtilities.getActiveCy();
		$(cy.container()).find('canvas').removeClass('add-node-cursor');
		$(cy.container()).find('canvas').removeClass('zoom-cursor');
		$(cy.container()).find('canvas').addClass('add-edge-cursor');
		// access mode properties of the cy
		var modeProperties = appUtilities.getScratch(cy, 'modeProperties');

		var typeChange =
			edgeType && edgeType != modeProperties.selectedEdgeType; // See if the type will change

		// Handle sustainable mode
		$('.selected-mode-sustainable').removeClass(
			'selected-mode-sustainable'
		);
		if (
			!typeChange &&
			modeProperties.mode == 'add-edge-mode' &&
			!modeProperties.sustainMode
		) {
			modeProperties.sustainMode = true;
			$('#add-edge-mode-icon')
				.parent()
				.addClass('selected-mode-sustainable');
			$('.edge-palette .selected-mode').addClass(
				'selected-mode-sustainable'
			);
		} else {
			modeProperties.sustainMode = false;
		}

		if (modeProperties.mode == 'marquee-zoom-mode') {
			var viewUtilities = cy.viewUtilities('get');
			viewUtilities.disableMarqueeZoom();
		}

		if (modeProperties.mode != 'add-edge-mode') {
			cy.elements().unselect();
			modeProperties.mode = 'add-edge-mode';

			$('#select-mode-icon').parent().removeClass('selected-mode');
			$('#add-edge-mode-icon').parent().addClass('selected-mode');
			$('#add-node-mode-icon').parent().removeClass('selected-mode');
			$('#marquee-zoom-mode-icon').parent().removeClass('selected-mode');
			$('.node-palette img').addClass('inactive-palette-element');
			$('.edge-palette img').removeClass('inactive-palette-element');

			modeHandler.autoEnableMenuItems(false);

			cy.autounselectify(true);

			cy.edgehandles('drawon');
		} else if (!modeProperties.sustainMode && !typeChange) {
			modeHandler.setSelectionMode(cy);
		}

		// Check if there is a needed type change if there is perform it.
		if (typeChange) {
			modeProperties.selectedEdgeType = edgeType;
		}
		if (language) {
			modeProperties.selectedEdgeLanguage = language;
		}

		// reset mode properties of cy
		appUtilities.setScratch(cy, 'modeProperties', modeProperties);
	},
	// Set selection mode, disables sustainable mode.
	setSelectionMode: function (_cy) {
		// if _cy param is not set use the active cy instance
		var cy = _cy || appUtilities.getActiveCy();
		$(cy.container()).find('canvas').removeClass('add-edge-cursor');
		$(cy.container()).find('canvas').removeClass('zoom-cursor');
		$(cy.container()).find('canvas').removeClass('add-node-cursor');
		// access mode properties of the cy
		var modeProperties = appUtilities.getScratch(cy, 'modeProperties');

		if (modeProperties.mode == 'marquee-zoom-mode') {
			var viewUtilities = cy.viewUtilities('get');
			viewUtilities.disableMarqueeZoom();
		}

		if (modeProperties.mode != 'selection-mode') {
			$('#select-mode-icon').parent().addClass('selected-mode');
			$('#add-edge-mode-icon').parent().removeClass('selected-mode');
			$('#add-node-mode-icon').parent().removeClass('selected-mode');
			$('#marquee-zoom-mode-icon').parent().removeClass('selected-mode');
			$('.node-palette img').addClass('inactive-palette-element');
			$('.edge-palette img').addClass('inactive-palette-element');

			modeHandler.autoEnableMenuItems(true);

			modeProperties.mode = 'selection-mode';

			cy.edgehandles('drawoff');

			cy.autoungrabify(false);
			cy.autounselectify(false);
		}
		$('.selected-mode-sustainable').removeClass(
			'selected-mode-sustainable'
		);
		modeProperties.sustainMode = false;

		// reset mode properties of cy
		appUtilities.setScratch(cy, 'modeProperties', modeProperties);
	},
	// Set marquee zoom mode, disables sustainable mode.
	setMarqueeZoomMode: function (_cy) {
		// if _cy param is not set use the active cy instance
		var cy = _cy || appUtilities.getActiveCy();
		$(cy.container()).find('canvas').removeClass('add-edge-cursor');
		$(cy.container()).find('canvas').removeClass('add-node-cursor');
		$(cy.container()).find('canvas').addClass('zoom-cursor');
		// access mode properties of the cy
		var modeProperties = appUtilities.getScratch(cy, 'modeProperties');

		if (modeProperties.mode != 'marquee-zoom-mode') {
			$('#select-mode-icon').parent().removeClass('selected-mode');
			$('#add-edge-mode-icon').parent().removeClass('selected-mode');
			$('#add-node-mode-icon').parent().removeClass('selected-mode');
			$('#marquee-zoom-mode-icon').parent().addClass('selected-mode');
			$('.node-palette img').addClass('inactive-palette-element');
			$('.edge-palette img').addClass('inactive-palette-element');

			modeProperties.mode = 'marquee-zoom-mode';

			var viewUtilities = cy.viewUtilities('get');

			var setSelectionAfterAnimation = function () {
				modeHandler.setSelectionMode(cy);
				viewUtilities.disableMarqueeZoom();
			};

			viewUtilities.enableMarqueeZoom(setSelectionAfterAnimation);

			cy.autoungrabify(false);

			$('.selected-mode-sustainable').removeClass(
				'selected-mode-sustainable'
			);
			modeProperties.sustainMode = false;
		} else {
			modeHandler.setSelectionMode(cy);
		}

		// reset mode properties of cy
		appUtilities.setScratch(cy, 'modeProperties', modeProperties);
	},

	//function to set the mode to the previous mode
	setPreviousMode: function () {
		if (modeHandler.perviousMode == 'selection-mode') {
			modeHandler.setSelectionMode();
		} else if (modeHandler.perviousMode == 'add-node-mode') {
			modeHandler.setAddNodeMode();
		} else if (modeHandler.perviousMode == 'add-edge-mode') {
			modeHandler.setAddEdgeMode();
		} else {
			//marquee zoom mode
			modeHandler.setMarqueeZoomMode();
		}
	},
	//handlers for shortcut zoom mode
	zoomShortcutTabStartHandler: undefined,
	zoomShortcutTabEndHandler: undefined,
	zoomShortcutKeyUpHandler: undefined,
	perviousMode: 'selection-mode',
	setShortcutZoomMode: function (_cy) {
		//shift+control pressed tracking variable
		var ctrlShiftKeyDown = true;

		//reset handlers
		modeHandler.zoomShortcutTabStartHandler = undefined;
		modeHandler.zoomShortcutTabEndHandler = undefined;
		modeHandler.zoomShortcutKeyUpHandler = undefined;

		var rect_start_pos_x, rect_start_pos_y, rect_end_pos_x, rect_end_pos_y;
		var cy = _cy || appUtilities.getActiveCy();

		//store the current mode to return to it after zoom shortcut terminates
		var modeProperties = appUtilities.getScratch(cy, 'modeProperties');
		modeHandler.perviousMode = modeProperties.mode;
		modeHandler.setSelectionMode();
		//disable cytoscape shift+drage selection
		cy.autounselectify(true);
		//change the curser to zoom curser
		$(cy.container()).find('canvas').removeClass('add-edge-cursor');
		$(cy.container()).find('canvas').removeClass('add-node-cursor');
		$(cy.container()).find('canvas').addClass('zoom-cursor');

		//handler to detect start coordinates of mouse drag
		cy.one(
			'tapstart',
			(modeHandler.zoomShortcutTabStartHandler = function (event) {
				if (ctrlShiftKeyDown) {
					rect_start_pos_x = event.position.x;
					rect_start_pos_y = event.position.y;
					rect_end_pos_x = undefined;
				}
			})
		);

		//handler to handle shift+ctrl key up, if shift or ctrl key is up then exit zoom shortcut mode
		document.addEventListener(
			'keyup',
			(modeHandler.zoomShortcutKeyUpHandler = function (event) {
				if (
					event.shiftKey ||
					event.ctrlKey ||
					event.keyCode == '91' ||
					event.keyCode == '93' ||
					event.keyCode == '224'
				) {
					ctrlShiftKeyDown = false;
					var cy = appUtilities.getActiveCy();
					cy.autounselectify(false);
					modeHandler.endShorcutZoomMode();
				}
			})
		);

		////handler to detect end coordinates of mouse drag and apply the zooming action
		cy.one(
			'tapend',
			(modeHandler.zoomShortcutTabEndHandler = function (event) {
				var cy = appUtilities.getActiveCy();
				rect_end_pos_x = event.position.x;
				rect_end_pos_y = event.position.y;
				//check whether corners of rectangle is undefined
				//abort shortcut zoom if one corner is undefined
				if (
					rect_start_pos_x == undefined ||
					rect_end_pos_x == undefined
				) {
					cy.autounselectify(false);
					modeHandler.endShorcutZoomMode();
					return;
				}
				//Reoder rectangle positions
				//Top left of the rectangle (rect_start_pos_x, rect_start_pos_y)
				//right bottom of the rectangle (rect_end_pos_x, rect_end_pos_y)
				if (rect_start_pos_x > rect_end_pos_x) {
					var temp = rect_start_pos_x;
					rect_start_pos_x = rect_end_pos_x;
					rect_end_pos_x = temp;
				}
				if (rect_start_pos_y > rect_end_pos_y) {
					var temp = rect_start_pos_y;
					rect_start_pos_y = rect_end_pos_y;
					rect_end_pos_y = temp;
				}

				//Extend sides of selected rectangle to 200px if less than 100px
				if (rect_end_pos_x - rect_start_pos_x < 200) {
					var extendPx =
						(200 - (rect_end_pos_x - rect_start_pos_x)) / 2;
					rect_start_pos_x -= extendPx;
					rect_end_pos_x += extendPx;
				}
				if (rect_end_pos_y - rect_start_pos_y < 200) {
					var extendPx =
						(200 - (rect_end_pos_y - rect_start_pos_y)) / 2;
					rect_start_pos_y -= extendPx;
					rect_end_pos_y += extendPx;
				}

				//Check whether rectangle intersects with bounding box of the graph
				//if not abort shortcut zoom
				if (
					rect_start_pos_x > cy.elements().boundingBox().x2 ||
					rect_end_pos_x < cy.elements().boundingBox().x1 ||
					rect_start_pos_y > cy.elements().boundingBox().y2 ||
					rect_end_pos_y < cy.elements().boundingBox().y1
				) {
					cy.autounselectify(false);
					modeHandler.endShorcutZoomMode();
					return;
				}

				//Calculate zoom level
				var zoomLevel = Math.min(
					cy.width() / Math.abs(rect_end_pos_x - rect_start_pos_x),
					cy.height() / Math.abs(rect_end_pos_y - rect_start_pos_y)
				);

				var diff_x =
					cy.width() / 2 -
					(cy.pan().x +
						(zoomLevel * (rect_start_pos_x + rect_end_pos_x)) / 2);
				var diff_y =
					cy.height() / 2 -
					(cy.pan().y +
						(zoomLevel * (rect_start_pos_y + rect_end_pos_y)) / 2);

				cy.animate({
					panBy: { x: diff_x, y: diff_y },
					zoom: zoomLevel,
					duration: options.zoomAnimationDuration,
					complete: function () {
						modeHandler.endShorcutZoomMode();
						cy.autounselectify(false);
					},
				});
			})
		);
	},

	//function to enable read mode
	enableReadMode: function () {
		//enable read mode
		$('.read-mode-off')
			.removeClass('read-mode-off')
			.addClass('read-mode-on');
		$('.read-mode-on').prepend('<div class="read-mode-div"></div>');
	},

	//disable read mode
	disableReadMode: function () {
		$('.read-mode-on').find('.read-mode-div').remove();
		$('.read-mode-on')
			.removeClass('read-mode-on')
			.addClass('read-mode-off');
	},
	//function to reset shortcut zoom mode resources and remove handlers
	endShorcutZoomMode: function () {
		var cy = appUtilities.getActiveCy();
		cy.removeListener('tapstart', modeHandler.zoomShortcutTabStartHandler);
		cy.removeListener('tapend', modeHandler.zoomShortcutTabEndHandler);
		document.removeEventListener(
			'keyup',
			modeHandler.zoomShortcutKeyUpHandler
		);
		modeHandler.setPreviousMode();
		appUtilities.zoomShortcut = false;
	},
	autoEnableMenuItems: function (enable) {
		if (enable) {
			$('#expand-selected').parent('li').removeClass('disabled');
			$('#collapse-selected').parent('li').removeClass('disabled');
			$('#expand-all').parent('li').removeClass('disabled');
			$('#collapse-all').parent('li').removeClass('disabled');
			$('#perform-layout').parent('li').removeClass('disabled');
			$('#delete-selected-simple').parent('li').removeClass('disabled');
			$('#delete-selected-smart').parent('li').removeClass('disabled');
			$('#hide-selected').parent('li').removeClass('disabled');
			$('#show-selected').parent('li').removeClass('disabled');
			$('#show-all').parent('li').removeClass('disabled');
			$('#make-compound-complex').parent('li').removeClass('disabled');
			$('#make-compound-compartment')
				.parent('li')
				.removeClass('disabled');
			$('#neighbors-of-selected').parent('li').removeClass('disabled');
			$('#processes-of-selected').parent('li').removeClass('disabled');
			$('#remove-highlights').parent('li').removeClass('disabled');
		} else {
			$('#expand-selected').parent('li').addClass('disabled');
			$('#collapse-selected').parent('li').addClass('disabled');
			$('#expand-all').parent('li').addClass('disabled');
			$('#collapse-all').parent('li').addClass('disabled');
			$('#perform-layout').parent('li').addClass('disabled');
			$('#delete-selected-simple').parent('li').addClass('disabled');
			$('#delete-selected-smart').parent('li').addClass('disabled');
			$('#hide-selected').parent('li').addClass('disabled');
			$('#show-selected').parent('li').addClass('disabled');
			$('#show-all').parent('li').addClass('disabled');
			$('#make-compound-complex').parent('li').addClass('disabled');
			$('#make-compound-compartment').parent('li').addClass('disabled');
			$('#neighbors-of-selected').parent('li').addClass('disabled');
			$('#processes-of-selected').parent('li').addClass('disabled');
			$('#remove-highlights').parent('li').addClass('disabled');
		}
	},
};

module.exports = modeHandler;
