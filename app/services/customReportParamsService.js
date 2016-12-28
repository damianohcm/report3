(function() {

    var utilsService, predicates;

	var audienceOptions = [{
		id: 1,
		text: 'All Store Personnel'
	}, {
		id: 2,
		text: 'Only Management Personnel (Shift Leader, Restaurant Manager and ARL)'
	}];

	var hiredOptions = [{
		id: 1,
		text: 'Since the beginning of time',
		otherField: undefined
	}, {
		id: 2,
		text: 'After selected date ',
		otherField: 'hiredAfter'
	}];

	var courseSelectionTypeOptions = [{
		id: 1,
		text: 'Courses'
	}, {
		id: 2,
		text: 'Categories'
	}];

	var segmentsFilterOptions = [{
		id: -1,
		text: 'Dunkin and Baskin'
	}, {
		id: ddReportConfigStrategy.pathId,
		text: 'Dunkin only',
		icon: '../img/dd_logo_btn_sm.png'
	}, {
		id: brReportConfigStrategy.pathId,
		text: 'Baskin only',
		icon: '../img/br_logo_btn_sm.png'
	}];

    /**
     * @class model
     */
	var model = function(args) {
		// step 1
		this.stores = args && args.stores || [],
		// step 2:
		this.audience = args && args.audience || audienceOptions[0],
		this.hired = args && args.hired || hiredOptions[0],
		this.hiredAfter = args ? args.hiredAfter : undefined,
		// step 3
		this.courseSelectionType = args && args.courseSelectionType || courseSelectionTypeOptions[0],
		this.segmentsFilter = args && args.segmentsFilter || segmentsFilterOptions[0],
		this.courses = args && args.courses || [],
		this.segments = args && args.segments || [],
		this.needsSave = args ? args.needsSave : false
	};

	
	var selectedStores = function selectedStores() {
		return _.filter(this.stores, predicates.selected);
	}.bind(model);

	var selectedCourses = function selectedCourses() {
		return _.filter(this.courses, predicates.selected);
	}.bind(model);

	var selectedSegments = function selectedSegments() {
		return _.filter(this.segments, predicates.selected);
	}.bind(model);


	var areAllStoreSelected = function areAllStoreSelected() {
		return this.stores.every(predicates.selected);
	}.bind(model);

	var areSomeStoreSelected = function areSomeStoreSelected() {
		return !areAllStoreSelected() && this.stores.some(predicates.selected);
	}.bind(model);

	var areAllSegmentsSelected = function areAllSegmentsSelected() {
		return this.segments.every(predicates.selected);
	}.bind(model);

	var areSomeSegmentsSelected = function areSomeSegmentsSelected() {
		return !areAllSegmentsSelected() && this.segments.some(predicates.selected);
	}.bind(model);

	var allStoresCheckedState = function allStoresCheckedState() {
		return areAllStoreSelected() ? true : areSomeStoreSelected() ? undefined : false;
	}.bind(model);

	var allSegmentsCheckedState = function allSegmentsCheckedState() {
		areAllSegmentsSelected() ? true : areSomeSegmentsSelected() ? undefined : false
	}.bind(model);

	var getParamsmodel = function(args) {
        return new model(args);
    };

    var customReportParamsService = function(utils) {
        utilsService = utils;
		predicates = utilsService.predicates;
        return {
            getParamsmodel: getParamsmodel,
			audienceOptions: audienceOptions,
			hiredOptions: hiredOptions,
			courseSelectionTypeOptions: courseSelectionTypeOptions,
			segmentsFilterOptions: segmentsFilterOptions,
			allStoresCheckedState: allStoresCheckedState,
			allSegmentsCheckedState: allSegmentsCheckedState
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