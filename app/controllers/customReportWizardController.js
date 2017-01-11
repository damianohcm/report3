(function() {

	// create controller
	window.controllers = window.controllers || {};
  
	window.controllers.customReportWizardController = function($scope, $route, $routeParams, $location, $timeout, $filter, $uibModal, 
		utilsService, configService, dataService, customReportParamsService, wizardServiceFactory) {

		var predicates = utilsService.predicates,
			commonConfig = configService.getCommonConfig(),
			sessionParams = commonConfig.sessionParams,
		 	params = commonConfig.params,
			customReportWizardConfig = configService.getCustomReportWizardConfig(),
			/* get learning-path strategy. We need lpath_id in case user select "Entire Learning Path" in step 3 */
			ddReportConfigStrategy = configService.getBrandConfig('dd').reportStrategies['learning-path'],
			brReportConfigStrategy = configService.getBrandConfig('br').reportStrategies['learning-path']; 
		
		$scope.environment = configService.getEnvironment();
		
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
			if ($scope.paramsModel.needsSave || $scope.paramsModelIsDirty) {
				$scope.modalConfirmOpen('closeWizard');
			} else {
				backToReportingHome();
			}
		};

		$scope.goToSavedReports = function goToSavedReports() {
			$scope.currentBackAction = backToSavedReports;
			if ($scope.paramsModel.needsSave || $scope.paramsModelIsDirty) {
				$scope.modalConfirmOpen('closeWizard');
			} else {
				backToSavedReports();
			}
		};

		this.params = $routeParams;

		// model lookups 
		Object.defineProperty($scope, 'audienceOptions', {
			get: function() {
				return customReportParamsService.audienceOptions;
			}
		});
		Object.defineProperty($scope, 'hiredOptions', {
			get: function() {
				return customReportParamsService.hiredOptions;
			}
		});
		Object.defineProperty($scope, 'courseSelectionTypeOptions', {
			get: function() {
				return customReportParamsService.courseSelectionTypeOptions;
			}
		});
		Object.defineProperty($scope, 'segmentsFilterOptions', {
			get: function() {
				return customReportParamsService.segmentsFilterOptions;
			}
		});

		$scope.filterSegmentsByPathId = function(item) {
			return $scope.paramsModel.segmentsFilter.id === -1 ? true : item.pathId === $scope.paramsModel.segmentsFilter.id;
		};

		$scope.storeFilter = {
			text: ''
		};
		$scope.courseFilter = {
			text: ''
		};
		
		// model for wizard selections
		$scope.paramsModel = customReportParamsService.paramsModel;

		Object.defineProperty($scope, 'storesSortedBySelected', {
			get: function() {
				var query = (this.storeFilter && this.storeFilter.text || '').toLowerCase();
				var filtered = _.filter(this.paramsModel.stores, function(item) {
					return item.selected || item.name.toLowerCase().indexOf(query) > -1;
				});

				return _.sortBy(filtered, predicates.unselected);
			}
		});
		Object.defineProperty($scope, 'coursesSortedBySelected', {
			get: function() {
				var query = (this.courseFilter && this.courseFilter.text || '').toLowerCase();
				var filtered = _.filter(this.paramsModel.courses, function(item) {
					return item.selected || item.name.toLowerCase().indexOf(query) > -1;
				});

				return _.sortBy(filtered, predicates.unselected);
			}
		});
		Object.defineProperty($scope, 'segmentsSortedBySelected', {
			get: function() {
				return _.sortBy($scope.paramsModel.segments, predicates.unselected);
			}
		});

		// original model to keep track of changes
		var originalParamsModel = {};
		
		// property that calculates wheter the model has been changed by the user
		// and we need to present the user with confirm dialogs when she is navigating
		// away without saving etc.
		Object.defineProperty($scope, 'paramsModelIsDirty', {
			get: function() {
				var origModel = JSON.parse(JSON.stringify(originalParamsModel));
				var model = JSON.parse(JSON.stringify(customReportParamsService.paramsModel));
				return utilsService.areEqual(origModel, model) === false;
			}
		});

		// summary model for final step
		$scope.summary = {
		};
		Object.defineProperty($scope.summary, 'stores', {
			get: function() {
				return _.filter($scope.paramsModel.stores, predicates.selected);
			}
		});
		Object.defineProperty($scope.summary, 'learners', {
			get: function() {
				return $scope.paramsModel.audience.text;
			}
		});
		Object.defineProperty($scope.summary, 'hired', {
			get: function() {
				return $scope.paramsModel.hired.otherField 
					? undefined 
					: $scope.paramsModel.hired.text;
			}
		});
		Object.defineProperty($scope.summary, 'hiredAfter', {
			get: function() {
				if ($scope.paramsModel.hiredAfter) {
					return $filter('date')($scope.paramsModel.hiredAfter, 'shortDate');
				} else {
					return 'Not Selected';
				}
			}
		});
		Object.defineProperty($scope.summary, 'courses', {
			get: function() {
				return _.filter($scope.paramsModel.courses, predicates.selected);
			}
		});
		Object.defineProperty($scope.summary, 'segments', {
			get: function() {
				return _.filter(_.filter($scope.paramsModel.segments, $scope.filterSegmentsByPathid), predicates.selected);
			}
		});
		Object.defineProperty($scope.summary, 'entireLearningPath', {
			get: function() {
				if ($scope.paramsModel.segments.every(predicates.selected)) {
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

			if (wizard.activeStep.id === 1) {
				$timeout(function(){
					$('#storeFilter').focus();
				}, 125);
			}
			if (wizard.activeStep.id === 3) {
				$timeout(function(){
					$('#courseFilter').focus();
				}, 125);
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

							if (wizard.activeStep.id === 3) {
								$timeout(function(){
									$('#courseFilter').focus();
								}, 125);
							}

							if (wizard.activeStep.id > 1) {
								$scope.storeFilter.text = '';
							}
							if (wizard.activeStep.id > 3) {
								$scope.courseFilter.text = '';
							}
						}
					} else {
						if (currentStep.validateAction) {
							alert('need to validate step');
						} else {
							currentStep.isDone = true;
							wizard.isComplete = true;
							//wizard.close();

							if ($scope.paramsModelIsDirty) {
								$scope.paramsModel.needsSave = true;
							}

							// create params model to send to API end point for custom report data 
							// clone angular model to avoid carrying over angular properties
							var jsonModel = angular.toJson($scope.paramsModel);
							var paramsClone = JSON.parse(jsonModel);

							paramsClone.stores = _.filter(paramsClone.stores, predicates.selected);
							paramsClone.segments = _.filter(_.filter(paramsClone.segments, $scope.filterSegmentsByPathId), predicates.selected);

							// if selection type is 2, get the courseIds from the segments selected
							if (paramsClone.courseSelectionTypeId === 2) {
								paramsClone.courses = [];
								_.each(paramsClone.segments, function(item) {
									return _.each(item.los, function(lo) {
										paramsClone.courses.push(lo);
									});
								});
							} else {
								paramsClone.courses = _.filter(paramsClone.courses, predicates.selected);
							}

							configService.setParam('reportParamsModel', paramsClone);
							///utilsService.safeLog('reportParamsModel', paramsClone);

							// changes to the following code here will have to be replicated also in savedReportController
							var reportPath = '#/customReport?a=1&brand=[brand]&reportType=custom&reportId=[reportId]'
								.replace('[brand]', params.brand)
								.replace('[reportId]', params.reportId);
							//utilsService.safeLog('reportPath', reportPath, true);
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
				var numberOfStores =  _.filter($scope.paramsModel.stores, predicates.selected).length;

				this.hasError =  false;
				this.errorMsg = '';

				if (numberOfStores < 1) {
					this.hasError =  true;
					this.errorMsg = 'Please select at least one PC';
				}

				if (numberOfStores > customReportWizardConfig.maxStores) {
					if (customReportWizardConfig.maxStoresLimitType === 1) {
						this.hasError =  true;
						this.errorMsg = 'Please select [max] PCs or less'.replace('[max]', customReportWizardConfig.maxStores);
					} else {
						this.hasError =  false;
						this.errorMsg = 'We noticed you have a large number of PCs selected. Generating this view will take some time. In order for the view to present more quickly, you may wish to select [max] PCs or less'
							.replace('[max]', customReportWizardConfig.maxStores);
					}
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
				if ($scope.paramsModel.hired.otherField) {
					var otherFieldValue = $scope.paramsModel[$scope.paramsModel.hired.otherField];
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

				if ($scope.paramsModel.courseSelectionType.id === 1) {
					var numberOfCourses =  _.filter($scope.paramsModel.courses, predicates.selected).length;

					this.hasError =  numberOfCourses < 1;
					this.errorMsg = this.hasError ? 'Please select at least one Course' : undefined;

					var maxCourses = $scope.paramsModel.courseSelectionType.id === 1 
						? customReportWizardConfig.maxCourses
						: 10000;

					if (numberOfCourses > maxCourses) {
						if (customReportWizardConfig.maxCoursesLimitType === 1) {
							this.hasError =  true;
							this.errorMsg = 'Please select [max] Courses or less'.replace('[max]', maxCourses);
						} else {
							this.hasError =  false;
							this.errorMsg = 'We noticed you have a large number of Courses selected. Generating this view will take some time. In order for the view to present more quickly, you may wish to limit the number of Courses selected to [max] or less'
								.replace('[max]', maxCourses);
						}
					}
				} else {
					var numberOfSegments =  _.filter($scope.paramsModel.segments, predicates.selected).length;
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
				return $scope.paramsModel.hired.otherField === 'hiredAfter';
			}
		});

		//$scope.showHiredAfterDateinput = false;
		//$scope.hiredChanged = function(option) {
			//utilsService.safeLog('hiredChanged', option);
			//$scope.showHiredAfterDateinput = (option.otherField);
		//};

		// Step 1: Select PCs
		Object.defineProperty($scope, 'allStoresCheckedState', {
			get: function() {
				$scope.wizard.activeStep.validateAction();
				return customReportParamsService.allStoresCheckedState();
			}
		});

		$scope.allStoresChecked = customReportParamsService.allStoresCheckedState();

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

		$scope.onCategoryFilterChanged = function() {
			_.each($scope.paramsModel.segments, predicates.setSelectedFalse);
		};

		Object.defineProperty($scope, 'allSegmentsCheckedState', {
			get: function() {
				$scope.wizard.activeStep.validateAction && $scope.wizard.activeStep.validateAction();
				return customReportParamsService.allSegmentsCheckedState();
			}
		});

		$scope.allSegmentsChecked = customReportParamsService.allSegmentsCheckedState();

		$scope.onCourseSelectionTypeChanged = function() {
			//utilsService.safeLog('onCourseSelectionTypeChanged');

			$scope.courseFilter.text = '';

			if ($scope.paramsModel.courseSelectionType.id === 1) {
				$timeout(function(){
					$('#courseFilter').focus();
				}, 125);
			}

			$scope.wizard.activeStep.validateAction && $scope.wizard.activeStep.validateAction();

			var predicate =  predicates.setSelectedFalse;
			var collection = $scope.paramsModel.courseSelectionType.id === 2 
				? $scope.paramsModel.segments 
				: $scope.paramsModel.courses;
			_.each(collection, predicate);
		};

		$scope.onCourseSelectedChange = function() {
			$timeout(function() {
				$('#courseFilter').focus();
				$scope.courseFilter.text = '';
				$scope.wizard.activeStep.validateAction();
			}, 50);
		};

		$scope.onStoreSelectedChange = function() {
			$timeout(function() {
				$scope.storeFilter.text = '';
				$('#storeFilter').focus();
			}, 50);
		};

		$scope.onSegmentSelectedChange = function() {
			if ($scope.paramsModel.courseSelectionType.id === 2) {
				//utilsService.safeLog('onSegmentSelectedChange');

				var selectedSegs = _.filter($scope.paramsModel.segments, predicates.selected);

				var allLos = _(selectedSegs).chain()
					.pluck('los')
					.flatten()
					.value();

				_.each($scope.paramsModel.courses, function (course) {
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
			data.segments_dd = dataService.fixSegmentsListAPIData(data.segments_dd, data.ddPathId);
			data.segments_br = dataService.fixSegmentsListAPIData(data.segments_br, data.brPathId);
			data.segments = data.segments_dd.concat(data.segments_br);

			$scope.data = data;
			$scope.paramsModel.stores = data.stores;
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
			$scope.paramsModel.courses = $scope.lookupCourses;

			const segmIconStrategy = {};
			segmIconStrategy[data.ddPathId] = '../img/dd_logo_btn_sm.png';
			segmIconStrategy[data.brPathId] = '../img/br_logo_btn_sm.png';

			$scope.lookupSegments =  _.map(data.segments, function(item) {
				var name = (item.name || '').trim();
				return {
					id: item.id,
					pathId: item.pathId,
					icon: segmIconStrategy[item.pathId],
					name: name,
					selected: false,
					truncName: (name.length > nameMaxLen ? name.substring(0, nameMaxLen).trim() + ' ...' : name),
					los: item.los
				};
			});
			$scope.paramsModel.segments = $scope.lookupSegments;

			// if modifying a report, sync $scope.paramsModel with passed in params.reportParamsModel
			if (params.reportParamsModel) {
				$scope.paramsModel.needsSave = params.reportParamsModel.needsSave;
				$scope.paramsModel.reportName = params.reportParamsModel.reportName;
				$scope.wizardTitle = 'Edit: ' + params.reportParamsModel.reportName;
				
				_.each(params.reportParamsModel.stores, function(source) {
					if (source.selected) {
						var store = _.find($scope.paramsModel.stores, function(dest) {
							return dest.id === source.id;
						});
						if (store) {
							store.selected = true;
						}
					}
				});
				
				_.each(params.reportParamsModel.courses, function(source) {
					if (source.selected) {
						var course = _.find($scope.paramsModel.courses, function(dest) {
							return dest.id === source.id;
						});
						if (course) {
							course.selected = true;
						}
					}
				});
				
				_.each(params.reportParamsModel.segments, function(source) {
					if (source.selected) {
						var segm = _.find($scope.paramsModel.segments, function(dest) {
							return dest.id === source.id;
						});
						if (segm) {
							segm.selected = true;
						}
					}
				});

				$scope.paramsModel.audience = _.find($scope.audienceOptions, function(option) {
					return option.id === params.reportParamsModel.audience.id;
				});

				$scope.paramsModel.hired = _.find($scope.hiredOptions, function(option) {
					return option.id === params.reportParamsModel.hired.id;
				});
				if (params.reportParamsModel.hiredAfter) {
					$scope.paramsModel.hiredAfter = new Date(params.reportParamsModel.hiredAfter);
				}

				if (params.reportParamsModel.courseSelectionType) {
					$scope.paramsModel.courseSelectionType = _.find($scope.courseSelectionTypeOptions, function(option) {
						return option.id === params.reportParamsModel.courseSelectionType.id;
					});
				} else {
					params.reportParamsModel.courseSelectionType = $scope.courseSelectionTypeOptions[0];
				}

				if (params.reportParamsModel.segmentsFilter) {
					$scope.paramsModel.segmentsFilter = _.find($scope.segmentsFilterOptions, function(option) {
						return option.id === params.reportParamsModel.segmentsFilter.id;
					});
				} else {
					$scope.paramsModel.segmentsFilter = $scope.segmentsFilterOptions[0];
				}

				
			} else {
				$scope.wizardTitle = customReportWizardConfig.wizardTitle;
			}

			originalParamsModel = JSON.parse(angular.toJson($scope.paramsModel));

			//utilsService.safeLog('$scope.paramsModel', $scope.paramsModel);
		};

		// helper to get the data
		var getData = function(w) {
			utilsService.safeLog('getData');

			// we need segments for both brands here
			var _endPoints = [{
				key: 'stores', /* stores-list lookup */
				propertyOnData: 'results',
				path: configService.apiEndPoints.storesList(sessionParams.token)
			}, {
				key: 'courses',  /* lo-list lookup */
				propertyOnData: undefined, // TODO: propertyOnData: 'results': backend should wrap items array into results like for other APIs
				path: configService.apiEndPoints.losList()
			}, {
				key: 'segments_dd',
				propertyOnData: 'learning_path_items',
				path: configService.apiEndPoints.segments(ddReportConfigStrategy.pathId, sessionParams.token)
			}, {
				key: 'segments_br',
				propertyOnData: 'learning_path_items',
				path: configService.apiEndPoints.segments(brReportConfigStrategy.pathId, sessionParams.token)
			}];

			// if testing, use local json files
			if (w === 'test') {
				_endPoints[0].path = 'data/custom-report-wizard-stores.json?' + Math.random();
				_endPoints[1].path = 'data/custom-report-wizard-courses.json?' + Math.random();
				_endPoints[2].path = 'data/custom-report-wizard-segments[pathId].json?'.replace('[pathId]', ddReportConfigStrategy.pathId) + Math.random();
				_endPoints[3].path = 'data/custom-report-wizard-segments[pathId].json?'.replace('[pathId]', brReportConfigStrategy.pathId) + Math.random();
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
					_endPointsData.ddPathId = ddReportConfigStrategy.pathId;
					_endPointsData.brPathId = brReportConfigStrategy.pathId;

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
