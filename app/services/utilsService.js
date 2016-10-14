(function() {
  
    window.services = window.services || {};
  
    window.services.utilsService = function() {

		// eslint-disable-next-line no-unused-vars
        var safeLog = function(msg, data) {
            // if (arguments.length > 1) {
            //     console.log(msg, data);
            // } else {
            //     console.log(msg);
            // }
        };

        var fastLoop = function fastLoop(items, cb) {
			for (var i = items.length; --i >= 0;) {
				cb(items[items.length - i - 1], items.length - i);
			}
		};

		var getCsv = function getCsv(model) {
			var cols = model.columns, rows = model.result.rows, 
				visibleRows = _.filter(rows, function(row) {
					return row.show;
				});

			var ret = [];
			// ret.push('"' + Object.keys(arr[0]).join('","') + '"');
			// for (var i = 0, len = arr.length; i < len; i++) {
			// 	var line = [];
			// 	for (var key in arr[i]) {
			// 		if (arr[i].hasOwnProperty(key)) {
			// 			line.push('"' + arr[i][key] + '"');
			// 		}
			// 	}
			// 	ret.push(line.join(','));
			// }

			// if not detail view, export only column groups
			// if (!model.topLevelColumn) {

			// } else {
				var visibleCols = _.filter(cols, function (col) {
					return col.show;
				});
				var colNames = _.map(visibleCols, function(col) {
					return col.name;
				});

				ret.push('"' + colNames.join('","') + '"');

				_.each(visibleRows, function(row) {
					var csvLine = [];
					_.each(visibleCols, function(col) {
						var cell = row[col.key],
							text = cell.value;
							if (cell.value2) {
								text += ' (' + cell.value2 + ')';
							} else if (cell.suffix && cell.suffix.length > 0) {
								text += ' ' + cell.suffix;
							}
						csvLine.push('"' + text + '"');
					});
					ret.push(csvLine.join(','));

					if (!row.isCollapsed) {
						var visibleChildRows = _.filter(row.children, function(cr) {
							return cr.show;
						});

						if (visibleChildRows.length > 0) {
							_.each(visibleChildRows, function(childRow) {
								var csvChildLine = [];
								_.each(visibleCols, function(col) {
									var cell = childRow[col.key],
										text = cell.value;
										if (cell.value2) {
											text += ' (' + cell.value2 + ')';
										} else if (cell.suffix && cell.suffix.length > 0) {
											text += ' ' + cell.suffix;
										}
									csvChildLine.push('"' + text + '"');
								});
								ret.push(csvChildLine.join(','));
							});
						}
					}

				});

			//}

			return ret.join('\n');
		};

        return {
            safeLog: safeLog,
            fastLoop: fastLoop,
            getCsv: getCsv
        };
    };

}());
