(function() {
  
    window.services = window.services || {};
  
    window.services.utilsService = function() {

		var obj = {
		};

		 /**
		 * @method safeLog
		 * @description
		 * 
		 */
		// eslint-disable-next-line no-unused-vars
        obj.safeLog = function(msg, data) {
            // if (arguments.length > 1) {
            //     console.log(msg, data);
            // } else {
            //     console.log(msg);
            // }
        };

        /**
		 * @method fastLoop
		 * @description
		 * 
		 */
		obj.fastLoop = function fastLoop(items, cb) {
			for (var i = items.length; --i >= 0;) {
				cb(items[items.length - i - 1], items.length - i);
			}
		};

		/**
		 * @method getCsv
		 * @description
		 * 
		 */
		obj.getCsv = function getCsv(model) {
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
		}.bind(obj);

		/**
		 * @method csvHtml5Download
		 * @description
		 * 
		 */
		obj.csvHtml5Download = function(csv, fileName) {
			this.safeLog('utilsService.csvHtml5Download');
			var mimeType = 'attachment/csv';

			var a = document.createElement('a');
			a.href = 'data:' + mimeType + ',' + encodeURIComponent(csv);
			
			if ('download' in a) { //html5 A[download]
				a.setAttribute('download', fileName);
			} else {
				a.setAttribute('target', '_blank');
			}

			//Dispatching click event.
			if (document.createEvent) {
				var e = document.createEvent('MouseEvents');
				e.initEvent('click', true, true);
				a.dispatchEvent(e);
				return true;
			} else {
				a.click();
			}
		}.bind(obj);

		/**
		 * @method getCsv
		 * @description
		 * 
		 */
		obj.exportModelToCsv = function(model, fileName) {
			var mimeType = '',
				csv = this.getCsv(model),
				lowerUserAgent = navigator.userAgent.toLowerCase(),
				browser = {
					isSafari: lowerUserAgent.indexOf('chrome') === -1 && lowerUserAgent.indexOf('safari') > 0,
					isChrome: lowerUserAgent.indexOf('chrome') > 0
				};
			this.safeLog('utilsServices.exportToCsv csv', csv);
			this.safeLog('utilsServices.exportToCsv browser', browser);
			
			if (browser.isSafari) {
				// if safari, open new window/tab with plain text CSV content
				// this way the user will be able to save it as she wishes and also able to give it a name
				var data = 'data:text/plain,' + encodeURIComponent(csv);
				var win = window.open(data);
				win.document.write(csv);
				win.location = data + '?download';
			} else if (browser.isChrome) {
				// use html5 download technique (which allows to also name the file programmatically)
				this.csvHtml5Download(csv, fileName);
			} else if (navigator.msSaveBlob) { // IE10
				// use msSaveBlob
				this.safeLog('utilsServices.exportToCsv INTERNET EXPLORER');
				mimeType = 'application/octet-stream';
				return navigator.msSaveBlob(new Blob([csv], {
					type: mimeType
				}),
				fileName);
			} else {
				// use html5 download technique (which allows to also name the file programmatically)
				this.csvHtml5Download(csv, fileName);
			}

			return true;
		}.bind(obj);

		

        return obj;
    };

}());
