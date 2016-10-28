(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.reportController = function($scope, $rootScope, $location, $timeout, $interval, utilsService, undoServiceFactory, dataService, reportService) {
		$scope.undoService = undoServiceFactory.getService('reportController');
		
		console && console.log('Controller $rootScope.brand/lang/reportId', {
			brand: $rootScope.brand,
			lang: $rootScope.lang,
			reportId: $rootScope.reportId
		});

		$scope.reportTitle = $rootScope.reportId === 'learning-path' 
			? 'Learning Path' 
			: $rootScope.reportId === 'new-and-trending' ? 'New & Trending' : 'Unknown report id';
		
		$scope.title = $scope.reportTitle + ' Report';
		$scope.refreshing = false;

		var _brBrandObj = {
			key: 'br',
			title: 'Baskin-Robbins'
		}, _ddBrandObj = {
			key: 'dd',
			title: 'Dunkin Donuts'
		};

		Object.defineProperty($scope, 'csBaseUrl', {
			get: function() {
				return $rootScope.csBaseUrl;
			}
		});

		Object.defineProperty($scope, 'viewReportFor', {
			get: function() {
				if ($rootScope.brand === 'dd') {
					return _brBrandObj;
				} else {
					return _ddBrandObj;
				}
			}
		});

		$scope.progressBar = {
			type: 'warning',
			value: 0,
			intervalId: undefined
		};

		$scope.increaseProgressBar = function() {
			$scope.progressBar.value += $scope.progressBar.value < 100 ? 10 : 0;
			console.log('increaseProgressBar', $scope.progressBar.value);
		};

		$scope.toggleBrand = function() {
			$rootScope.brand = $rootScope.brand === 'dd' ? 'br' : 'dd';
			$scope.mainCss.setAttribute('href', 'css/main-[brand].css'.replace('[brand]', $rootScope.brand));
			//console.log('toggleBrand ' + $rootScope.brand);
		};

		$scope.undoLastAction = function() {
			var isDetailView = $scope.model.topLevelColumn !== undefined;
			var action = $scope.undoService.undoLastAction(isDetailView);

			if (action) {
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

				$scope.recalculate();
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

			if ($scope.model.isDetailOnly) {
				// if it is a detail-only report, just recalculate
				$scope.recalculate();
			} else {
				// otherwise go bac to the top level (routine backToTopLevel will also invoke recalculate)
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

		$scope.visibleColumns = function(isGroup) {
			return _.filter($scope.model.columns, function(col) {
				return col.isGroup === isGroup && col.show;
			});
		};

		// shortcut to service.recalculate
		$scope.recalculate = function() {
			$scope.refreshing = true;
			$scope.model.topLevelColumn = $scope.topLevelColumn;
			reportService.recalculate($scope.model);
			console.log('recalculate completed');

			$timeout(function() {
				$scope.refreshing = false;
			}, 500);
		};

		// method that handles clicks on the header cell text
		$scope.onHeaderCellClick = function(col) {
			//console.log('onHeaderCellClick');
			console.log('onHeaderCellClick col', col);
			if (col.position > 1) {
				$scope.expandChildColumns(col);
			}
		};

		// method that handles clicks within a row cell (not the headers cells)
		$scope.onRowCellClick = function(col, row) {
			console.log('onRowCellClick');
			//console.log('onRowCellClick col', col);
			//console.log('onRowCellClick row', row);

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
			
			utilsService.safeLog('toggleChildRows', row.children.length);

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

		// /**
		//  * @method showAllColumns
		//  * @description
		//  * Will show all columns, including child columns. Currently used only for debugging.
		//  */
		// $scope.showAllColumns = function() {
		// 	utilsService.safeLog('showAllColumns');
		// 	if ($scope.model) {
		// 		for (var c in $scope.model.columns) {
		// 			var col = $scope.model.columns[c];
		// 			col.show = true;
		// 			if (col.isChild) {
		// 				col.calculate = true;
		// 			}
		// 		}

		// 		// reset undo history
		//		var isDetailView = $scope.model.topLevelColumn !== undefined;
		// 		$scope.undoService.undoAllActions(isDetailView);

		// 		// update values
		// 		//utilsService.safeLog('WARNING: code commented out');
		// 		$scope.recalculate();
		// 	}
		// };

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

			parentRow.refreshing = true;
			row.show = false;

			// update values
			$scope.recalculate();

			$timeout(function() {
				parentRow.refreshing = false;
			}, 125);
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
					$scope.model.totCompletionTitle = $scope._totCompletionTitlePrefix + (groupCol.name || groupCol.title);

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

		$scope.displayHideGroupCol = function() {
			return _.filter($scope.model.columns, function (c) {
				return c.isGroup && c.show;
			}).length > 1;
		};

		$scope.displayHideChildCol = function(col) {
			return !col.locked 
				&& col.isChild 
				&& _.filter($scope.model.columns, function (c) {
					return c.parentId === col.parentId && c.show;
				}).length > 1;
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

		$scope.flashCss = function(css, value, hidden, first) {
			return css + ' ' + value + (hidden? ' hidden' : '') + (first? ' first' : '');
		};

		var onDataError = function(err) {
			utilsService.safeLog('reportController.onDataError', err);
			$scope.error = 'Could not fetch data';
		};

		var onDataComplete  = function(data) {
			if (angular.isDefined($scope.progressBar.intervalId)) {
				$interval.cancel($scope.progressBar.intervalId);
			}
			utilsService.safeLog('reportController.onDataComplete', data);
			$scope.data = data;
			$scope._totCompletionTitlePrefix = 'Tot Completion % for ';
			$scope.model = reportService.getModel(data, $scope._totCompletionTitlePrefix + $scope.reportTitle);

			if ($scope.model.isDetailOnly) {
				// expand first colGroup. "New and Tranding" or some Custom reports will have only one colGroup
				var firstColGroup = _.find($scope.model.columns, function(col) {
					return col.isGroup;
				});
				$scope.expandChildColumns(firstColGroup);
			}

			// then rowGroups after angular bindings
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
					}
				}, 25);
			}, 25);
		};

		// helper to get the data
		var getData = function(w) {
			// show loader
			$scope.loading = true;

			console && console.log('getData: reportId', $rootScope.reportId);

			$scope.progressBar.value = 0;
			$scope.progressBar.intervalId = $interval(function() {
				$scope.increaseProgressBar();
			}, 1000);

			if (w === 'live') {
				var _apiBaseUrl = 'https://dunk-dev.tribridge-amplifyhr.com';
				var _endPoints = [{
					key: 'segments',
					propertyOnData: 'learning_path_items',
					path: _apiBaseUrl + '/curricula_player/api/v1/path/15/?format=json&user=[user]&companyKey=[companyKey]'
						.replace('[user]', $rootScope.token)
						.replace('[companyKey]', $rootScope.compKey)
				}, {
					key: 'stores',
					propertyOnData: 'results',
					//path: 'data/luca-stores.json?' + Math.random()
					path: _apiBaseUrl + '/api/curricula_report/v1/stores/?lpath_id=15&user=[user]&companyKey=[companyKey]'
						.replace('[user]', $rootScope.token)
						.replace('[companyKey]', $rootScope.compKey)
				}];

				console.log('_endPoints', _endPoints);
				
				var _endPointsData = {}, _endPointCount = 0;
				var onEndPointComplete = function(endPoint, data) {
					_endPointsData[endPoint.key] = data[endPoint.propertyOnData];
					if (++_endPointCount === _endPoints.length) {
						console.log('_endPointsData', _endPointsData);
						onDataComplete(_endPointsData);
					}
				};

				utilsService.fastLoop(_endPoints, function(endPoint) {
					dataService.getData(endPoint.path)
						.then(function(data) {
							onEndPointComplete(endPoint, data);
						}, onDataError);
				});
			} else {
				//var fileName = 'report.json?' + Math.random();
				//var fileName = 'report-generated1.json?' + Math.random();
				//var fileName = 'report-generated2.json?' + Math.random();
				//var fileName = 'new-and-trending.json?' + Math.random();
				var fileName = 'data/' + $rootScope.reportId + '.json?' + Math.random();
				console && console.log('fileName', fileName);
				// simulate delay
				setTimeout(function() {
					dataService.getData(fileName)
						.then(onDataComplete, onDataError);
				}, 500);
			}
		};

		// invoke getData
		getData('test'); // or 'live'
	};

}());
