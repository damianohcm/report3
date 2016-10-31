(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.savedReportsController = function($scope, $rootScope, $route, $routeParams, $location, $filter, utilsService, dataService) {

		/**
		 * @method cancel
		 * @description
		 * Users click on a step directly
		 */
		$scope.cancel = function cancel() {
			//this.hide();
			$location.path('#/');
		};

		$scope.model = {
			reports: [{
				id: 'custom-report-1',
				name: 'My custom report 1',
				isLocked: false
			}]
		};

	};

}());
