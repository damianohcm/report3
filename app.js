(function(angular) {

	// create module 'githubViewer'
	var app = angular.module('Main', 
		[
			'ngRoute', 
			'ngAnimate', 
			'ui.bootstrap'
		]);
	
	// configure
	app.config([
		'$routeProvider',
		'$locationProvider', 
		function($routeProvider, $locationProvider) {
		
			$routeProvider
				.when('/', {
					templateUrl: 'views/report.html',
					controller: 'reportController'
				})
				.otherwise({
					redirectTo: '/'
				});

			//$locationProvider.html5Mode(true);
		
		}]);
	
	// register services with angular
    app.factory('utilsService', [services.utilsService]);
	app.factory('dataService', ['$http', services.dataService]);
	app.factory('undoServiceFactory', [services.serviceFactory]);
	app.factory('reportService', ['utilsService', services.reportService]);

	// register controllers
	app.controller('reportController', [
		'$scope', 
		'utilsService',
		'undoServiceFactory', 
		'dataService', 
		'reportService', 
		'$timeout',
		'$interval',
		controllers.reportController]);

}(window.angular));
