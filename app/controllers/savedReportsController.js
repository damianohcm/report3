(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.savedReportsController = function($scope, $route, $routeParams, $location, $filter, $uibModal, 
		utilsService, configService, dataService) {

		var commonConfig = configService.getCommonConfig(),
			savedReportsConfig = configService.getSavedReportsConfig(),
			sessionParams = commonConfig.sessionParams,
			params = commonConfig.params;

		utilsService.safeLog('savedReportsController params', params, true);
		utilsService.safeLog('savedReportsController sessionParams', sessionParams, true);

		Object.defineProperty($scope, 'tokenError', {
			get: function() {
				return (sessionParams.token || '').length === 0 ? 'Invalid token or missing token' : '';
			}
		});

		/**
		 * @method exit
		 * @description
		 */
		$scope.exit = function exit() {
			var path = '[csBaseUrl]&organization=[organization]&brand=[brand]'
				.replace('[csBaseUrl]', sessionParams.csBaseUrl)
				.replace('[organization]', sessionParams.organization)
				.replace('[brand]', params.brand);
			window.parent.location = path;
		};

		var backToReportingHome = function backToReportingHome() {
			// reset reportId param so that it starts clear next time
			configService.setParam('reportId', -1);
			
			var path = '[csBaseUrl]&organization=[organization]&brand=[brand]'
				.replace('[csBaseUrl]', sessionParams.csBaseUrl)
				.replace('[organization]', sessionParams.organization)
				.replace('[brand]', params.brand);
			window.parent.location = path;
		};

		$scope.goHome = function goHome() {
			backToReportingHome();
		};

		$scope.viewReport = function(report) {
			utilsService.safeLog('viewReport', report.id, true);
			
			configService.setParam('reportId', report.id);
			var reportModel = typeof report.model === 'string' ? JSON.parse(report.model) : report.model;
			reportModel.reportName = report.name;
			reportModel.needsSave = false;
			configService.setParam('reportModel', reportModel);

			// changes to the following code here will have to be replicated also in customReportWizard Controller towards the end within nextStep routine
			var reportPath = '#/customReport?a=1&brand=[brand]&reportType=custom&reportId=[reportId]'
				.replace('[brand]', params.brand)
				.replace('[reportId]', report.id);
			utilsService.safeLog('reportPath', reportPath, true);
			document.location = reportPath;
		};

		$scope.editReport = function(report, $event) {
			$event.stopPropagation();
			$scope.viewReport(report);
		};

		$scope.deleteReport = function(report, $event) {
			$event.stopPropagation();
			utilsService.safeLog('deleteReport', report.id);
			// var result = window.confirm('Are you sure you want to delete this report? This action cannot be undone.');
			// if (result) {
			// 	alert('Delete: Not implemented yet');
			// }
			$scope.modalConfirmOpen('deleteReport', {
				reportId: report.id
			});
		};

		$scope.model = {
			reports: []
		};

		var onDataError = function(err) {
			utilsService.safeLog('saveReportController.onDataError', err);
			$scope.error = 'Could not fetch data';
		};
	

		var onDataComplete  = function(data) {
			utilsService.safeLog('saveReportController.onDataComplete', data);

			$scope.model.reports = _.map(data.results, function(item) {
				return {
					id: item.id,
					name: item.name,
					statusMsg: '[Modified mm/dd/yyyy]',
						//.replace('mm', getRandomInt(1, 12))
						//.replace('dd', getRandomInt(1, 28))
						//.replace('yyyy', getRandomInt(2016, 2018)),
					//isLocked: false,
					model: item.model
				};
			});
		};

		// helper to get the data
		var getData = function(w) {
			if (w === 'test') {
				// for testing
				var howMany = 20;
				var getRandomInt = function(min, max) {
					return Math.floor(Math.random() * (max - min + 1)) + min;
				};
				for (var i = howMany; --i > 0;) {
					var id = howMany - i;
					$scope.model.reports.push({
						id: id,
						name: 'My custom report name ' + id,
						statusMsg: 'Modified mm/dd/yyyy'
							.replace('mm', getRandomInt(1, 12))
							.replace('dd', getRandomInt(1, 28))
							.replace('yyyy', getRandomInt(2016, 2018)),
						isLocked: false,
						model: {
							// fake, just for testing
							stores: [],
							audience: {
								id: 1,
								text: 'All Store Personnel'
							},
							hired: {
								id: 1,
								text: 'Since the beginning of time',
								otherField: undefined
							},
							hiredAfter: undefined,
							courseSelectionType: {
								id: 1,
								text: 'Courses'
							},
							courses: [],
							segments: [],
							needsSave: false
						}
					});
				}
			} else {
				var endPointUrl = configService.apiEndPoints.customReportList(sessionParams.token);
				utilsService.safeLog('endPointUrl', endPointUrl);
				dataService.getData(endPointUrl)
					.then(onDataComplete, onDataError);
			}
		};

		// // invoke getData
		if ($scope.tokenError.length > 0) {
		 	alert($scope.tokenError);
		} else {
			var what = savedReportsConfig.useTestData ? 'test' : 'live';
			getData(what);
		}

/* begin: modal confirm code */
$scope.modalConfirm = {
	open: function (modalConfirmStrategy, actionParams) {

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
			
			// TODO: 
			modalConfirmStrategy.okAction(actionParams);

		}, function () {
			utilsService.safeLog('Modal dismissed');
		});
	}
};

var modalConfirmStrategies = {
	deleteReport: {
		title: 'Are you sure?', 
		message: 'Are you sure you want to delete this report? This action cannot be undone.',
		cancelCaption: 'Cancel',
		okCaption: 'Delete',
		okAction: function(actionParams) {
			utilsService.safeLog('okAction: params: ', actionParams);
			//TODO: need to send DELETE to REST API
			utilsService.safeLog('TODO: need to send DELETE to REST API');

			// fake, just for testing the UI flow
			$scope.model.reports = _.filter($scope.model.reports, function(item) {
				return item.id !== actionParams.reportId;
			});

			var onDeleteError = function(err) {
				utilsService.safeLog('savedReportController.onDeleteError', err, true);
				$scope.error = 'Could not delete report';
			};
			
			var onDeleteComplete = function(result) {
				utilsService.safeLog('savedReportController.onDeleteComplete', result, true);
			};
			
			var apiEndPoint = configService.apiEndPoints.customReport();
			
			if (actionParams.reportId > 0) {
				// existing report, update using PUT
				apiEndPoint += '/' + actionParams.reportId + '/' + '?format=json';
				utilsService.safeLog('saveCustomReport: DELETE: apiEndPoint', apiEndPoint, true);
				dataService.deleteData(apiEndPoint)
					.then(onDeleteComplete, onDeleteError);
			} else {
				alert('Invalid reportId parameter - please contect support');
			}

		}
	}
};

$scope.modalConfirmOpen = function(w, actionParams) {
	utilsService.safeLog('modalConfirmOpen', w);
	var strategy = modalConfirmStrategies[w];
	if (!strategy) {
		alert('Could not find strategy for modal confirm ' + w);
	} else {
		$scope.modalConfirm.open(strategy, actionParams);
	}
};
/* end: modal confirm code */

	};

}());
