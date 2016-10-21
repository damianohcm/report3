(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.reportController = function($scope, $rootScope, utilsService, undoServiceFactory, dataService, reportService, $timeout, $interval) {
		$scope.undoService = undoServiceFactory.getService('reportController');
		
		console && console.log('Controller $rootScope.brand/lang/reportId', {
			brand: $rootScope.brand,
			lang: $rootScope.lang,
			reportId: $rootScope.reportId
		});

		$scope.reportTitle = $rootScope.reportId === 'learning-path' ? 'Learning Path' : $rootScope.reportId === 'new-and-trending' ? 'New & Trending' : 'Unknown report id';
		$scope.title = $scope.reportTitle + ' Report';

		Object.defineProperty($scope, 'csBaseUrl', {
			get: function() {
				return $rootScope.csBaseUrl;
			}
		});

		Object.defineProperty($scope, 'viewReportFor', {
			get: function() {
				return $rootScope.brand === 'dd' ? 'Baskin-Robbins' : 'Dunkin Donuts';
			}
		});

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
						singular: 'Learning Path',
						plural: 'Learning Paths'
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
						singular: 'User', 
						plural: 'Users'
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

		$scope.visibleColumns = function(isGroup) {
			return _.filter($scope.model.columns, function(col) {
				return col.isGroup === isGroup && col.show;
			});
		};

		// shortcut to service.recalculate
		$scope.recalculate = function() {
			$scope.model.topLevelColumn = $scope.topLevelColumn;
			reportService.recalculate($scope.model);
		};

		var onDataError = function(err) {
			utilsService.safeLog('reportController.onDataError', err);
			$scope.error = 'Could not fetch data';
		};

		var onDataComplete  = function(data) {
			utilsService.safeLog('reportController.onDataComplete', data);
			$scope.data = data;
			$scope.model = reportService.getModel(data, $scope.reportTitle);

			if ($scope.model.isDetailOnly) {
				// expand first colGroup. "New and Tranding" or some Custom reports will have only one colGroup
				var firstColGroup = _.find($scope.model.columns, function(col) {
					return col.isGroup;
				});
				$scope.expandChildColumns(firstColGroup);
			}

			// then rowGroups after angular bindings
			$timeout(function(){
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
				}, 20);
			}, 0);
		};

// //var fileName = 'report.json?' + Math.random();
// //var fileName = 'report-generated1.json?' + Math.random();
// //var fileName = 'report-generated2.json?' + Math.random();
// //var fileName = 'new-and-trending.json?' + Math.random();
// var fileName = $rootScope.reportId + '.json?' + Math.random();
// console && console.log('fileName', fileName);
// dataService.getData(fileName)
// 	.then(onDataComplete, onDataError);

		var endPoints = [{
			key: 'segments',
			path: 'luca-segments.json?' + Math.random()
		}, {
			key: 'stores',
			path: 'luca-stores.json?' + Math.random()
		}];
		
		var endPointsData = {}, endPointCount = 0;
		var onEndPointComplete = function(key, data) {
			endPointsData[key] = data.results;
			if (++endPointCount === endPoints.length) {
				onDataComplete(endPointsData);
			}
		};

		utilsService.fastLoop(endPoints, function(endPoint) {
			dataService.getData(endPoint.path)
				.then(function(data) {
					onEndPointComplete(endPoint.key, data);
				}, onDataError);
		});
		
		$scope.toggleChildRows = function(model, row) {
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

			row.isCollapsed = !row.isCollapsed;
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
		$scope.hideRow = function(row) {

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

			// update values
			$scope.recalculate();
		};

		/**
		 * @method expandChildColumns
		 * @description Hides group columns and shows children columns for a specific group.
		 */
		$scope.expandChildColumns = function(groupCol) {
			if ($scope.model) {

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

				// update values
				$scope.recalculate();
			}
		};

		/**
		 * @method backToTopLevel
		 * @description
		 * This will revert the expandChildColumns operation
		 */
		$scope.backToTopLevel = function() {
			if ($scope.model) {

				$scope.topLevelColumn = undefined;

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
			return _.filter($scope.model.columns, function (c) {
				return c.parentId === col.parentId && c.show;
			}).length > 1;
		};

		$scope.displayHideRow = function(parentRow) {
			// if it's a child row and at least two of its sibilings are still visibile
			if (parentRow) {
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
	};

}());
