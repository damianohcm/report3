(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.homeController = function($scope, $rootScope, $location, utilsService) {

		var menuItemsStrategy = {
			openReport: {
				action: function(reportId) {
					$rootScope.reportId = reportId;
					document.location = '#/report?a=1&reportId=' + $rootScope.reportId;
				}
			},
			customReport: {
				action: function() {
					document.location = '#/customReport';
				}
			}
		};

		$scope.menuItemClick = function(key, reportId) {
			var strategy = menuItemsStrategy[key];
			if (!strategy) {
				alert('menu item click for ' + key + ' not implemented');
			} else {
				strategy.action(reportId);
			};
		};

	};

}());
