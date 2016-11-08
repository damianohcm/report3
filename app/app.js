(function(angular) {

	var getRouteParamValue = function ($routeParams, key, defaultValue) {  
        if ($routeParams && $routeParams[key]) {
			return $routeParams[key];
		} else {
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
		}
    };

	// create module 'githubViewer'
	var app = angular.module('Main', 
			[
				'ngRoute', 
				'ngAnimate', 
				'ui.bootstrap',
				'ngTagsInput'
			]
		).run(
			[
				'$rootScope',
				'$location', 
				'$routeParams', 
				'utilsService', 
				'configService', 

				function($rootScope, $location, $routeParams, utilsService, configService) {

					$rootScope.$on('$routeChangeSuccess', function(e, current, pre) {
						var routePath = $location.path();
						utilsService.safeLog('Current route: ', routePath, true);
						// Get all URL parameter
						utilsService.safeLog('Current route params: ', $routeParams, true);

						var reportId = getRouteParamValue($routeParams, 'reportId', '').toLowerCase();
						if (['/', '/report', '/customReport'].indexOf(routePath) > -1 && reportId.length > 0) {
							$rootScope.reportId = reportId;
						}

						$rootScope.token = getRouteParamValue($routeParams, 'token', '');
						$rootScope.compKey = getRouteParamValue($routeParams, 'compKey', '');
						$rootScope.csBaseUrl = getRouteParamValue($routeParams, 'csBaseUrl', '');
						$rootScope.brand = getRouteParamValue($routeParams, 'brand', 'dd').toLowerCase();
						$rootScope.lang = getRouteParamValue($routeParams, 'lang', 'eng').toLowerCase();
						$rootScope.organization = getRouteParamValue($routeParams, 'organization', $rootScope.brand);
						
						utilsService.safeLog('document.location.search', document.location.search);
						utilsService.safeLog('token/compKey/brand/lang/reportID', {
							//'document.location.search': document.location.search,
							token: $rootScope.token,
							organization: $rootScope.organization,
							compKey: $rootScope.compKey,
							brand: $rootScope.brand,
							lang: $rootScope.lang,
							reportId: $rootScope.reportId
						}, true);

						$rootScope.mainCss = document.getElementById('mainCss');

						if (($rootScope.brand && $rootScope.brand.toLowerCase()) === 'br') {
							$rootScope.mainCss.setAttribute('href', 'css/main-br.css');
						}

						if ($rootScope.reportId && $rootScope.reportId.length > 0 && $rootScope.reportId !== 'custom') {
							utilsService.safeLog('$rootScope.reportId exists: redirect ro /report');
							// use document.location here; do not use $location 
							document.location = '#/report?a=1&reportId=' + $rootScope.reportId;
						}
					});
				}
			]
		);

	// indeterminate-checkbox directive for tri-state checkbox
	app.directive('customcheck', function() {
		return {
			// Restrict the directive so it can only be used as an attribute
			restrict: 'A',
			link: function link(scope, elem, attrs) {
				//console.log('attrs', attrs);
				var childList = scope.$eval(attrs.childList),
            		property = attrs.property;

				var areAllSelected = function(arr) {
					console.log('areAllSelected function: arr.length:', arr.length);
					return arr && arr.length > 0 && arr.every(function(item) {
						return item.selected === true;
					});
				};

				var areSomeSelected = function(arr) {
					return !areAllSelected(arr) && arr.some(function(item) {
						return item.selected === true;
					});
				};

				var setAllSelected = function(val) {
					childList = scope.$eval(attrs.childList);
					angular.forEach(childList, function(child) {
						child[property] = val;
					});
				};

				// Watch the children for changes
				var childListWatcher = scope.$watch(function() {
					childList = scope.$eval(attrs.childList);
					if (childList) {
						return childList.map(function(obj) {
								return {
									selected: obj.selected
								};
							});
					} else {
						return [];
					}
				}, function (items) {
					//console.log('childListWatcher items', items);
					//console.log('childListWatcher areAllSelected', areAllSelected(items));
					//console.log('childListWatcher areSomeSelected', areSomeSelected(items));
					var someSelected = areSomeSelected(items);
					if (!someSelected) {
						var allSelected = areAllSelected(items);
						//setAllSelected(allSelected);
						//console.log('attrs.ngChecked', attrs.ngChecked);
						//console.log('allSelected', allSelected);
						//attrs.ngChecked = allSelected;
						scope.$eval(attrs.ngChecked + ' = ' + allSelected);
					} else {
						scope.$eval(attrs.ngChecked + ' = false');
					}

				}, true);

				var checkedWatcher = scope.$watch(attrs.checked, function(value) {
					//console.log('checkedWatcher', value);
					//console.log('checkedWatcher loop set set property on children');
					setAllSelected(value);
				});

				/*// Whenever the bound value of the attribute changes we update
				// the internal 'indeterminate' flag on the attached dom element
				var checkedStateWatcher = scope.$watch(attrs.checkedState, function(value) {
					console.log('checkedStateWatcher', value);
					//elem[0].indeterminate = value;
					if (value !== undefined) {
						console.log('checkedStateWatcher loop set set property on children');
						angular.forEach(childList, function(child) {
							child[property] = value;
						});
					}
				});*/

				// Remove the watcher when the directive is destroyed
				scope.$on('$destroy', function() {
					childListWatcher();
					checkedWatcher();
				});

				// Bind the onChange event to update children
				elem.bind('change', function() {
					scope.$apply(function () {
						var isChecked = elem.prop('checked');
						//console.log('isChecked', isChecked);
						
						// Set each child's selected property to the checkbox's checked property
						angular.forEach(childList, function(child) {
							child[property] = isChecked;
						});
					});
				});
			}
		};
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
				.when('/customReport', {
					templateUrl: 'views/customReport.html',
					controller: 'customReportController'
				})
				.when('/customReportWizard', {
					templateUrl: 'views/customReportWizard.html',
					controller: 'customReportWizardController'
				})
				.when('/savedReports', {
					templateUrl: 'views/savedReports.html',
					controller: 'savedReportsController'
				})
				.otherwise({
					redirectTo: '/'
				});
		}]);
	
	// register services with angular
	app.factory('utilsService', [services.utilsService]);
	app.factory('dataService', ['$http', 'utilsService', services.dataService]);
	app.factory('undoServiceFactory', ['utilsService', services.undoServiceFactory]);
	app.factory('configService', ['utilsService', services.configService]);
	app.factory('reportServiceConfig', ['utilsService', services.reportServiceConfig]);
	app.factory('reportService', ['utilsService', 'reportServiceConfig', services.reportService]);
	app.factory('wizardServiceFactory', ['utilsService', services.wizardServiceFactory]);

	app.component('modalSaveComponent', components.modalSaveComponent);

	// register controllers
	// home controllers
	app.controller('homeController', [
		'$scope', '$rootScope', '$location', 
		'utilsService', 'configService', 
		controllers.homeController]);
	
	// report controller
	app.controller('reportController', [
		'$scope', '$rootScope', '$location', '$timeout', '$interval', 
		'utilsService', 'configService',
		'undoServiceFactory', 
		'dataService', 
		'reportService', 
		controllers.reportController]);
	
	// custom report controller (same as report controller - but for now keeping separate to not affect current functionality)
	app.controller('customReportController', [
		'$scope', '$rootScope', '$location', '$timeout', '$interval', '$uibModal', 
		'utilsService',
		'undoServiceFactory', 
		'dataService', 
		'reportService', 
		controllers.customReportController]);
	
	// custom report wizard controller
	app.controller('customReportWizardController', [
		'$scope',
		'$rootScope',
		'$route', '$routeParams', '$location', '$filter', 
		'utilsService',
		'dataService',
		'wizardServiceFactory',
		controllers.customReportWizardController]);

	// saved reports controller
	app.controller('savedReportsController', [
		'$scope',
		'$rootScope',
		'$route', '$routeParams', '$location', '$filter', 
		'utilsService',
		'dataService',
		controllers.savedReportsController]);

		

}(window.angular));
