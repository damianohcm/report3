(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.homeController = function($scope, $location, utilsService, configService) {

		var commonConfig = configService.getCommonConfig(),
			sessionParams = commonConfig.sessionParams,
		 	params = commonConfig.params;
		
		Object.defineProperty($scope, 'organization', {
			get: function() {
				return (sessionParams.organization && sessionParams.organization.toLowerCase() || '');
			}
		});

		Object.defineProperty($scope, 'csBaseUrl', {
			get: function() {
				return sessionParams.csBaseUrl || '';
			}
		});

		Object.defineProperty($scope, 'tokenError', {
			get: function() {
				return (sessionParams.token || '').length === 0 ? 'Invalid token or missing token' : '';
			}
		});

		// use document.location here; do not use $location 
		var menuItemsStrategy = {
			openReport: {
				action: function(reportId) {
					configService.setParam('reportId', reportId);
					document.location = '#/report?a=1&brand=[brand]&reportId=[reportId]'
						.replace('[brand]', params.brand)
						.replace('[reportId]', params.reportId);
					// $location.path('/report?a=1&brand=[brand]&reportId=[reportId]'
					// 	.replace('[brand]', params.brand)
					// 	.replace('[reportId]', params.reportId));
				}
			},
			customReportWizard: {
				action: function() {
					//document.location = '#/customReportWizard';
					$location.path('/customReportWizard');
				}
			},
			savedReports: {
				action: function() {
					//document.location = '#/savedReports';
					$location.path('/savedReports');
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
