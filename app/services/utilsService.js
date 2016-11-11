(function() {
  
    window.services = window.services || {};

	// set to false for production
	window.logEnabled = false;
  
    window.services.utilsService = function(configService) {

		var commonConfig = configService.getCommonConfig();

		var obj = {
		};

		 /**
		 * @method safeLog
		 * @description
		 * Wrap console.log and makes sure it will log only if browser supports console and commonConfig.logEnabled is true.
		 * When passing force as true, it will always log, no matter what commonConfig.logEnable value is.
		 */
		// eslint-disable-next-line no-unused-vars
        obj.safeLog = function(msg, data, force) {
			if (commonConfig.logEnabled && (window.logEnabled || force)) {
				if (console && console.log) {
					if (arguments.length > 1) {
						console.log(msg, data);
					} else {
						console.log(msg);
					}
				}
			}
        };

        /**
		 * @method fastLoop
		 * @description
		 * 
		 */
		obj.fastLoop = function fastLoop(items, cb) {
			if (items) {
				for (var i = items.length; --i >= 0;) {
					cb(items[items.length - i - 1], items.length - i);
				}
			}
		};

		/**
		 * @method unescapeSpecialChars
		 * @description
		 * Helper to unescape spcial chars that were previousley html escaped in reportservice.hs 
		 * before exporting to csv/excel
		 */
		obj.unescapeSpecialChars = function(text) {
			// whatever we escape here, we'll have to unescape in the csv export in utilsService.js
			return (text || '')
				.replace('&rsquo;', '\'')
				.replace('&copy;', '©')
				.replace('&reg;', '®')
				.replace('&trade;', '™')
				.replace('&nbsp;', ' ')
				.replace('&amp;', '&')
				.replace(/[\,\"]+/gi, ''); /* strip comma a double quotes */
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
					// strip out commas from column headers or they will break the csv format
					return obj.unescapeSpecialChars(col.name);
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

						text = obj.unescapeSpecialChars(text);
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
			var mimeType = 'attachment/csv',
				charset = 'charset=utf-8';

			var a = document.createElement('a');
			a.href = 'data:' + mimeType + ';' + charset + ',' + encodeURIComponent(csv);
			
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
