(function() {

	// create controller
	window.controllers = window.controllers || {};
  
	window.controllers.customReportWizardController = function($scope, $route, $routeParams, $location, $timeout, $filter, $uibModal, 
		utilsService, configService, dataService, wizardServiceFactory) {

		var predicates = utilsService.predicates,
			commonConfig = configService.getCommonConfig(),
			sessionParams = commonConfig.sessionParams,
		 	params = commonConfig.params,
			customReportWizardConfig = configService.getCustomReportWizardConfig(),
			brandConfig = configService.getBrandConfig(params.brand),
			reportStrategies = brandConfig.reportStrategies,
			/* get learning-path strategy. We need lpath_id in case user select "Entire Learning Path" in step 3 */
			reportConfigStrategy = reportStrategies['learning-path']; 
		
		Object.defineProperty($scope, 'tokenError', {
			get: function() {
				return (sessionParams.token || '').length === 0 ? 'Invalid token or missing token' : '';
			}
		});

		var backToReportingHome = function backToReportingHome() {
			// reset reportId param so that it starts clear next time
			configService.setParam('reportId', -1);
			
			var path = '[csBaseUrl]&organization=[organization]&brand=[brand]'
				.replace('[csBaseUrl]', sessionParams.csBaseUrl)
				.replace('[organization]', sessionParams.organization)
				.replace('[brand]', params.brand);
			window.parent.location = path;
		};

		var backToSavedReports = function backToSavedReports() {
			// reset reportId param so that it starts clear next time
			configService.setParam('reportId', -1);

			var path = '#/savedReports?brand=[brand]'
				.replace('[brand]', params.brand);
			window.location = path;
		};

		$scope.goHome = function goHome() {
			//this.hide();
			// TODO: need to prompt user for confirmation in case there are pending changes
			$scope.currentBackAction = backToReportingHome;
			if ($scope.modelIsDirty || $scope.model.needsSave) {
				$scope.modalConfirmOpen('closeWizard');
			} else {
				backToReportingHome();
			}
		};

		$scope.goToSavedReports = function goToSavedReports() {
			$scope.currentBackAction = backToSavedReports;
			if ($scope.modelIsDirty || $scope.model.needsSave) {
				$scope.modalConfirmOpen('closeWizard');
			} else {
				backToSavedReports();
			}
		};

		this.params = $routeParams;

		// model lookups 
		$scope.audienceOptions = [{
			id: 1,
			text: 'All Store Personnel'
		}, {
			id: 2,
			text: 'Only Management Personnel (Shift Leader, Restaurant Manager and ARL)'
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

		$scope.courseSelectionTypeOptions = [{
			id: 1,
			text: 'Courses'
		}, {
			id: 2,
			text: 'Categories'
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
			courseSelectionType: $scope.courseSelectionTypeOptions[0],
			courses: [],
			segments: [],
			needsSave: false
		};

		// original model to kee track of changes
		$scope.originalModel = {};

		$scope.storeQuery = '';
		$scope.courseQuery = '';
		
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
				return $scope.model.stores.filter(predicates.selected);
			}
		});
		Object.defineProperty($scope.summary, 'learners', {
			get: function() {
				return $scope.model.audience.text;
			}
		});
		Object.defineProperty($scope.summary, 'hired', {
			get: function() {
				return $scope.model.hired.otherField 
					? undefined 
					: $scope.model.hired.text;
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
		Object.defineProperty($scope.summary, 'courses', {
			get: function() {
				return $scope.model.courses.filter(function(item) {
					return item.selected;
				});
			}
		});
		Object.defineProperty($scope.summary, 'segments', {
			get: function() {
				return $scope.model.segments.filter(predicates.selected);
			}
		});
		Object.defineProperty($scope.summary, 'entireLearningPath', {
			get: function() {
				if ($scope.model.segments.every(predicates.selected)) {
					return 'Entire Learning Path';
				} else {
					return undefined;
				}
			}
		});

		// wizard setup
		$scope.wizard = wizardServiceFactory.getService();

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

							if ($scope.modelIsDirty) {
								$scope.model.needsSave = true;
							}

							// create params model to send to API end point for custom report data 
							// clone angular model to avoid carrying over angular properties
							var jsonModel = angular.toJson($scope.model);
							var model = JSON.parse(jsonModel);

							model.stores = _.filter(model.stores, predicates.selected);
							model.courses = _.filter(model.courses, predicates.selected);
							model.segments = _.filter(model.segments, predicates.selected);

							configService.setParam('reportModel', model);
							///utilsService.safeLog('reportModel', model);

							// changes to the following code here will have to be replicated also in savedReportController
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
		 * @method clickOnStep
		 * @description
		 * Users click on a step directly
		 */
		$scope.navigationAction = function navigationAction(item) {
			utilsService.safeLog('navigationAction');
			item.action();
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
				$scope.wizard.setActiveStep(step);
			}
		};

		$scope.onCourseAdded = function() {
			$scope.wizard.activeStep.validateAction();
		};
		$scope.onCourseRemoved = function() {
			$scope.wizard.activeStep.validateAction();
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
				var numberOfStores =  $scope.model.stores.filter(predicates.selected).length;

				this.hasError =  false;
				this.errorMsg = '';
				if (numberOfStores < 1) {
					this.hasError =  true;
					this.errorMsg = 'Please select at least one PC';
				}
				if (numberOfStores > customReportWizardConfig.maxStores) {
					this.hasError =  true;
					this.errorMsg = 'Please select [max] PCs or less'.replace('[max]', customReportWizardConfig.maxStores);
				}

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
				this.errorMsg = '';
				if ($scope.model.hired.otherField) {
					var otherFieldValue = $scope.model[$scope.model.hired.otherField];
					this.hasError = otherFieldValue === undefined;
					this.errorMsg = this.hasError ? 'Please select a date' : undefined;
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

				this.hasError = false;
				this.errorMsg = '';

				if ($scope.model.courseSelectionType.id === 1) {
					var numberOfCourses =  $scope.model.courses.filter(predicates.selected).length;

					this.hasError =  numberOfCourses < 1;
					this.errorMsg = this.hasError ? 'Please select at least one Course' : undefined;

					var maxCourses = $scope.model.courseSelectionType.id === 1 
						? customReportWizardConfig.maxCourses
						: 1000;

					if (numberOfCourses > maxCourses) {
						this.hasError =  true;
						this.errorMsg = 'Please select [max] Courses or less'.replace('[max]', maxCourses);
					}
				} else {
					var numberOfSegments =  $scope.model.segments.filter(predicates.selected).length;
					this.hasError =  numberOfSegments < 1;
					this.errorMsg = this.hasError ? 'Please select at least one Category' : undefined;
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
			return $scope.model.stores.every(predicates.selected);
		};

		var areSomeStoreSelected = function() {
			return !areAllStoreSelected() && $scope.model.stores.some(predicates.selected);
		};

		Object.defineProperty($scope, 'allStoresCheckedState', {
			get: function() {
				$scope.wizard.activeStep.validateAction();
				return areAllStoreSelected() ? true : areSomeStoreSelected() ? undefined : false;
			}
		});

		$scope.allStoresChecked = areAllStoreSelected() ? true : areSomeStoreSelected() ? undefined : false;

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

		// Step 3: courses
		$scope.noCoursesFound = false;
		$scope.loadingCourses = false;

		// $scope.getCourses = function(str) {
		// 	str = str.toLowerCase().trim();
		// 	utilsService.safeLog('getCourses', str);

		// 	var filtered =  $scope.lookupCourses.filter(function(course) {
		// 		return str.length === 0 || course.name.toLowerCase().indexOf(str) > -1;
		// 	});

		// 	//utilsService.safeLog('filtered', filtered);

		// 	return filtered;
		// };

		var areAllSegmentsSelected = function() {
			return $scope.model.segments.every(predicates.selected);
		};

		var areSomeSegmentsSelected = function() {
			return !areAllSegmentsSelected() && $scope.model.segments.some(predicates.selected);
		};

		Object.defineProperty($scope, 'allSegmentsCheckedState', {
			get: function() {
				$scope.wizard.activeStep.validateAction && $scope.wizard.activeStep.validateAction();
				return areAllSegmentsSelected() ? true : areSomeSegmentsSelected() ? undefined : false;
			}
		});

		$scope.allSegmentsChecked = areAllSegmentsSelected() ? true : areSomeSegmentsSelected() ? undefined : false;

		$scope.onCourseSelectionTypeChanged = function() {
			//utilsService.safeLog('onCourseSelectionTypeChanged');

			$scope.wizard.activeStep.validateAction && $scope.wizard.activeStep.validateAction();

			var predicate =  predicates.setSelectedFalse;
			var collection = $scope.model.courseSelectionType.id === 2 
				? $scope.model.segments 
				: $scope.model.courses;
			_.each(collection, predicate);
		};

		$scope.onCourseSelectedChange = function() {
			$timeout(function() {
				$scope.wizard.activeStep.validateAction();
			}, 250);
		};

		$scope.onSegmentSelectedChange = function() {
			if ($scope.model.courseSelectionType.id === 2) {
				//utilsService.safeLog('onSegmentSelectedChange');

				var selectedSegs = _.filter($scope.model.segments, predicates.selected);

				var allLos = _(selectedSegs).chain()
					.pluck('los')
					.flatten()
					.value();

				_.each($scope.model.courses, function (course) {
					course.selected = _.any(allLos, function(lo) {
						return lo.id === course.id;
					});
				});

				$timeout(function() {
					$scope.wizard.activeStep.validateAction();
				}, 250);
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
			
			// invoke strategy action 
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
			$scope.currentBackAction();
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

			// fix segments data as the backend endpoint return inconsistent data
			data.segments = dataService.fixSegmentsListAPIData(data.segments);

			$scope.data = data;
			$scope.model.stores = data.stores;
			$scope.lookupStores =  data.stores;
			
			var nameMaxLen = 80;
			$scope.lookupCourses =  _.map(data.courses, function(item) {
				var name = (item.name || '').trim();
				return {
					id: item.id,
					name: name,
					selected: false,
					truncName: (name.length > nameMaxLen ? name.substring(0, nameMaxLen).trim() + ' ...' : name)
				};
			});
			$scope.model.courses = $scope.lookupCourses;

			$scope.lookupSegments =  _.map(data.segments, function(item) {
				var name = (item.name || '').trim();
				return {
					id: item.id,
					name: name,
					selected: false,
					truncName: (name.length > nameMaxLen ? name.substring(0, nameMaxLen).trim() + ' ...' : name),
					los: item.los
				};
			});
			$scope.model.segments = $scope.lookupSegments;

			// if modifying a report, sync $scope.model with passed in params.reportModel
			if (params.reportModel) {
				$scope.model.needsSave = params.reportModel.needsSave;
				$scope.model.reportName = params.reportModel.reportName;
				$scope.wizardTitle = 'Edit: ' + params.reportModel.reportName;
				
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
					if (source.selected) {
						var course = _.find($scope.model.courses, function(dest) {
							return dest.id === source.id;
						});
						if (course) {
							course.selected = true;
						}
					}
				});
				
				_.each(params.reportModel.segments, function(source) {
					if (source.selected) {
						var segm = _.find($scope.model.segments, function(dest) {
							return dest.id === source.id;
						});
						if (segm) {
							segm.selected = true;
						}
					}
				});

				$scope.model.audience = _.find($scope.audienceOptions, function(option) {
					return option.id === params.reportModel.audience.id;
				});

				$scope.model.hired = _.find($scope.hiredOptions, function(option) {
					return option.id === params.reportModel.hired.id;
				});
				if (params.reportModel.hiredAfter) {
					$scope.model.hiredAfter = new Date(params.reportModel.hiredAfter);
				}

				$scope.model.courseSelectionType = _.find($scope.courseSelectionTypeOptions, function(option) {
					return option.id === params.reportModel.courseSelectionType.id;
				});		
			} else {
				$scope.wizardTitle = customReportWizardConfig.wizardTitle;
			}

			$scope.originalModel = JSON.parse(angular.toJson($scope.model));

			//utilsService.safeLog('$scope.model', $scope.model);
		};

		// helper to get the data
		var getData = function(w) {
			utilsService.safeLog('getData');

			var _endPoints = [{
				key: 'courses',  /* lo-list lookup */
				propertyOnData: undefined, // TODO: propertyOnData: 'results': backend should wrap items array into results like for other APIs
				path: configService.apiEndPoints.losList()
			}, {
				key: 'segments',
				propertyOnData: 'learning_path_items',
				path: configService.apiEndPoints.segments(reportConfigStrategy.pathId, sessionParams.token)
			}, {
				key: 'stores', /* stores-list lookup */
				propertyOnData: 'results',
				path: configService.apiEndPoints.storesList(sessionParams.token)
			}];

			// if testing, use local json files
			if (w === 'test') {
				_endPoints[0].path = 'data/custom-report-wizard-courses.json?' + Math.random();
				_endPoints[1].path = 'data/custom-report-wizard-segments.json?' + Math.random();
				_endPoints[2].path = 'data/custom-report-wizard-stores.json?' + Math.random();
			}

			utilsService.safeLog('_endPoints', _endPoints);// force loggin all the time by passing true as 3rd param

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
		};

		// invoke getData
		if ($scope.tokenError.length > 0) {
		 	alert($scope.tokenError);
		} else {
			var what = customReportWizardConfig.useTestData ? 'test' : 'live';
			getData(what);
		}
	};

}());
