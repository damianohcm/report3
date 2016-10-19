(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.homeController = function($scope, $rootScope, utilsService) {

		$scope.menuItemClick = function(reportId) {
			$rootScope.reportId = reportId;
			document.location = '#/report?a=1&reportId=' + $rootScope.reportId;
		};

	};

}());
