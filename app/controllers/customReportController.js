(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.customReportController = function($scope, $location, $timeout, $interval, $document, $uibModal, 
		utilsService, configService, undoServiceFactory, dataService, reportService) {
		
		var predicates = utilsService.predicates,
			commonConfig = configService.getCommonConfig(),
			reportConfig = configService.getCustomReportConfig(),
			sessionParams = commonConfig.sessionParams,
			params = commonConfig.params,
			brandConfig = configService.getBrandConfig(params.brand),
			reportStrategies = brandConfig.reportStrategies,
			reportConfigStrategy = reportStrategies && reportStrategies[params.reportType] || {
				pathId: -1,
				title: 'Unknown report id'
			},
			/* get learning-path strategy. We need lpath_id in case user select "Entire Learning Path" in step 3 */
			ddReportConfigStrategy = configService.getBrandConfig('dd').reportStrategies['learning-path'],
			brReportConfigStrategy = configService.getBrandConfig('br').reportStrategies['learning-path'];
		
		// important: set reportConfig to use by reportService
		reportService.setReportConfig(reportConfig);

		// utilsService.safeLog('reportController params', params);
		//utilsService.safeLog('customReportController params.reportModel', params.reportModel, true);


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

		Object.defineProperty($scope, 'reportId', {
			get: function() {
				return params.reportId;
			}
		});
		
		$scope.needsSave = params.reportModel.needsSave;

		var backToReportingHome = function backToReportingHome() {
			var path = '[csBaseUrl]&organization=[organization]&brand=[brand]'
				.replace('[csBaseUrl]', sessionParams.csBaseUrl)
				.replace('[organization]', sessionParams.organization)
				.replace('[brand]', $scope.currentBrandObj.key);
			window.parent.location = path;
		};

		$scope.goHome = function goHome() {
			$scope.currentBackAction = backToReportingHome;
			if ($scope.needsSave) {
				$scope.modalConfirmOpen('closeReport');
			} else {
				backToReportingHome();
			}
		};

		var backToSavedReports = function backToSavedReports() {
			var path = '#/savedReports'
				.replace('[brand]', $scope.currentBrandObj.key);
			window.location = path;
		};

		$scope.goToSavedReports = function goToSavedReports() {
			$scope.currentBackAction = backToSavedReports;
			if ($scope.needsSave) {
				$scope.modalConfirmOpen('closeReport');
			} else {
				backToSavedReports();
			}
		};
		
		// get undo service instance
		$scope.undoService = undoServiceFactory.getService('reportController');
		
		// switch css
		var elMainCss = document.getElementById('mainCss');
		elMainCss.setAttribute('href', 'css/main-[brand].css'.replace('[brand]', params.brand));
		
		utilsService.safeLog('reportController: token/lang/brand/reportType/reportId', {
			token: sessionParams.token,
			lang: sessionParams.lang,
			csBaseUrl: sessionParams.csBaseUrl,
			organization: sessionParams.organization,
			brand: params.brand,
			reportType: params.reportType,
			reportId: params.reportId
		}, true);

		$scope.reportTitle = params.reportModel.reportName || reportConfigStrategy.title;
		
		$scope.title = $scope.reportTitle; //$scope.reportTitle + ' Report';
		$scope.refreshing = false;


		$scope.dom = {
			tableFixed: angular.element(document.getElementById('table-fixed')),
			tableScroll: angular.element(document.getElementById('table-scroll')),
			tableHorizScrollContainer: angular.element(document.getElementById('table-horiz-scroll')),
			tableVertScrollContainer: angular.element(document.getElementById('table-vert-scroll'))
		};

		$scope.dom.tableHorizScrollContainer.on('scroll', function() {
			$timeout(function() {
				var numWidth = Number($scope.dom.tableScroll[0].offsetWidth) + 20;
				var width = 'width: ' + (numWidth + 'px');
				$scope.dom.tableVertScrollContainer.attr('style', width);
				//$scope.dom.tableFixed.attr('style', width); /* causes flashing: need to do more testing to see if this line can be removed */

				// var thFixed = angular.element(document.querySelector('.table-fixed > thead .th-category'));
				// var thScroll = angular.element(document.querySelector('.table-scroll > thead .th-category'));
				// var width = 'width: ' + (thScroll[0].offsetWidth + 'px');
				// utilsService.safeLog('category width', width);
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

		$scope.displayViewReportFor = false;

		// set current brand and "other" brand (other will be the one that is not equal to the current params.brand or brandConfig.key)
		$scope.currentBrandObj = brandConfig;
		$scope.otherBrandObj = _.find(configService.getBrands(), function (item) {
			return item.key !== params.brand;
		});

		Object.defineProperty($scope, 'viewReportForHref', {
			get: function() {
				var result = '[csBaseUrl]&organization=[organization]&brand=[brand]&reportType=[reportType]&reportId=[reportId]'
					.replace('[csBaseUrl]', sessionParams.csBaseUrl)
					.replace('[organization]', sessionParams.organization)
					.replace('[brand]', $scope.otherBrandObj.key)
					.replace('[reportType]', params.reportType)
					.replace('[reportId]', params.reportId);
				//utilsService.safeLog('viewReportForHref', result);
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
				// "css":"th-segment valign-top","name":"Guest Service","$$hashKey":"object:35"}]
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

				if (params.reportModel.needsSave) {
					msg = 'Report has unsaved changes - ' + msg;
				} else {
					msg = 'Report is not modified ';
				}

				return msg;
			} else if (params.reportModel.needsSave) {
				return 'Report has unsaved changes';
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
			//utilsService.safeLog('onHeaderCellClick col', col.key);
			if (col.position > 1) {
				$scope.expandChildColumns(col);
			} else if (col.key === 'summary') {
				// toggle average calculation from normal to weighted and viceversa
				var newMode = reportService.toggleAverageCalculationMode();
				alert('Switched average calculation denominator to be: ' + newMode);
				$scope.recalculate();
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
			
			//utilsService.safeLog('toggleChildRows', row.children.length, true);

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
					//$scope.model.totCompletionTitle = commonConfig.totCompletionTitlePrefix + (groupCol.name || groupCol.title);
					$scope.model.totCompletionTitle = (commonConfig.totCompletionTitlePrefix + $scope.reportTitle);

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
				return _.filter(parentRow.children, predicates.show).length > 1;
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
			var useFixedWidth = reportConfig.useFixedWidthForCols; //totColumns > 10;
			
			var styleObj = {
			};

			if (col.key === 'category') {
				styleObj.width = reportConfig.colCategoryWidth; //useFixedWidth ? '200px' : storeWidthPercent + '%';
				styleObj['min-width'] = styleObj.width;
				styleObj['max-width'] = styleObj.width;
			} else if (col.key === 'summary') {
			 	styleObj.width = reportConfig.colSummaryWidth; //useFixedWidth ? '130px' : summaryWidthPercent + '%';
				styleObj['min-width'] = styleObj.width;
				styleObj['max-width'] = styleObj.width;
			} else {
				if (useFixedWidth) {
					styleObj.width = reportConfig.colSegmentWidth;
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

/* begin: custom report code */
var getReportParamsModel = function() {

	// create params model to send to API end point for custom report data 
	var clone = JSON.parse(angular.toJson(params.reportModel));
	clone.stores = _.filter(clone.stores, predicates.selected);
	clone.courses = _.filter(clone.courses, predicates.selected);
	clone.segments = _.filter(clone.segments, predicates.selected);

	clone.storesIds = _.map(clone.stores, predicates.id);
	clone.segmentIds = _.map(clone.segments, predicates.id);

	// having this year for consistency, but back end currently doe snot need this parameter
	clone.courseSelectionTypeId = clone.courseSelectionType.id;

	// if selection type is 2, get the courseIds from the segments selected
	if (clone.courseSelectionTypeId === 2) {
		clone.courseIds = [];
		_.each(clone.segments, function(item) {
			return _.each(item.los, function(lo) {
				clone.courseIds.push(lo.id);
			});
		});
	} else {
		clone.courseIds = _.pluck(clone.courses, 'id');
	}

	clone.audienceId = clone.audience.id;
	clone.hiredId = clone.hired.id;

	clone.audienceOptions = $scope.audienceOptions;
	clone.hiredOptions = $scope.hiredOptions;

	clone.user = sessionParams.token;

	clone.reportName = $scope.reportTitle;
	
	//utilsService.safeLog('getReportParamsModel clone', clone, true);
	return clone;
};
/* end: custom report code */
		

		var onDataError = function(err) {
			utilsService.safeLog('reportController.onDataError', err);
			$scope.error = 'Could not fetch data';
		};
	

		var onDataComplete  = function(data, reportParamsModel) {
			if (angular.isDefined($scope.progressBar.intervalId)) {
				$interval.cancel($scope.progressBar.intervalId);
			}

			if (params.reportModel.courseSelectionType.id === 2) {
				data.segments = data.segments_dd.concat(data.segments_br);
			}

			//utilsService.safeLog('reportController.onDataComplete', JSON.stringify(data), true);
			// fix data as the backend endpoint return inconsistent data and also not mapped properties
			$scope.data = dataService.fixReportAPIData(data, commonConfig.peopleOrgStrategy, reportConfigStrategy);

			// need to filter columns here as back end is not doing it 
			if (params.reportModel.courseSelectionType.id === 1) {
				// filter the courses that have not be selected in the params model for this custom report
				$scope.data.segments[0].los = _.filter($scope.data.segments[0].los, function(item) {
					return reportParamsModel.courseIds.indexOf(item.id) > -1;
				});
			} else {
				// filter the segments that have not be selected in the params model for this custom report
				$scope.data.segments = _.filter($scope.data.segments, function(item) {
					return reportParamsModel.segmentIds.indexOf(item.id) > -1;
				});
			}


			// get the report model from reportService
			$scope.model = reportService.getModel(data, commonConfig.totCompletionTitlePrefix + $scope.reportTitle);
			
			// distinct peopleOrgs
			$scope.peopleOrgs = data.peopleOrgs;
			//TODO: temporarily disabled this on custom report: $scope.displayViewReportFor = sessionParams.organization === 'ddbr' || data.peopleOrgs.length > 1;

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

			utilsService.safeLog('getData: reportType', params.reportType);

			$scope.progressBar.value = 0;
			$scope.progressBar.intervalId = $interval(function() {
				$scope.increaseProgressBar();
			}, 2000);

			var reportParamsModel = getReportParamsModel();
			delete reportParamsModel.needsSave;
			delete reportParamsModel.stores;
			delete reportParamsModel.courses;
			delete reportParamsModel.segments;
			delete reportParamsModel.courseSelectionType;
			delete reportParamsModel.audience;
			delete reportParamsModel.hired;
			delete reportParamsModel.courseSelectionTypeOptions;
			delete reportParamsModel.audienceOptions;
			delete reportParamsModel.hiredOptions;
			//utilsService.safeLog('reportParamsModel to post to end point', reportParamsModel, true);

			var _endPoints = [{
				key: 'stores',
				propertyOnData: 'results',
				path: configService.apiEndPoints.customReportStores(sessionParams.token),
				method: 'post',
				postData: JSON.stringify(reportParamsModel)
			}, {
				key: 'courses', /* lo-list lookup */
				propertyOnData: undefined, // TODO: propertyOnData: 'results': backend should wrap items array into results like for other APIs
				path: configService.apiEndPoints.losList()
			}, {
				key: 'segments_dd',
				propertyOnData: 'learning_path_items',
				path: configService.apiEndPoints.segments(ddReportConfigStrategy.pathId, sessionParams.token)
			}, {
				key: 'segments_br',
				propertyOnData: 'learning_path_items',
				path: configService.apiEndPoints.segments(brReportConfigStrategy.pathId, sessionParams.token)
			}];

			utilsService.safeLog('_endPoints', _endPoints, true);// force loggin all the time by passing true as 3rd param
			utilsService.safeLog('data posted to report-data end point', _endPoints[0].postData);

			// for testing, load data from local json files containing raw data from end points
			if (w === 'test') {

				_endPoints[0].path = 'data/custom-report-rows[typeId].json?'.replace('[typeId]', params.reportModel.courseSelectionType.id) + Math.random();
				_endPoints[0].method = 'get';
				
				_endPoints[1].path = 'data/custom-report-wizard-courses.json?' + Math.random();
				_endPoints[2].path = 'data/custom-report-wizard-segments1.json?' + Math.random();
				_endPoints[3].path = 'data/custom-report-wizard-segments2.json?' + Math.random();

				// bogus csodProfileId for testing
				$scope.csodProfileId = 999999999;
			}

			var _endPointsData = {}, _endPointCount = 0;
			var onEndPointComplete = function(endPoint, data) {
				if (endPoint.key === 'stores') {
					$scope.csodProfileId = data.csod_profile_id;
				}

				if (endPoint.propertyOnData) {
					_endPointsData[endPoint.key] = data[endPoint.propertyOnData];
				} else {
					if (endPoint.key === 'courses' && params.reportModel.courseSelectionType.id === 1) {
						// create one single "fake" segment with the custom report courses
						_endPointsData.segments = [{
							title: $scope.reportName,
							item_type: 'Section',
							id: params.reportId,
							// set the los
							los: data
						}];
					}
				}

				//utilsService.safeLog(endPoint.key + ' data return by API', data[endPoint.propertyOnData], true);

				if (++_endPointCount === _endPoints.length) {
					utilsService.safeLog('_endPointsData', _endPointsData);

					onDataComplete(_endPointsData, reportParamsModel);
				}
			};

			utilsService.fastLoop(_endPoints, function(endPoint) {
				dataService.getData(endPoint.path, endPoint.method, endPoint.postData)
					.then(function(data) {
						onEndPointComplete(endPoint, data);
					}, onDataError);
			});
		}

		// // invoke getData
		if ($scope.tokenError.length > 0) {
		 	alert($scope.tokenError);
		} else {
			var what = reportConfig.useTestData ? 'test' : 'live';
			getData(what);
		}

/* begin: custom report code */
$scope.isCustomReport = true;

$scope.editCustomReport = function() {
	utilsService.safeLog('editCustomReport');

	params.reportModel.reportName = $scope.reportTitle;
	configService.setParam('reportModel', params.reportModel);
	utilsService.safeLog('editCustomReport params.reportModel', params.reportModel);

	var wizardPath = '#/customReportWizard?a=1&brand=[brand]&reportType=custom&reportId=[reportId]'
		.replace('[brand]', params.brand)
		.replace('[reportId]', params.reportId);
	//utilsService.safeLog('wizardPath', wizardPath, true);
	document.location = wizardPath;
};

$scope.saveCustomReport = function(saveAsNew) {
	var model = getReportParamsModel();
	clonedModel = JSON.parse(JSON.stringify(model));
	delete clonedModel.user;

	var payload = {
		//id: params.reportId,
		name: $scope.reportTitle,
		model: JSON.stringify(clonedModel),
		csod_profile: $scope.csodProfileId,
	};

	// test name Conflict
	//$scope.modalConfirmOpen('reportNameConflict');

	if (isNaN($scope.csodProfileId)) {
		alert('Invalid csodProfileId parameter - please contact support');
	} else {
		var onSaveError = function(err) {
			console.log && console.log('reportController.onSaveError', err);
			$scope.error = 'Could not save report';
		};
		
		var onSaveComplete = function(result) {
			utilsService.safeLog('reportController.onSaveComplete', result, true);
			// sample response:
			// {"id":4,"csod_profile":null,"name":"Damiano Custom Report1","model":"{\"audience\":{\"id\":1,\"text\":\"All Active Store Personnel\"},\"hired\":{\"id\":1,\"text\":\"Since the beginning of time\"},\"storesIds\":[330,4870,4868],\"courseIds\":[\"bc1c0b96-f838-4efd-a71f-088d9ab7e01b\",\"6c54a81b-b844-4442-abc4-15b96f38d28d\",\"c5f471e4-c67d-453d-9e9a-2aff8e15e85d\"],\"audienceId\":1,\"hiredId\":1,\"user\":\"Q2hpcmFnO0phbmk7amFuaWM7amFuaWM7Y2phbmlAc2JjZ2xvYmFsLm5ldDtkdW5raW5icmFuZHM7MjAxNi0xMi0wMlQwNDoyNjowOFo7NEUxNkE3MjA5RjM0NDdEMDQzOUIxNzY1Njc1NkNBODA1NzExNDYwMQ\"}"}
			params.reportId = result.id;
			params.reportModel.reportName = $scope.reportTitle;
			params.reportModel.needsSave = false;
			$scope.needsSave = params.reportModel.needsSave;
			configService.setParam('reportModel', params.reportModel);
			configService.setParam('reportId', params.reportId);
		};
		
		var apiEndPoint = configService.apiEndPoints.customReport();

		if (saveAsNew) {
			//utilsService.safeLog('saving as new', true);
			params.reportId = -1;
			params.reportModel.needsSave = true;
			$scope.needsSave = params.reportModel.needsSave;
			configService.setParam('reportModel', params.reportModel);
			configService.setParam('reportId', params.reportId);
		}
		
		if (params.reportId > -1) {
			// existing report, update using PUT
			apiEndPoint += params.reportId + '/?format=json';
			utilsService.safeLog('saveCustomReport: update with PUT: apiEndPoint', apiEndPoint, true);
			dataService.putData(apiEndPoint, payload)
				.then(onSaveComplete, onSaveError);
		} else {
			// new report, create using POST
			utilsService.safeLog('saveCustomReport: create with POST: apiEndPoint', apiEndPoint, true);
			dataService.postData(apiEndPoint, payload)
				.then(onSaveComplete, onSaveError);
		}
	}
};

/* begin: modal save code */
$scope.modalSaveData = {
	reportId: params.reportId,
	title: (params.reportId > -1 ? 'Update' : 'Save New') + ' Report', // TODO: might have to change title value depending if it's brand new report or existing report being modified
	reportName: $scope.reportTitle,
	okCaption: params.reportId > -1 ? 'Update' : 'Save'
};

$scope.modalSave = {
	open: function () {
		var modalInstance = $uibModal.open({
			animation: false,
			// ariaLabelledBy: 'modal-title',
			// ariaDescribedBy: 'modal-body',
			// templateUrl: 'modalSave.html',
			// //controller: 'customReportController',
			// //controllerAs: '$ctrl',
			// appendTo: parentElem,
			component: 'modalSaveComponent',
			resolve: {
				data: function () {
					utilsService.safeLog('Modal resolve: pass modalSaveData', $scope.modalSaveData);
					return $scope.modalSaveData;
				}
			}
		});

		modalInstance.result.then(function (data) {
			utilsService.safeLog('Modal result', data);
			
			// TODO: after successful save, update also $scope.title
			$scope.reportTitle = data.reportName;
			$scope.title = data.reportName;
			$scope.model.totCompletionTitle = commonConfig.totCompletionTitlePrefix + $scope.reportTitle;
			$scope.saveCustomReport(data.saveAsNew);
		}, function () {
			utilsService.safeLog('Modal dismissed at');
		});
	}
};

$scope.modalSaveOpen = function() {
	utilsService.safeLog('modalSaveOpen');
	$scope.modalSave.open();
};
/* end: modal save code */

/* begin: modal confirm code */
$scope.modalConfirm = {
	open: function (modalConfirmStrategy) {
		var modalInstance = $uibModal.open({
			animation: false,
			component: 'modalConfirmComponent',
			resolve: {
				data: function () {
					utilsService.safeLog('Modal resolve: pass modalConfirmStrategy', modalConfirmStrategy);
					return modalConfirmStrategy;
				}
			}
		});

		modalInstance.result.then(function (data) {
			utilsService.safeLog('Modal result', data);
			
			// invoke strategy action 
			modalConfirmStrategy.okAction && modalConfirmStrategy.okAction();

		}, function () {
			utilsService.safeLog('Modal dismissed');
		});
	}
};

var modalConfirmStrategies = {
	openOtherReport: {
		title: 'Are you sure?', 
		message: 'Opening a saved report will clear your current settings and filters.',
		cancelCaption: 'Cancel',
		okCaption: 'Continue'
	},
	closeReport: {
		title: 'Are you sure?', 
		message: 'Your current settings and filters haven’t been saved. Are you sure you want to exit the report?',
		cancelCaption: 'Cancel',
		okCaption: 'Close Report',
		okAction: function() {
			$scope.currentBackAction();
		}
	},
	reportNameConflict: {
		title: 'Report Name Conflict',
		message: 'A saved report with that name already exists. Do you want to overwrite?',
		cancelCaption: 'Cancel',
		okCaption: 'Overwrite'
	}
};

$scope.modalConfirmOpen = function(w) {
	utilsService.safeLog('modalConfirmOpen', w);
	var strategy = modalConfirmStrategies[w];
	if (!strategy) {
		alert('Could not find strategy for modal confirm ' + w);
	} else {
		$scope.modalConfirm.open(strategy);
	}
};
/* end: modal confirm code */

/* end: custom report code */

	};
}());
