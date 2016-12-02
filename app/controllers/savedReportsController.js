(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.savedReportsController = function($scope, $route, $routeParams, $location, $filter, $uibModal, 
		utilsService, configService, dataService) {

		var commonConfig = configService.getCommonConfig(),
		 sessionParams = commonConfig.sessionParams,
		 params = commonConfig.params;

		utilsService.safeLog('savedReportsController params', params, true);
		utilsService.safeLog('savedReportsController sessionParams', sessionParams, true);

		/**
		 * @method cancel
		 * @description
		 * Users click on a step directly
		 */
		$scope.cancel = function cancel() {
			//this.hide();
			var path = '#/?brand=[brand]'
					.replace('[brand]', params.brand);
			$location.path(path);
		};

		$scope.viewReport = function(report) {
			utilsService.safeLog('editviewReportReport', report.id);
			alert('View/Run report: Not implemented yet');
		};

		$scope.editReport = function(report, $event) {
			$event.stopPropagation();
			utilsService.safeLog('editReport', report.id);

			configService.setParam('reportId', report.id);
			var reportModel = typeof report.model === 'string' ? JSON.parse(report.model) : report.model;
			configService.setParam('reportModel', reportModel);

			// changes to the following code here will have to be replicated also in customReportWizard Controller towards the end within nextStep routine
			var reportPath = '#/customReport?a=1&brand=[brand]&reportType=custom&reportId=[reportId]'
				.replace('[brand]', params.brand)
				.replace('[reportId]', report.id);
			console.log('reportPath', reportPath, true);
			document.location = reportPath;
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
						id: 'custom-report-' + id,
						name: 'My custom report name ' + id,
						statusMsg: 'Modified mm/dd/yyyy'
							.replace('mm', getRandomInt(1, 12))
							.replace('dd', getRandomInt(1, 28))
							.replace('yyyy', getRandomInt(2016, 2018)),
						isLocked: false
					});
				}
			} else {
				var endPointUrl = configService.apiEndPoints.customReportList(sessionParams.token);
				console.log('endPointUrl', endPointUrl);
				dataService.getData(endPointUrl)
					.then(onDataComplete, onDataError);
			}
		};

		getData('live');

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
			console.log('okAction: params: ', actionParams);
			//TODO: need to send DELETE to REST API
			console.log('TODO: need to send DELETE to REST API');

			// fake, just for testing the UI flow
			$scope.model.reports = _.filter($scope.model.reports, function(item) {
				return item.id !== actionParams.reportId;
			});

			var onDeleteError = function(err) {
				console.log('savedReportController.onDeleteError', err, true);
				$scope.error = 'Could not delete report';
			};
			
			var onDeleteComplete = function(result) {
				console.log('savedReportController.onDeleteComplete', result, true);
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
