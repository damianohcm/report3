(function() {

	// create controller
	window.controllers = window.controllers || {};
  
	window.controllers.customReportWizardController = function($scope, $route, $routeParams, $location, $filter, $uibModal, 
		utilsService, configService, dataService, wizardServiceFactory) {

		var commonConfig = configService.getCommonConfig(),
			sessionParams = commonConfig.sessionParams,
		 	params = commonConfig.params;

		/**
		 * @method cancel
		 * @description
		 * Users click on a step directly
		 */
		$scope.cancel = function cancel() {
			//this.hide();
			// TODO: need to prompt user for confirmation in case there are pending changes
			if ($scope.modelIsDirty) {
				$scope.modalConfirmOpen('closeWizard');
			} else {
				$location.path('#/');
			}
		};

		this.params = $routeParams;

		// model lookups 
		$scope.audienceOptions = [{
			id: 1,
			text: 'All Active Store Personnel'
		}, {
			id: 2,
			text: 'Active Managers Only'
		}, {
			id: 3,
			text: 'Active Shift Leaders only'
		}];

		$scope.hiredOptions = [{
			id: 1,
			text: 'Since the beginning of time',
			otherField: undefined
		}, {
			id: 2,
			text: 'After selected date ',
			otherField: 'hiredAfter'
		}];
		
		// model for wizard selections
		$scope.model = {
			// step 1
			stores: [],
			// step 2:
			audience: $scope.audienceOptions[0],
			hired: $scope.hiredOptions[0],
			hiredAfter: undefined,
			// step 3
			entireLearningPath: false,
			courses: []
		};

		// original model to kee track of changes
		$scope.originalModel = {};

		// property that calculates wheter the model has been changed by the user
		// and we need to present the user with confirm dialogs when she is navigating
		// away without saving etc.
		Object.defineProperty($scope, 'modelIsDirty', {
			get: function() {
				var origModel = JSON.parse(angular.toJson($scope.originalModel));
				var model = JSON.parse(angular.toJson($scope.model));
				
				return utilsService.areEqual(origModel, model) === false;
			}
		});

		// summary model for final step
		$scope.summary = {
		};
		Object.defineProperty($scope.summary, 'stores', {
			get: function() {
				return $scope.model.stores.filter(function(store) {
					return store.selected;
				});
			}
		});
		Object.defineProperty($scope.summary, 'learners', {
			get: function() {
				return $scope.model.audience.text;
			}
		});
		Object.defineProperty($scope.summary, 'hired', {
			get: function() {
				return $scope.model.hired.otherField ? undefined : $scope.model.hired.text;
			}
		});
		Object.defineProperty($scope.summary, 'hiredAfter', {
			get: function() {
				if ($scope.model.hiredAfter) {
					return $filter('date')($scope.model.hiredAfter, 'shortDate');
				} else {
					return 'Not Selected';
				}
			}
		});
		Object.defineProperty($scope.summary, 'entireLearningPath', {
			get: function() {
				if ($scope.model.entireLearningPath) {
					return 'Entire Learning Path';
				} else {
					return undefined;
				}
			}
		});
		Object.defineProperty($scope.summary, 'courses', {
			get: function() {
				return $scope.model.courses;
				// if (!$scope.model.entireLearningPath) {
				// 	// return $scope.model.courses.filter(function(course) {
				// 	// 	return course.selected;
				// 	// });
				// 	return $scope.model.courses;
				// } else {
				// 	return [];
				// }
			}
		});

		// wizard setup
		$scope.wizard = wizardServiceFactory.getService('customReportWizardController');

		/**
		 * @method previousStep
		 * @description
		 * Users clicks on previous
		 */
		$scope.previousStep = function() {
			utilsService.safeLog('previousStep');
			var wizard = $scope.wizard;
			if (wizard.activeStep.id !== 1) {
				//this['validationStep' + this.activeStep.id].clear();
				// TODO: here we might have to call some other funciton that saves the data
				//this.dataService.save(function() {
					var prev = wizard.steps[wizard.activeStep.id - 2];
					if (prev.id < wizard.activeStep.id) {
						wizard.activeStep.isDone = false;
					}
					wizard.setActiveStep(prev);
				//});
			}
		};

		/**
		 * @method nextStep
		 * @description
		 * Users click on next
		 */
		$scope.nextStep = function() {
			utilsService.safeLog('nextStep');
			var wizard = $scope.wizard, currentStep = wizard.activeStep;
			// wizard.validateStep(currentStep).then(function(isValid) {
			// 	if (isValid) {
				// TODO: here we might have to call some other funciton that saves the data
				//this.dataService.save(function() {
					if (currentStep.id !== wizard.steps.length) {
						var next = wizard.steps[currentStep.id];
						if (next.id > currentStep.id) {
							if (currentStep.validateAction) {
								var validateResult = currentStep.validateAction();
								utilsService.safeLog(currentStep.title + ' validateResult: ' + validateResult);
								if (validateResult) {
									wizard.setActiveStep(next);
								} else {
									currentStep.hasError = true;
								}
							} else {
								currentStep.isDone = true;
								wizard.setActiveStep(next);
							}
						}
					} else {
						if (currentStep.validateAction) {
							alert('need to validate step');
						} else {
							currentStep.isDone = true;
							wizard.isComplete = true;
							//wizard.close();

							// create params model to send to API end point for custom report data 
							// clone angular model to avoid carrying over angular properties
							var jsonModel = angular.toJson($scope.model);
							var model = JSON.parse(jsonModel);

							configService.setParam('reportModel', model);
							///utilsService.safeLog('reportModel', model);

							//document.location = '#/report?a=1&reportType=custom&token=asd';
							var reportPath = '#/customReport?a=1&brand=[brand]&reportType=custom&reportId=[reportId]'
								.replace('[brand]', params.brand)
								.replace('[reportId]', params.reportId);
							utilsService.safeLog('reportPath', reportPath, true);
							document.location = reportPath;
						}
					}
				//});
			//	}
			//});
		};

		$scope.onCourseAdded = function() {
			$scope.model.courses = _.filter($scope.model.courses, function(c) {
				return c.id !== undefined;
			});
			//utilsService.safeLog('onCourseAdded', JSON.stringify($scope.model.courses));
		};

		/**
		 * @method finishStep
		 * @description
		 */
		$scope.finishStep = function finishStep() {
			this.nextStep();
		};
		
		/**
		 * @method clickOnStep
		 * @description
		 * Users click on a step directly
		 */
		$scope.clickOnStep = function clickOnStep(step) {
			// TODO: Do we save data?
			//this.dataService.save(function() {
				$scope.wizard.setActiveStep(step);
			//});
		};

		/**
		 * @method backToStepById
		 * @description
		 * Users click on a step directly
		 */
		$scope.backToStepById = function backToStepById(id) {
			utilsService.safeLog('backToStepById', id);
			var step = _.find($scope.wizard.steps, function(item) {
				return item.id === id;
			});

			if (step) {
				// TODO:  Do we save data?
				//this.dataService.save(function() {
					$scope.wizard.setActiveStep(step);
				//});
			}
		};

		/**
		 * @method clickOnStep
		 * @description
		 * Users click on a step directly
		 */
		$scope.navigationAction = function navigationAction(item) {
			utilsService.safeLog('navigationAction');
			item.action();
		};

		// add steps items
		$scope.wizard.addSteps([{
			id: 1, 
			title: 'Step 1', 
			path: 'views/customReportWizard/step1.html', 
			isFirst: true, 
			isLast: false, 
			isCurrent: true,
			validateAction: function validateStep1() {
				this.hasError =  $scope.model.stores.filter(function(store) {
					return store.selected;
				}).length < 1;
				this.errorMsg = this.hasError ? 'Please select at least on PC before proceeding' : undefined;
				this.isDone = !this.hasError;
				utilsService.safeLog('validateStep1 this.hasError ' + this.hasError);
				return this.hasError === false;
			}
		}, {
			id: 2, 
			title: 'Step 2', 
			path: 'views/customReportWizard/step2.html', 
			isFirst: false, 
			isLast: false, 
			isCurrent: false,
			validateAction: function validateStep2() {
				if ($scope.model.hired.otherField) {
					var otherFieldValue = $scope.model[$scope.model.hired.otherField];
					this.hasError = otherFieldValue === undefined;
					this.errorMsg = this.hasError ? 'Please select a date for Hired After Selected Date' : undefined;
				} else {
					this.hasError = false;
				}
				this.isDone = !this.hasError;
				utilsService.safeLog('validateStep2 this.hasError ' + this.hasError);
				return this.hasError === false;
			}
		}, {
			id: 3, 
			title: 'Step 3', 
			path: 'views/customReportWizard/step3.html', 
			isFirst: false, 
			isLast: false, 
			isCurrent: false,
			validateAction: function validateStep3() {
				if ($scope.model.entireLearningPath === false) {
					// this.hasError =  $scope.model.courses.filter(function(course) {
					// 	return course.selected;
					// }).length < 1;
					this.hasError =  $scope.model.courses.length < 1;
					this.errorMsg = this.hasError ? 'Please select at least one Course before proceeding' : undefined;
				} else {
					this.hasError = false;
				}
				this.isDone = !this.hasError;
				utilsService.safeLog('validateStep3 this.hasError ' + this.hasError);
				return this.hasError === false;
			}
		}, {
			id: 4, 
			title: 'Step 4', 
			path: 'views/customReportWizard/step4.html', 
			isFirst: false, 
			isLast: true, 
			isCurrent: false
		}]);

		// add navigation items
		$scope.wizard.addNavigationItems([{
			id: 1, 
			key: 'prev', 
			title: 'Previous', 
			isActive: false, 
			additionalCss: 'left',
			action: $scope.previousStep.bind($scope)
		}, {
			id: 2, 
			key: 'next', 
			title: 'Next', 
			isActive: true, 
			additionalCss: 'right',
			action: $scope.nextStep.bind($scope)
		}, {
			id: 3, 
			key: 'finish', 
			title: 'Run Report', 
			isActive: false, 
			additionalCss: 'right',
			action: $scope.finishStep.bind($scope)
		}/*, {
			id: 4, 
			key: 'cancel', 
			title: 'Close', 
			isActive: true, 
			additionalCss: 'right',
			action: $scope.cancel.bind($scope)
		}*/]);

		$scope.wizard.start();

		utilsService.safeLog('navigationItems', $scope.wizard.navigationItems);

		Object.defineProperty($scope, 'showHiredAfterDateinput', {
			get: function() {
				return $scope.model.hired.otherField === 'hiredAfter';
			}
		});

		//$scope.showHiredAfterDateinput = false;
		//$scope.hiredChanged = function(option) {
			//utilsService.safeLog('hiredChanged', option);
			//$scope.showHiredAfterDateinput = (option.otherField);
		//};

		// Step 1: Select PCs
		var areAllStoreSelected = function() {
			return $scope.model.stores.every(function(item) {
				return item.selected === true;
			});
		};

		var areSomeStoreSelected = function() {
			return !areAllStoreSelected() && $scope.model.stores.some(function(item) {
				return item.selected === true;
			});
		};

		$scope.allStoresChecked = false;

		Object.defineProperty($scope, 'allStoresCheckedState', {
			get: function() {
				return areAllStoreSelected() ? true : areSomeStoreSelected() ? undefined : false;
			}
		});

		// Step 2 of wizard: Select Learners
$scope.hiredAfterDatepickerPopup = {
	opened: false
};
$scope.datePickerOptions = {
    dateDisabled: false,
    formatYear: 'yyyy',
	initDate: new Date(),
    maxDate: new Date(),
	minDate: new Date(1945, 1, 1),
    startingDay: 0,
	showWeeks: false
};


		// courses
		$scope.noCoursesFound = false;
		$scope.loadingCourses = false;
		$scope.coursesTypeaheadOptions = {
			debounce: {
				default: 500,
				blur: 250
			},
			getterSetter: true
		};

		$scope.getCourses = function(str) {
			str = str.toLowerCase().trim();
			utilsService.safeLog('getCourses', str);

			// // return $http.get('//api/path/to/courses', {
			// // 	params: {
			// // 		searchString: str
			// // 	}
			// // 	}).then(function(response){
			// // 		return response.data.results.map(function(item){
			// // 			return item.formatted_address;
			// // 		});
			// // 	});

			// var _temp = '123456789'.split('').map(function(i) {
			// 	return {
			// 		id: i,
			// 		name: 'Course ' + i
			// 	};
			// });
			// return _temp.filter(function(course) {
			// 	return str.length === 0 || course.name.toLowerCase().indexOf(str) > -1;
			// });


			var filtered =  $scope.lookupCourses.filter(function(course) {
				return str.length === 0 || course.name.toLowerCase().indexOf(str) > -1;
			});

			//utilsService.safeLog('filtered', filtered);

			return filtered;
		};

		$scope.onEntireLearningPathClick = function() {
			console.log('onEntireLearningPathClick', $scope.model.entireLearningPath);
			if ($scope.model.entireLearningPath) {
				$scope.model.courses = $scope.lookupCourses;
			} else {
				$scope.model.courses = [];
			}
		};

/* begin: modal confirm code */
$scope.modalConfirm = {
	open: function (modalConfirmStrategy) {
		var modalInstance = $uibModal.open({
			animation: false,
			component: 'modalConfirmComponent',
			resolve: {
				data: function () {
					utilsService.safeLog('Modal resolve: pass modalConfirmStrategy', modalConfirmStrategy);
					return modalConfirmStrategy;
				}
			}
		});

		modalInstance.result.then(function (data) {
			utilsService.safeLog('Modal result', data);
			
			// TODO: 
			modalConfirmStrategy.okAction && modalConfirmStrategy.okAction();

		}, function () {
			utilsService.safeLog('Modal dismissed');
		});
	}
};

var modalConfirmStrategies = {
	openOtherReport: {
		title: 'Are you sure?', 
		message: 'Opening a saved report will clear your current settings and filters.',
		cancelCaption: 'Cancel',
		okCaption: 'Continue'
	},
	closeWizard: {
		title: 'Are you sure?', 
		message: 'Your current wizard selections haven’t been saved. Are you sure you want to exit the wizard?',
		cancelCaption: 'Cancel',
		okCaption: 'Close Wizard',
		okAction: function() {
			$location.path('#/');
		}
	},
	reportNameConflict: {
		title: 'Report Name Conflict',
		message: 'A saved report with that name already exists. Do you want to overwrite?',
		cancelCaption: 'Cancel',
		okCaption: 'Overwrite'
	}
};

$scope.modalConfirmOpen = function(w) {
	utilsService.safeLog('modalConfirmOpen', w);
	var strategy = modalConfirmStrategies[w];
	if (!strategy) {
		alert('Could not find strategy for modal confirm ' + w);
	} else {
		$scope.modalConfirm.open(strategy);
	}
};
/* end: modal confirm code */


		// get data
		var onDataError = function(err) {
			utilsService.safeLog('wizardController.onDataError', err);
			$scope.error = 'Could not fetch data';
		};

		var onDataComplete  = function(data) {
			utilsService.safeLog('wizardController.onDataComplete', data);
			$scope.data = data;
			$scope.model.stores = data.stores;
			$scope.lookupStores =  data.stores;
			$scope.lookupCourses =  data.courses;

			// if modifying a report, sync $scope.model with passed in params.reportModel
			if (params.reportModel) {
				
				_.each(params.reportModel.stores, function(source) {
					if (source.selected) {
						var store = _.find($scope.model.stores, function(dest) {
							return dest.id === source.id;
						});
						if (store) {
							store.selected = true;
						}
					}
				});
				
				_.each(params.reportModel.courses, function(source) {
					var course = _.find($scope.lookupCourses, function(dest) {
						return dest.id === source.id;
					});
					if (course) {
						$scope.model.courses.push(course);
					}
				});

				//params.reportModel.audienceId
				$scope.model.audience = _.find($scope.audienceOptions, function(option) {
					return option.id === params.reportModel.audience.id;
				});

				$scope.model.hired = _.find($scope.hiredOptions, function(option) {
					return option.id === params.reportModel.hired.id;
				});


				if (params.reportModel.hiredAfter) {
					$scope.model.hiredAfter = new Date(params.reportModel.hiredAfter);
				}

				$scope.model.entireLearningPath = params.reportModel.entireLearningPath;
			}

			$scope.originalModel = JSON.parse(angular.toJson($scope.model));

			//utilsService.safeLog('$scope.model', $scope.model);
		};

		// helper to get the data
		var getData = function(w) {
			utilsService.safeLog('getData');

			if (w === 'live') {
				// var _apiBaseUrl = 'https://dunk-dev.tribridge-amplifyhr.com';
				// var _endPoints = [{
				// 	key: 'segments',
				// 	propertyOnData: 'learning_path_items',
				// 	path: _apiBaseUrl + '/curricula_player/api/v1/path/15/?format=json&user=[user]'
				// 		.replace('[user]', params.token)
				// }, {
				// 	key: 'stores',
				// 	propertyOnData: 'results',
				// 	path: 'data/luca-stores.json?' + Math.random()
				// }];

				var _endPoints = [{
					key: 'courses',  /* lo-list lookup */
					propertyOnData: undefined, // TODO: propertyOnData: 'results': backend should wrap items array into results like for other APIs
					path: configService.apiEndPoints.losList()
				}, {
					key: 'stores', /* stores-list lookup */
					propertyOnData: 'results',
					path: configService.apiEndPoints.storesList(sessionParams.token)
				}];

				console.log('_endPoints', _endPoints);// force loggin all the time by passing true as 3rd param
				
				var _endPointsData = {}, _endPointCount = 0;
				var onEndPointComplete = function(endPoint, data) {
					if (endPoint.propertyOnData) {
						_endPointsData[endPoint.key] = data[endPoint.propertyOnData];
					} else {
						_endPointsData[endPoint.key] = data;
					}
					
					if (++_endPointCount === _endPoints.length) {
						utilsService.safeLog('_endPointsData', _endPointsData);
						onDataComplete(_endPointsData);
					}
				};

				utilsService.fastLoop(_endPoints, function(endPoint) {
					dataService.getData(endPoint.path)
						.then(function(data) {
							onEndPointComplete(endPoint, data);
						}, onDataError);
				});
			} else {
				
				var fileName = 'data/custom-report-wizard-lookups.json?' + Math.random();

				utilsService.safeLog('fileName', fileName);
				dataService.getData(fileName)
					.then(onDataComplete, onDataError);
			}
		};

		// invoke getData
		getData('live'); // or 'live'
	};

}());
