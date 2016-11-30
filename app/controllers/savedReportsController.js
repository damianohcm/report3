(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.savedReportsController = function($scope, $route, $routeParams, $location, $filter, utilsService, dataService) {

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
			var result = window.confirm('Are you sure you want to delete this report? This action cannot be undone.');
			if (result) {
				alert('Delete: Not implemented yet');
			}
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

	};

}());
