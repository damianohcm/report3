(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.reportController = function($scope, $location, $timeout, $interval, $document, 
		utilsService, configService, undoServiceFactory, dataService, reportService) {
		
		var commonConfig = configService.getCommonConfig(),
		 sessionParams = commonConfig.sessionParams,
		 params = commonConfig.params,
		 brandConfig = configService.getBrandConfig(params.brand),
		 reportStrategies = brandConfig.reportStrategies,
		 reportConfigStrategy = reportStrategies && reportStrategies[params.reportId] || {
				pathId: -1,
				title: 'Unknown report id'
			};

		utilsService.safeLog('reportController params', params);
		utilsService.safeLog('reportController reportConfigStrategy', reportConfigStrategy);
		
		// get undo service instance
		$scope.undoService = undoServiceFactory.getService('reportController');
		
		// switch css
		var elMainCss = document.getElementById('mainCss');
		elMainCss.setAttribute('href', 'css/main-[brand].css'.replace('[brand]', params.brand));
		
		utilsService.safeLog('reportController: token/lang/brand/reportId', {
			token: sessionParams.token,
			lang: sessionParams.lang,
			csBaseUrl: sessionParams.csBaseUrl,
			organization: sessionParams.organization,
			brand: params.brand,
			reportId: params.reportId
		}, true);

		$scope.reportTitle = reportConfigStrategy.title;
		
		$scope.title = $scope.reportTitle + ' Report';
		$scope.refreshing = false;


		$scope.dom = {
			tableFixed: angular.element(document.getElementById('table-fixed')),
			tableScroll: angular.element(document.getElementById('table-scroll')),
			tableHorizScrollContainer: angular.element(document.getElementById('table-horiz-scroll')),
			tableVertScrollContainer: angular.element(document.getElementById('table-vert-scroll')),
			tableVertScrollContainer: angular.element(document.getElementById('table-vert-scroll'))
		};

		$scope.dom.tableHorizScrollContainer.on('scroll', function() {
			$timeout(function() {
				var width = 'width: ' + ($scope.dom.tableScroll[0].offsetWidth + 'px');
				$scope.dom.tableVertScrollContainer.attr('style', width);
				$scope.dom.tableFixed.attr('style', width); /* causes flashing: need to do more testing to see if this line can be removed */

				// var thFixed = angular.element(document.querySelector('.table-fixed > thead .th-category'));
				// var thScroll = angular.element(document.querySelector('.table-scroll > thead .th-category'));
				// var width = 'width: ' + (thScroll[0].offsetWidth + 'px');
				// console.log('category width', width);
				// thFixed.attr('style', width);
				// thScroll.attr('style', width);
$('.table-scroll tr:eq(1) td').each(function (i) {
	var _this = $(this);
	$('.table-fixed tr:eq(1) td:eq(' + i + ')').width(_this.width());
});
			}, 0);
		});

		$scope.syncTableScroll = function() {
			var el = $scope.dom.tableHorizScrollContainer;
			$timeout(function() {
				//el.scrollLeft(left), 
				el.triggerHandler('scroll');

			// 	$timeout(function() {
			// 		el.scrollLeft(0), el.triggerHandler('scroll');
			// 	}, 0);
			}, 0);
		};


		Object.defineProperty($scope, 'tokenError', {
			get: function() {
				return (sessionParams.token || '').length === 0 ? 'Invalid token or missing token' : '';
			}
		});

		Object.defineProperty($scope, 'organization', {
			get: function() {
				return (sessionParams.organization && sessionParams.organization.toLowerCase() || '');
			}
		});

		Object.defineProperty($scope, 'csBaseUrl', {
			get: function() {
				return sessionParams.csBaseUrl;
			}
		});

		$scope.displayViewReportFor = false;

		// set current brand and "other" brand (other will be the one that is not equal to the current params.brand or brandConfig.key)
		$scope.currentBrandObj = brandConfig;
		$scope.otherBrandObj = _.find(configService.getBrands(), function (item) {
			return item.key !== params.brand;
		});

		Object.defineProperty($scope, 'viewReportForHref', {
			get: function() {
				var result = '[csBaseUrl]&organization=[organization]&brand=[brand]&reportId=[reportId]'
					.replace('[csBaseUrl]', sessionParams.csBaseUrl)
					.replace('[organization]', sessionParams.organization)
					.replace('[brand]', $scope.otherBrandObj.key)
					.replace('[reportId]', params.reportId);
				//utilsService.safeLog('viewReportForHref', result, true);
				return result;
			}
		});

		Object.defineProperty($scope, 'backToHref', {
			get: function() {
				var result = '[csBaseUrl]&organization=[organization]&brand=[brand]'
					.replace('[csBaseUrl]', sessionParams.csBaseUrl)
					.replace('[organization]', sessionParams.organization)
					.replace('[brand]', $scope.currentBrandObj.key);
				//utilsService.safeLog('backToHref', result, true);
				return result;
			}
		});


		$scope.progressBar = {
			type: 'warning',
			value: 0,
			intervalId: undefined
		};

		$scope.$on('$routeChangeStart', function () { // (scope, next, current)
			if (angular.isDefined($scope.progressBar.intervalId)) {
				$interval.cancel($scope.progressBar.intervalId);
			}
		});

		$scope.increaseProgressBar = function() {
			var step = 10;
			if ($scope.progressBar.value > 70) {
				step = 1;
			}
			$scope.progressBar.value += $scope.progressBar.value < 100 ? step : 0;
			utilsService.safeLog('increaseProgressBar', $scope.progressBar.value);
		};

		$scope.undoLastAction = function() {
			var isDetailView = $scope.model.topLevelColumn !== undefined;
			var action = $scope.undoService.undoLastAction(isDetailView);

			if (action) {
				// {
				// "type":"column",
				// "properties":[{"name":"show","oldValue":true,"newValue":false},
				// "msg":"Exclude column Guest Service",
				// "item":{"isGroup":true,"id":"guest-services","key":"guest-services","show":true,"position":14,"groupPosition":4,"locked":false,
				// "css":"th-course valign-top","name":"Guest Service","$$hashKey":"object:35"}]
				// }

				// keep row collapsed when undoing rows
				if (action.type === 'row' && !action.item.isChild && !action.item.isCollapsed) {
					action.item.isCollapsed = true;
				}

				// // expand parent row if any and currently collapsed
				// if (action.type === 'row' && action.item.isChild) {
				// 	var parent = _.find($scope.model.result.rows, function(row) {
				// 		return row.id === action.item.parentId;
				// 	});
				// 	if (parent && parent.isCollapsed) {
				// 		parent.isCollapsed = false;
				// 	}
				// }
			
				// when in detail view, if un-hiding a top level column, 
				// we have to also return to top level view or otherwise the un-hidden group column will show next to the current detail columns
				if (isDetailView && action.type === 'column' && action.item.isGroup 
					&& _.some(action.properties, function (p) {
						return p.name === 'show' && p.oldValue;
					})) {
					$scope.backToTopLevel(); // this will also invoke recalculate
				} else {
					$scope.recalculate();
				}
			}
		};

		$scope.undoAllActions = function() {
			var isDetailView = $scope.model.topLevelColumn !== undefined;
			$scope.undoService.undoAllActions(isDetailView);

			// collapse all rows
			utilsService.fastLoop($scope.model.result.rows, function(row) {
				if (row.isGroup) {
					row.isCollapsed = true;
				}
			});

			var rows = $scope.model.result.rows;
				if (rows && rows.length === 1) {
					$scope.toggleChildRows(rows[0]);
				}

			if ($scope.model.isDetailOnly) {
				// if it is a detail-only report, just recalculate
				$scope.recalculate();
			} else {
				// otherwise go back to the top level (routine backToTopLevel will also invoke recalculate)
				$scope.backToTopLevel();
			}
		};

		$scope.modifiedMessage = function() {
			var undoState = $scope.undoService.undoState;

			if (undoState && undoState.length > 0) {
				var msg = '', things = {
					segments: {
						count: 0,
						singular: 'Category',
						plural: 'Categories'
					}
					, los: {
						count: 0,
						singular: 'Course', 
						plural: 'Courses'
					}
					, stores: {
						count: 0,
						singular: 'PC', 
						plural: 'PCs'
					}
					, people: {
						count: 0, 
						singular: 'Learner', 
						plural: 'Learners'
					}
				};

				_.each(undoState, function(o) {
					if (o.type === 'column') {
						if (o.item.isChild) {
							things.los.count++;
						} else {
							things.segments.count++;
						}
					} else if (o.type === 'row') {
						if (o.item.isChild) {
							things.people.count++;
						} else {
							things.stores.count++;
						}
					} else {
						msg = 'Modified';
					}
				});

				for (var p in things) {
					var item = things[p];
					if (item.count > 0) {
						msg += (msg.length > 0 ? ' | ' : '')
							+ item.count
							+ ' ' 
							+ (item.count > 1 ? item.plural : item.singular) 
							+ ' removed';
					}
				}

				return msg;
			} else {
				return 'Report is not modified';
			}
		};

		$scope.exportToCsv = function() {
			utilsService.exportModelToCsv($scope.model, 'Summary.csv');
			return true;
		};

		$scope.colHeaderPopover = {
			templateUrl: 'colHeaderPopoverTemplate.html'
		};

		$scope.rowHeaderPopover = {
			templateUrl: 'rowHeaderPopoverTemplate.html'
		};

		$scope.closePopovers = function() {
			var popups = document.querySelectorAll('.popover');
            if (popups) {
                for (var i = 0; i < popups.length; i++) {
                    var popup = popups[i];
                    var popupElement = angular.element(popup);
                    popupElement.scope().$parent.isOpen = false;
                    //popupElement.scope().$parent.$apply();
                }
            }
		};

		$scope.visibleGroupColumns = function() {
			return _.filter($scope.model.columns, function(c) {
				return c.show && c.isGroup;
			});
		};

		$scope.visibleColumns = function(col) {
			if (col.parentId) {
				var parent = _.find($scope.model.columns, function(c) {
					return c.id === col.parentId;
				});
				return _.filter($scope.model.columns, function(c) {
					return c.show && c.isChild && c.parentId === parent.id;
				});
			} else if (col.isGroup) {
				return $scope.visibleGroupColumns();
			} else {
				return [];
			}
		};

		$scope.columnVisiblePosition = function(col) {
			var result = 0, cols;

			if (col.parentId) {
				var parent = _.find($scope.model.columns, function(c) {
					return c.id === col.parentId;
				});
				cols = _.filter($scope.model.columns, function(c) {
					return c.show && c.isChild && c.parentId === parent.id;
				});
			} else if (col.isGroup) {
				cols = _.filter($scope.model.columns, function(c) {
					return c.show && c.isGroup;
				});
			}

			utilsService.fastLoop(cols, function(c, i) {
				if (c.id === col.id) {
					result = i;
				}
			});

			return result;
		};

		$scope.popoverPlacement = function(col) {
			var visibilePos = $scope.columnVisiblePosition(col);
			return visibilePos < $scope.visibleColumns(col).length ? 'right' : 'left';
		};

		// shortcut to service.recalculate
		$scope.recalculate = function() {
			$scope.refreshing = true;
			$scope.model.topLevelColumn = $scope.topLevelColumn;
			reportService.recalculate($scope.model);
			utilsService.safeLog('recalculate completed');
			
			$scope.syncTableScroll();

			$timeout(function() {
				$scope.refreshing = false;
			}, 125);
		};

		// method that handles clicks on the header cell text
		$scope.onHeaderCellClick = function(col) {
			//utilsService.safeLog('onHeaderCellClick col', col);
			if (col.position > 1) {
				$scope.expandChildColumns(col);
			}
		};

		// method that handles clicks within a row cell (not the headers cells)
		$scope.onRowCellClick = function(col, row) {
			utilsService.safeLog('onRowCellClick');
			//utilsService.safeLog('onRowCellClick col', col);
			//utilsService.safeLog('onRowCellClick row', row);

			var rowGroupStrategies  = {
				category: function(c, r) {
					$scope.toggleChildRows(r);
				}, 
				summary: function(c, r) {
					$scope.toggleChildRows(r);
				}
			};

			if (row.isGroup) {
				var strategy = rowGroupStrategies[col.key];
				if (strategy) {
					strategy(col, row);
				} else {
					$scope.expandChildColumns(col);
					$scope.toggleChildRows(row, true);
				}
			}
		};
		
		$scope.toggleChildRows = function(row, forceExpand) {
			$scope.closePopovers();
			
			utilsService.safeLog('toggleChildRows', row.children.length, true);

			// // // add state item to undo history
			// // var msgPrefix = row.isCollapsed ? 'Expand store ' : 'Collapse store ';
			// // $scope.undoService.addState({
			// // 	type: 'row',
			// // 	item: row,
			// // 	properties: [{
			// // 		name: 'isCollapsed',
			// // 		oldValue: row.isCollapsed,
			// // 		newValue: !row.isCollapsed
			// // 	}],
			// // 	msg: msgPrefix + row.category.value
			// // });

			if ($scope.model && row.isGroup) {
				var newState = !row.isCollapsed;
				if (forceExpand) {
					newState = false;
				}
				row.refreshing = true;
				row.isCollapsed = newState;

				$timeout(function() {
					row.refreshing = false;
				}, 125);
			}
		};

		/**
		 * @method hideCol
		 * @description 
		 * Mark a col.show false.
		 */
		$scope.hideCol = function(col) {
			$scope.closePopovers();
			
			// properties changed on this column for undo history
			var undoProperties = [{
				name: 'show',
				oldValue: true, //col.show,
				newValue: false
			}], 
			//undoMsg = 'Hide'
			undoMsg = 'Exclude';

			// set col.show to false
			col.show = false;

			// if col is a child
			if (col.isChild) {
				// add undo state for column being excluded from calculation
				undoProperties.push({
					name: 'calculate',
					oldValue: true, //col.calculate,
					newValue: false
				});

				//undoMsg += ' and exclude';

				// set col.calculate false to exclude from calculation
				col.calculate = false;
				
				utilsService.safeLog('hideCol child column. Calculate is', col.calculate);
			} else if (col.isGroup) {
				// if col.isGroup, we have to make sure we purge any pending changes to its child columns from the undo history
				var children = _.filter($scope.model.columns, function(item) {
					return item.isChild && item.parentId === col.id;
				});

				_.each(children, function(childCol) {
					$scope.undoService.undoActionForItem(childCol, false);
				});
			}

			// add state item to undo history
			$scope.undoService.addState({
				type: 'column',
				item: col,
				properties: undoProperties,
				msg: undoMsg + ' column ' + col.name
			});
			
			// update values
			$scope.recalculate();
			$scope.syncTableScroll();
		};

		/**
		 * @method hideRow
		 * @description 
		 * Mark a row.show false. This will hide the row but also causes its property "calculate" to return false
		 * so that it will be excluded from the calculations.
		 */
		$scope.hideRow = function(row, parentRow) {
			$scope.closePopovers();
			
			// add state item to undo history
			$scope.undoService.addState({
				type: 'row',
				item: row,
				properties: [{
					name: 'show',
					oldValue: true,
					newValue: false
				}],
				msg: 'Hide row ' + row.category.value
			});

			row.show = false;

			// only if we are hiding a childRow we'll refresh the calculations
			// (no need to recalculate when hiding a group row)
			if (parentRow) {
				parentRow.refreshing = true;

				// update values
				$scope.recalculate();

				$timeout(function() {
					parentRow.refreshing = false;
				}, 0);
			} else {
				$scope.syncTableScroll();
			}
		};

		/**
		 * @method expandChildColumns
		 * @description Hides group columns and shows children columns for a specific group.
		 */
		$scope.expandChildColumns = function(groupCol) {
			$scope.closePopovers();

			if ($scope.model && $scope.topLevelColumn === undefined) {
				groupCol.refreshing = true;

				$timeout(function() {
					var itemCol;
					for (var c in $scope.model.columns) {
						itemCol = $scope.model.columns[c];
						if (itemCol.isGroup) {
							itemCol.show = false;
							//$scope.undoService.purgeActionProperty(itemCol, 'show');
						} else if (itemCol.isChild) {
							itemCol.show = itemCol.parentId === groupCol.id;
							if (itemCol.show) {
								//$scope.undoService.purgeActionProperty(itemCol, 'show');
							}
						} else if (itemCol.locked) {
							// probably no need to do anything.. might remove this code
						}
					}

					$scope.topLevelColumn = groupCol;

					// save current summary colunn title 
					$scope.model._prevTotCompletionTitle = $scope.model.totCompletionTitle;
					$scope.model.totCompletionTitle = commonConfig.totCompletionTitlePrefix + (groupCol.name || groupCol.title);

					groupCol.refreshing = false;

					// update values
					$scope.recalculate();
				}, 10);
			}
		};

		/**
		 * @method backToTopLevel
		 * @description
		 * This will revert the expandChildColumns operation
		 */
		$scope.backToTopLevel = function() {
			$scope.closePopovers();
			
			if ($scope.model) {

				$scope.topLevelColumn = undefined;
				// restore previous summary column title
				$scope.model.totCompletionTitle = $scope.model._prevTotCompletionTitle;

				for (var c in $scope.model.columns) {
					var itemCol = $scope.model.columns[c];
					// show groups:
					if (itemCol.isGroup) {
						// make sure to show only the columns that were not hidden by the user by looking at undo history
						if (!$scope.undoService.stateExists(itemCol, 'show')) {
							itemCol.show = true;
						}
					} else if (itemCol.isChild) {
					 	// if child, hide only (don't change its calculate property)
						itemCol.show = false;
					 	//itemCol.calculate = true;
					}
				}

				// update values
				$scope.recalculate();
			}
		};

		$scope.displayRemoveCol = function(col) {
			if (col.isChild) {
				return !col.locked 
				&& _.filter($scope.model.columns, function (c) {
					return c.parentId === col.parentId && c.show;
				}).length > 1;
			} else {
				return _.filter($scope.model.columns, function (c) {
					return c.isGroup && c.show;
				}).length > 1;
			}
		};

		$scope.displayHideRow = function(parentRow) {
			if (parentRow) {
				// if it's a child row and at least one of its sibilings is still visibile
				return _.filter(parentRow.children, function (r) {
					return r.show;
				}).length > 1;
			} else { 
				// or is a top level row and at least 2 top level rows are visible
				return _.filter($scope.model.result.rows, function (r) {
					return r.isGroup && r.show;
				}).length > 1;
			}
		};

		$scope.flashCss = function(css, value, hidden, pos) {
			return css + ' ' + value + (hidden? ' hidden' : '') + (pos === 0 ? ' first' : '');
		};

		$scope.colHeaderStyle = function(col) {
			// get total visible columns
			var totColumns;
			if ($scope.topLevelColumn && ['category', 'summary'].indexOf(col.key) === -1) {
				totColumns = $scope.visibleColumns(col).length;
			} else {
				totColumns = $scope.visibleGroupColumns().length;
			}

			totColumns += 1;
			totColumns = totColumns < 3 ? 3 : totColumns;

			var storeWidthPercent = 10, summaryWidthPercent = 5;
			var useFixedWidth = true; //totColumns > 10;

			var styleObj = {
			};

			if (col.key === 'category') {
				styleObj.width = '280px'; //useFixedWidth ? '200px' : storeWidthPercent + '%';
				styleObj['min-width'] = styleObj.width;
				styleObj['max-width'] = styleObj.width;
			} else if (col.key === 'summary') {
			 	styleObj.width = '130px'; //useFixedWidth ? '130px' : summaryWidthPercent + '%';
				styleObj['min-width'] = styleObj.width;
				styleObj['max-width'] = styleObj.width;
			} else {
				if (useFixedWidth) {
					styleObj.width = '130px';
				} else {
					var availableWidthInPercent = 100 - storeWidthPercent - summaryWidthPercent; // this is 100 minus PC and Summary widths
					styleObj.width = Math.round(availableWidthInPercent / totColumns) + '%';
				}

				if (useFixedWidth) {
					styleObj['min-width'] = styleObj.width;
					styleObj['max-width'] = styleObj.width;
				}
			}
			
			return styleObj;
		};

		$scope.thTextCss = function(c) {
			if ((c.isGroup || c.isChild || c.key === 'summary') && (c.name || '').length > 39) {
				return 'th-text smaller-text';
			} else {
				return 'th-text';
			}
		};
		

		var onDataError = function(err) {
			utilsService.safeLog('reportController.onDataError', err);
			$scope.error = 'Could not fetch data';
		};
	

		var onDataComplete  = function(data) {
			if (angular.isDefined($scope.progressBar.intervalId)) {
				$interval.cancel($scope.progressBar.intervalId);
			}
			utilsService.safeLog('reportController.onDataComplete', JSON.stringify(data), true);
			// fix data as the backend endpoint return inconsistent data and also not mapped properties
			$scope.data = dataService.fixReportAPIData(data, reportConfigStrategy);
			// get the report model from reportService
			$scope.model = reportService.getModel(data, commonConfig.totCompletionTitlePrefix + $scope.reportTitle);
		
			// distinct peopleOrgs
			$scope.peopleOrgs = data.peopleOrgs;
			$scope.displayViewReportFor = sessionParams.organization === 'ddbr' || data.peopleOrgs.length > 1;

			// helper that will be called after all rows have been added
			var onRowsCompleted = function() {
				var rows = $scope.model.result.rows;
				if (rows && rows.length === 1) {
					$scope.toggleChildRows(rows[0]);
				}

				if ($scope.model.isDetailOnly) {
					// expand first colGroup. "New and Tranding" or some Custom reports will have only one colGroup
					var firstColGroup = _.find($scope.model.columns, function(col) {
						return col.isGroup;
					});
					$scope.expandChildColumns(firstColGroup);
				} else {
					$scope.syncTableScroll();
				}
			};

			// add rows one at the time with an interval for better UX and avoid angular binding performance issues
			$timeout(function(){

				// hide loader
				$scope.loading = false;
				
				utilsService.safeLog('add');
				var rowGroups = $scope.model.result._rowGroups;
				var intervalId = $interval(function() {
					if (rowGroups.length > 0) {
						utilsService.safeLog('add row');
						$scope.model.result.rows.push(rowGroups.pop());
					} else {
						utilsService.safeLog('clearInterval');
						$interval.cancel(intervalId);
						onRowsCompleted();
					}
				}, 25);
			}, 25);
		};

		// helper to get the data
		var getData = function(w) {

			// show loader
			$scope.loading = true;

			utilsService.safeLog('getData: reportId', params.reportId);

			$scope.progressBar.value = 0;
			$scope.progressBar.intervalId = $interval(function() {
				$scope.increaseProgressBar();
			}, 2000);

			if (w === 'live') {
				if (reportConfigStrategy.pathId < 1) {
					debugger;
					alert('Invalid pathId from reportConfigStrategy', reportConfigStrategy.pathId);
				} else {
					var _endPoints = [{
						key: 'segments',
						propertyOnData: 'learning_path_items',
						path: commonConfig.apiBaseUrl 
							+ '/api/curricula_report/v1/segments-list/[path_id]/?format=json&user=[user]&companyKey=[companyKey]'
								.replace('[path_id]', reportConfigStrategy.pathId)
								.replace('[user]', sessionParams.token)
								.replace('[companyKey]', sessionParams.compKey)
					}, {
						key: 'stores',
						propertyOnData: 'results',
						//path: 'data/luca-stores.json?' + Math.random()
						path: commonConfig.apiBaseUrl 
							+ '/api/curricula_report/v1/stores/?format=json&lpath_id=[path_id]&user=[user]&companyKey=[companyKey]'
								.replace('[path_id]', reportConfigStrategy.pathId)
								.replace('[user]', sessionParams.token)
								.replace('[companyKey]', sessionParams.compKey)
					}];

					utilsService.safeLog('_endPoints', _endPoints, true);// force loggin all the time by passing true as 3rd param
					
					var _endPointsData = {}, _endPointCount = 0;
					var onEndPointComplete = function(endPoint, data) {
						_endPointsData[endPoint.key] = data[endPoint.propertyOnData];

						utilsService.safeLog(endPoint.key + ' data return by API', data[endPoint.propertyOnData], true);

						if (++_endPointCount === _endPoints.length) {
							utilsService.safeLog('_endPointsData', _endPointsData);

							onDataComplete(_endPointsData);
						}
					};

					utilsService.fastLoop(_endPoints, function(endPoint) {
						dataService.getData(endPoint.path)
							.then(function(data) {
								onEndPointComplete(endPoint, data);
							}, onDataError);
					});
				}
			} else {
				//var fileName = 'data/report.json?' + Math.random();
				//var fileName = 'data/report-generated1.json?' + Math.random();
				// //var fileName = 'data/report-generated2.json?' + Math.random();
				// //var fileName = 'data/single-pc.json?' + Math.random();
				// //var fileName = 'data/single-pc-single-segment.json?' + Math.random();

				//var fileName = 'data/janic-' + params.reportId + '.json?' + Math.random();

				var fileName = 'data/' + params.reportId + '.json?' + Math.random();
				utilsService.safeLog('fileName', fileName);
				// simulate delay
				$timeout(function() {
					dataService.getData(fileName)
						.then(onDataComplete, onDataError);
				}, 500);
			}
		};

		// invoke getData
		if ($scope.tokenError.length > 0) {
			alert($scope.tokenError);
		} else {
			var what = reportService.reportConfig.useTestData ? 'test' : 'live';
			getData(what);
		}
	};

}());
