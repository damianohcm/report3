(function() {

    var utilsService, predicates, ddReportConfigStrategy, brReportConfigStrategy, 
		audienceOptions, hiredOptions, courseSelectionTypeOptions, segmentsFilterOptions, 
		paramsModel;

    // var paramsModel = function(args) {
	// 	// step 1
	// 	this.stores = args && args.stores || [],
	// 	// step 2:
	// 	this.audience = args && args.audience || audienceOptions[0],
	// 	this.hired = args && args.hired || hiredOptions[0],
	// 	this.hiredAfter = args ? args.hiredAfter : undefined,
	// 	// step 3
	// 	this.courseSelectionType = args && args.courseSelectionType || courseSelectionTypeOptions[0],
	// 	this.segmentsFilter = args && args.segmentsFilter || segmentsFilterOptions[0],
	// 	this.courses = args && args.courses || [],
	// 	this.segments = args && args.segments || [],
	// 	this.needsSave = args ? args.needsSave : false
	// };

	
	// var selectedStores = function selectedStores() {
	// 	return _.filter(paramsModel.stores, predicates.selected);
	// };

	// var selectedCourses = function selectedCourses() {
	// 	return _.filter(paramsModel.courses, predicates.selected);
	// };

	// var selectedSegments = function selectedSegments() {
	// 	return _.filter(paramsModel.segments, predicates.selected);
	// };


	var areAllStoreSelected = function areAllStoreSelected() {
		return paramsModel.stores.every(predicates.selected);
	};

	var areSomeStoreSelected = function areSomeStoreSelected() {
		return !areAllStoreSelected() && paramsModel.stores.some(predicates.selected);
	};

	var areAllSegmentsSelected = function areAllSegmentsSelected() {
		return paramsModel.segments.every(predicates.selected);
	};

	var areSomeSegmentsSelected = function areSomeSegmentsSelected() {
		return !areAllSegmentsSelected() && paramsModel.segments.some(predicates.selected);
	};

	var allStoresCheckedState = function allStoresCheckedState() {
		return areAllStoreSelected() ? true : areSomeStoreSelected() ? undefined : false;
	};

	var allSegmentsCheckedState = function allSegmentsCheckedState() {
		areAllSegmentsSelected() ? true : areSomeSegmentsSelected() ? undefined : false
	};

	var updateSelectedSegments = function updateSelectedSegments(model) {
		var selectedSegs = _.filter(model.segments, predicates.selected);

		var allLos = _(selectedSegs).chain()
			.pluck('los')
			.flatten()
			.value();

		_.each(model.courses, function (course) {
			course.selected = _.any(allLos, function(lo) {
				return lo.id === course.id;
			});
		});
	};

	var unselectStoreById = function unselectStoreById(model, id) {
		model.stores = _.filter(model.stores, function(item) {
			return item.id !== id;
		});

		model.needsSave = true;
	};

	var unselectCourseById = function unselectCourseById(model, id) {
		model.courses = _.filter(model.courses, function(item) {
			return item.id !== id;
		});

		model.needsSave = true;
	};

	var unselectSegmentById = function unselectSegmentById(model, id) {
		var segment = _.find(model.segments, function(item) {
			return item.id === id;
		});

		if (segment) {
			segment.selected = false;
			updateSelectedSegments(model);
		}

		model.needsSave = true;
	};

    var customReportParamsService = function(utils, configService) {
        utilsService = utils;
		predicates = utilsService.predicates;
		/* get learning-path strategy. We need lpath_id in case user select "Entire Learning Path" in step 3 */
		ddReportConfigStrategy = configService.getBrandConfig('dd').reportStrategies['learning-path'];
		brReportConfigStrategy = configService.getBrandConfig('br').reportStrategies['learning-path'];

		audienceOptions = [{
			id: 1,
			text: 'All Store Personnel'
		}, {
			id: 2,
			text: 'Only Management Personnel (Shift Leader, Restaurant Manager and ARL)'
		}];

		hiredOptions = [{
			id: 1,
			text: 'Since the beginning of time',
			otherField: undefined
		}, {
			id: 2,
			text: 'After selected date ',
			otherField: 'hiredAfter'
		}];

		courseSelectionTypeOptions = [{
			id: 1,
			text: 'Courses'
		}, {
			id: 2,
			text: 'Categories'
		}];

		segmentsFilterOptions = [{
			id: ddReportConfigStrategy.pathId,
			text: 'Dunkin only',
			icon: '../img/dd_logo_btn_sm.png'
		}, {
			id: brReportConfigStrategy.pathId,
			text: 'Baskin only',
			icon: '../img/br_logo_btn_sm.png'
		}, {
			id: -1,
			text: 'Dunkin and Baskin'
		}];

		paramsModel = {
			// step 1
			stores: [],
			// step 2:
			audience: audienceOptions[0],
			hired: hiredOptions[0],
			hiredAfter: undefined,
			// step 3
			courseSelectionType: courseSelectionTypeOptions[0],
			segmentsFilter: segmentsFilterOptions[0],
			courses: [],
			segments: [],
			needsSave: false
		}

        return {
            paramsModel: paramsModel,
			audienceOptions: audienceOptions,
			hiredOptions: hiredOptions,
			courseSelectionTypeOptions: courseSelectionTypeOptions,
			segmentsFilterOptions: segmentsFilterOptions,
			allStoresCheckedState: allStoresCheckedState,
			allSegmentsCheckedState: allSegmentsCheckedState,

			updateSelectedSegments: updateSelectedSegments,
			unselectStoreById: unselectStoreById,
			unselectCourseById: unselectCourseById,
			unselectSegmentById: unselectSegmentById
        };
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = customReportParamsService;
        }
        exports = customReportParamsService;
    } else {
        window.services = window.services || {};
        window.services.customReportParamsService = customReportParamsService;
    }

}());