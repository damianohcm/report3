(function(angular) {

	var getQueryStringValue = function (key, defaultValue) {  
        if (document.location.search && document.location.search.length > 0) {
            var arr = document.location.search.split(key + '=')[1];
            if (arr && arr.length > 0) {
                return arr.split('&')[0];
            } else {
                return defaultValue;
            }
        } else {
            return defaultValue;
        }
    };

	// create module 'githubViewer'
	var app = angular.module('Main', 
		[
			'ngRoute', 
			'ngAnimate', 
			'ui.bootstrap'
		]).run(function($rootScope) {
			$rootScope.csBaseUrl = getQueryStringValue('csBaseUrl', '').toLowerCase();
			$rootScope.brand = getQueryStringValue('brand', 'dd').toLowerCase();
			$rootScope.lang = getQueryStringValue('lang', 'eng').toLowerCase();
			$rootScope.reportId = getQueryStringValue('reportId', 'learning-path').toLowerCase();

			console && console.log('brand/lang/reportID', {
				'document.location.search': document.location.search,
				brand: $rootScope.brand,
				lang: $rootScope.lang,
				reportId: $rootScope.reportId
			});

			$rootScope.mainCss = document.getElementById('mainCss');

			if (($rootScope.brand && $rootScope.brand.toLowerCase()) === 'br') {
				$rootScope.mainCss.setAttribute('href', 'css/main-br.css');
			}

			if ($rootScope.reportId && $rootScope.reportId.length > 0) {
				document.location = '#/report?a=1&reportId=' + $rootScope.reportId;
			}
		});
	
	// configure
	app.config([
		'$routeProvider',
		function($routeProvider) {
		
			$routeProvider
				.when('/', {
					templateUrl: 'views/home.html',
					controller: 'homeController'
				})
				.when('/report', {
					templateUrl: 'views/report.html',
					controller: 'reportController'
				})
				.otherwise({
					redirectTo: '/'
				});
		}]);
	
	// register services with angular
    app.factory('utilsService', [services.utilsService]);
	app.factory('dataService', ['$http', services.dataService]);
	app.factory('undoServiceFactory', [services.undoServiceFactory]);
	app.factory('reportService', ['utilsService', services.reportService]);

	// register controllers
	// home controllers
	app.controller('homeController', [
		'$scope',
		'$rootScope',  
		'utilsService',
		controllers.homeController]);
	
	// report controller
	app.controller('reportController', [
		'$scope', 
		'$rootScope', 
		'utilsService',
		'undoServiceFactory', 
		'dataService', 
		'reportService', 
		'$timeout',
		'$interval',
		controllers.reportController]);

}(window.angular));
