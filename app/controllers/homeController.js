(function() {

	// create controller
	window.controllers = window.controllers || {};
  
    window.controllers.homeController = function($scope, $location, utilsService, configService) {

		var commonConfig = configService.getCommonConfig(),
			sessionParams = commonConfig.sessionParams,
		 	params = commonConfig.params;
		
		$scope.environment = configService.getEnvironment();

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
				action: function(reportType) {
					configService.setParam('reportType', reportType);
					document.location = '#/report?a=1&brand=[brand]&reportType=[reportType]'
						.replace('[brand]', params.brand)
						.replace('[reportType]', params.reportType);
					// $location.path('/report?a=1&brand=[brand]&reportType=[reportType]'
					// 	.replace('[brand]', params.brand)
					// 	.replace('[reportType]', params.reportType));
				}
			},
			customReportWizard: {
				action: function() {
					// starting a brand new report, reset param reportId before navigating to customReportWizard
					configService.setParam('reportId', -1);
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

		$scope.menuItemClick = function(key, reportType) {
			if ($scope.tokenError.length > 0) {
				alert($scope.tokenError);
			} else {
				var strategy = menuItemsStrategy[key];
				if (!strategy) {
					alert('menu item click for ' + key + ' not implemented');
				} else {
					strategy.action(reportType);
				};
			}
		};

		if ($scope.tokenError.length > 0) {
			alert($scope.tokenError);
		}

	};

}());
