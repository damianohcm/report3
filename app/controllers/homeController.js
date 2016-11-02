(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.homeController = function($scope, $rootScope, $location, utilsService) {

		Object.defineProperty($scope, 'tokenError', {
			get: function() {
				return ($rootScope.token || '').length === 0 ? 'Invalid token or missing token' : '';
			}
		});

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
			},
			savedReports: {
				action: function() {
					document.location = '#/savedReports';
				}
			}
		};

		$scope.menuItemClick = function(key, reportId) {
			if ($scope.tokenError.length > 0) {
				alert($scope.tokenError);
			} else {
				var strategy = menuItemsStrategy[key];
				if (!strategy) {
					alert('menu item click for ' + key + ' not implemented');
				} else {
					strategy.action(reportId);
				};
			}
		};

		if ($scope.tokenError.length > 0) {
			alert($scope.tokenError);
		}

	};

}());
