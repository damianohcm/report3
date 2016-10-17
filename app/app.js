(function(angular) {

	// create module 'githubViewer'
	var app = angular.module('Main', 
		[
			'ngRoute', 
			'ngAnimate', 
			'ui.bootstrap'
		]).run(function($rootScope) {
			$rootScope.brand = '', $rootScope.lang = '';
			var url = document.location.search.split('brand=')[1], lang = document.location.search.split('lang=')[1];
			$rootScope.brand = url ? url.split('&')[0] : '';
			$rootScope.lang = lang !== undefined ? lang.split('&')[0] : lang = 'Eng';

			// console.log('brand and lang', {
			// 	'document.location.search': document.location.search,
			// 	brand: $rootScope.brand,
			// 	lang: $rootScope.lang
			// });
		});
	
	// configure
	app.config([
		'$routeProvider',
		function($routeProvider) {
		
			$routeProvider
				.when('/', {
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
