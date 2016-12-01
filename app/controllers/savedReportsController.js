(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.savedReportsController = function($scope, $route, $routeParams, $location, $filter, $uibModal, utilsService, dataService) {

		/**
		 * @method cancel
		 * @description
		 * Users click on a step directly
		 */
		$scope.cancel = function cancel() {
			//this.hide();
			$location.path('#/');
		};

		$scope.viewReport = function(report) {
			utilsService.safeLog('editviewReportReport', report.id);
			alert('View/Run report: Not implemented yet');
		};

		$scope.editReport = function(report, $event) {
			$event.stopPropagation();
			utilsService.safeLog('editReport', report.id);
			alert('Edit: Not implemented yet');
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
