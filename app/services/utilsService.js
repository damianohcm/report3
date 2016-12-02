(function() {
  
    var utilsService = function(configService) {

		var commonConfig = configService.getCommonConfig();

		var sortCompareById = function(a, b) {
			if (a.id < b.id) {
				return -1;
			}
			if (a.id > b.id) {
				return 1;
			}
			// a must be equal to b
			return 0;
		};

		var instance = {
		};

		 /**
		 * @method safeLog
		 * @description
		 * Wrap console.log and makes sure it will log only if browser supports console and commonConfig.logEnabled is true.
		 * When passing force as true, it will always log, no matter what commonConfig.logEnable value is.
		 */
		// eslint-disable-next-line no-unused-vars
        instance.safeLog = function(msg, data, force) {
			if (commonConfig.logEnabled && (window && window.logEnabled || force)) {
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
		instance.fastLoop = function fastLoop(items, cb) {
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
		instance.unescapeSpecialChars = function(text) {
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
		instance.getCsv = function getCsv(model) {
			var cols = model.columns, rows = model.result.rows, 
				visibleRows = _.filter(rows, function(row) {
					return row.show;
				});

			var ret = [];
			// ret.push('"' + instanceect.keys(arr[0]).join('","') + '"');
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
					return instance.unescapeSpecialChars(col.name);
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

						text = instance.unescapeSpecialChars(text);
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
		}.bind(instance);

		/**
		 * @method csvHtml5Download
		 * @description
		 * 
		 */
		instance.csvHtml5Download = function(csv, fileName) {
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
		}.bind(instance);

		/**
		 * @method getCsv
		 * @description
		 * 
		 */
		instance.exportModelToCsv = function(model, fileName) {
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
				var win = (window && window.open(data));
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
		}.bind(instance);

		instance.sortObject = function(obj) {
			if (Array.isArray(obj)) {
				return obj.sort(sortCompareById);
			} else {
				var result = {};
				var sortedKeys = Object.keys(obj).sort();
				for (var i = sortedKeys.length; --i > -1;) {
					var key = sortedKeys[i], propVal = obj[key];
					if (typeof propVal === 'object' || Array.isArray(propVal)) {
						//console.log(key + ': is object or array');
						result[key] = instance.sortObject(propVal);
					} else {
						result[key] = obj[key];
					}
				}

				return result;
			}
		}.bind(instance);

		instance.areEqual = function(origObj, otherObj) {
			var result = true;

			var origKeys = Object.keys(origObj);
			var otherKeys = Object.keys(otherObj);

			if (origKeys.length !== otherKeys.length) {
				console.log('keys length do not match');
				result = false;
			} else {
				// sort properties and create two object that can be hashed for quicker comparison
				origObj = instance.sortObject(origObj);
				otherObj = instance.sortObject(otherObj);
				
				//console.log('json1', JSON.stringify(origObj).toLowerCase());
				//console.log('json2', JSON.stringify(otherObj).toLowerCase());
				
				if (JSON.stringify(origObj).toLowerCase() !== JSON.stringify(otherObj).toLowerCase()) {
					//console.log('hashed objects do not match');
					result = false;
				}
			}
			
			return result;
		}.bind(instance);

        return instance;
    };

	if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = utilsService;
        }
        exports = utilsService;
    } else {
        window.services = window.services || {};
        window.services.utilsService = utilsService;
    }

}());
