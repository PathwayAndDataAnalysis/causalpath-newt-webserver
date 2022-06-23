console.log('this is js of graph');

$(function () {
	$('#folder-tree-container').jstree({
		core: {
			data: [
				{
					text: 'Root node',
					children: [
						{ text: 'Child node 1' },
						{ text: 'Child node 2' },
						{
							text: 'Child node 2',
							children: [{ text: 'Child node 1' }, { text: 'Child node 2' }],
						},
						{ text: 'Child node 2' },
						{ text: 'Child node 2' },
					],
				},
			],
		},
	});

	// jstree node click event
	$('#folder-tree-container').on('changed.jstree', function (e, data) {
		console.log('The selected nodes are:');
		console.log(data.selected);
	});
});
