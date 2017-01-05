(function() {
    /**
     * @service configService
     * Use this to set config values 
     */
	var configService = function() {

        // set this to true for local development so it will load data from local json files
        var _useTestData = false;

        // set environment based on where you deploy the code. 
        // Can be 'staging' or 'production'
        var _environment = 'staging';

        var apiBaseUrlStrategy = {
            staging: 'https://dunk-stg.tribridge-amplifyhr.com',
            production: 'https://dunk.tribridge-amplifyhr.com'
        };

        var config = {
            common: {
                // any config that is not specific to a single brand should go here,
                totCompletionTitlePrefix: 'Tot Completion % for ',
                apiBaseUrl: apiBaseUrlStrategy[_environment],
                apiPaths: {
                    reportSegments: '/api/curricula_report/v1/segments-list/[path_id]/?user=[user]',
                    reportStores: '/api/curricula_report/v1/stores/?lpath_id=[path_id]&user=[user]',
                    customReportStoresList: '/api/curricula_report/v1/stores-list/?user=[user]',
                    customReportLOSList: '/api/curricula_report/v1/lo-list/',
                    customReport:     '/api/curricula_report/v1/report/',
                    customReportList: '/api/curricula_report/v1/report/?user=[user]',
                    customReportStores: '/api/curricula_report/v1/report-data/',
                },
                params: {
                    // these will contain query string params that we keep passing around
                    // and will be set in angular.run, instead of saving them on $rootScope or $scope
                    brand: '',
                    reportType: '',
                    reportId: '',
                    reportParamsModel: ''
                },
                sessionParams: {
                    // these will contain session params set only once from query string the first time the / path is called
                    // and will be set in angular.run, instead of saving them on $rootScope or $scope
                    token: '',
                    compKey: '',
                    csBaseUrl: '',
                    lang: '',
                    organization: ''
                },
                logEnabled: false, /* if true, utilsService.safeLog will output message to the console.log */
                // map store people lo id to lookup
                // this is because the backend does not return which parent Segment id the person LOs belong to
                // also determine if all people org_quid are the same
                peopleOrgStrategy: {
                    74: 'br', //Baskin-Robbins
                    75: 'dd', // Dunkin' Donuts
                    76: 'ddbr' //Dunkin' Donuts/Baskin-Robbins Combo
                }
            },
            brands: [ /* lookup strategies based on brand by brand key (i.e. br or dd) */
                {
                    key: 'br',
                    title: 'Baskin-Robbins', /* brand displayed text */
                    reportStrategies: {
                        'learning-path': { /* learning path report information */
                            pathId: 6, //19, /* learning path id to use for this brand */
                            title: 'Learning Path', /* report name displayed on the report page */
                            oneLevel: false
                        },
                        'new-and-trending': {
                            pathId: 5, //20, /* learning path id to use for this brand */
                            title: 'New & Trending', /* report name displayed on the report page */
                            oneLevel: true
                        },
                        custom: {
                            pathId: -1, /* for custom report, we just ignore this */
                            title: 'Custom',
                            oneLevel: false
                        }
                    }
                }, {
                    key: 'dd',
                    title: 'Dunkin Donuts',
                    reportStrategies: {
                        'learning-path': {
                            pathId: 1, //15,
                            title: 'Learning Path',
                            oneLevel: false
                        },
                        'new-and-trending': {
                            pathId: 4, //18,
                            title: 'New & Trending',
                            oneLevel: true
                        },
                        custom: {
                            pathId: -1,
                            title: 'Custom',
                            oneLevel: false
                        }
                    }
                }
            ]
        };

        /* report config */
        var reportConfig = {
            useTestData: _useTestData, /* set to true to load static json data from app/data/ folder instead of using the live API endpoints */
            debug: false, /* true will output additional info in the cells to help identify the code in reportService that populates them */

            averageCalculationMode: 'los', /* 'segments' = Segments average; 'los' = Learning Objects Weighted Average */
            
            notApplicableLabel: '0% *', /* the label used when Learning Objects are Not Applicabile - they are missing from the person los arrays */
            notApplicableIncludeInCalc: true, /* whether to include the N/A columns in the average aggregated calculation for summary */
            colorPersonSegmentCell: false, /* use to drive the addition of css class "with-color" - Dunking does not want them colored but other customers might want it */
            
            colSummaryHeaderMaxLength: 85, /* max length of Summary column header (Tot Completion For ...) */
            colGroupHeaderMaxLength: 85, /* max length of group columns headers (Segments) */
            colChildheaderMaxLength: 75, /* max length of child columns headers (Learning objects) */
            rowGroupHeaderMaxLength: 27, /* max length of PC/store name */
            rowChildheaderMaxLength: 22, /* max length of Person name */

            displayPersonHireDate: false, /* currently for custom report only so setting false here and override in customReportConfig */

            useFixedWidthForCols: true,
            colCategoryWidth: '280px',
            colSummaryWidth: '120px',
            colSegmentWidth: '120px',

            showAdditionalLoadingMessageAfter: 30 /* seconds after which will show an additional loading message saying they might have a lot of stores and might take a few minutes to load */
        };

        /* custom report wizard config */
        var customReportWizardConfig = {
            useTestData: _useTestData, /* set to true to load static json data from app/data/ folder instead of using the live API endpoints */
            wizardTitle: 'Create a Report',
            maxStores: 25, /* max selection of PCs allowed in the custom report wizard or above which a warning is given to the user */
            maxStoresLimitType: 2, /* 1 means hard stop; 2 means only a warning will be displayed but user can still select more than maxStores value */
            maxCourses: 10, /* max selection of Courses allowed in the custom report wizard or above which a warning is given to the user */
            maxCoursesLimitType: 1 /* 1 means hard stop; 2 means only a warning will be displayed but user can still select more than maxCourses value */
        };

        /* custom report config */
        var customReportConfig = JSON.parse(JSON.stringify(reportConfig));
        customReportConfig.useTestData = _useTestData, /* set to true to load static json data from app/data/ folder instead of using the live API endpoints */
        customReportConfig.displayPersonHireDate = true; /* set to true to display the hire_date value next to the person title in the report */

        /* savedReportsConfig */
        var savedReportsConfig = {
            useTestData: _useTestData /* set to true to load static json data from app/data/ folder instead of using the live API endpoints */
        };

        var enableLog = function() {
            config.common.logEnabled = true;
        };

        var getCommonConfig = function() {
            return config.common;
        };

        var getReportConfig = function() {
		    return reportConfig;
	    };
        var getCustomReportWizardConfig = function() {
		    return customReportWizardConfig;
	    };
        var getCustomReportConfig = function () {
            return customReportConfig;
        };

        var getSavedReportsConfig = function () {
            return savedReportsConfig;
        };

        var getBrands = function() {
            return config.brands;
        };

        var getBrandConfig = function(key) {
            var brandConfig;
            for (var i = 0; i < config.brands.length; i++) {
                if (config.brands[i].key === key) {
                    brandConfig = config.brands[i];
                    break;
                }
            }
            return brandConfig || alert('homeConfig: could not find brand ' + key + ' in config');
        };

        var setParam = function(key, value) {
            if (Object.keys(config.common.params).indexOf(key) > -1) {
                config.common.params[key] = value;
            } else {
                console.log('configService.setParam: exception: unknown key', key);
                debugger;
            }
        };

        var setSessionParam = function(key, value) {
            if (Object.keys(config.common.sessionParams).indexOf(key) > -1) {
                config.common.sessionParams[key] = value;
            } else {
                console.log('configService.setSessionParam: exception: unknown key', key);
                debugger;
            }
        };

        var sessionParamsSet = false;

        /* api end points helpers */
        var getSegmentsEndPoint = function(pathId, token) {
            var commonConfig = config.common;
            return commonConfig.apiBaseUrl 
                + commonConfig.apiPaths.reportSegments
                    .replace('[path_id]', pathId)
                    .replace('[user]', token)
                + '&format=json';
        };

        var getStoresAndPeopleEndPoint = function(pathId, token) {
            var commonConfig = config.common;
            return commonConfig.apiBaseUrl 
                + commonConfig.apiPaths.reportStores
                    .replace('[path_id]', pathId)
                    .replace('[user]', token)
                + '&format=json';
        };

        var getStoresListEndPoint = function(token) {
            var commonConfig = config.common;
            return commonConfig.apiBaseUrl 
                + commonConfig.apiPaths.customReportStoresList
                    .replace('[user]', token)
                + '&format=json';
        };

        var getLOSListEndPoint = function() {
            var commonConfig = config.common;
            return commonConfig.apiBaseUrl 
                + commonConfig.apiPaths.customReportLOSList
                + '?format=json';
        };

        // end point to retrieve/create/modify a single custom report
        var getCustomReportEndPoint = function() {
            var commonConfig = config.common;
            var result = commonConfig.apiBaseUrl 
                + commonConfig.apiPaths.customReport;

            return result;
        };

        // end point to retrieve a list of custom reports for a specific user
        var getCustomReportListEndPoint = function(token) {
            var commonConfig = config.common;
            return commonConfig.apiBaseUrl 
                + commonConfig.apiPaths.customReportList
                    .replace('[user]', token)
                + '&format=json';
        };

        // end point to retrieve the custom report data 
        var getCustomReportStoresEndPoint = function(token) {
            var commonConfig = config.common;
            return commonConfig.apiBaseUrl 
                + commonConfig.apiPaths.customReportStores
                    .replace('[user]', token)
                + '?format=json';
        };

        return {
            enableLog: enableLog,
            getEnvironment: function () {
                return _environment;
            },
			getCommonConfig: getCommonConfig,
            getBrands: getBrands,
            getBrandConfig: getBrandConfig,
            getReportConfig: getReportConfig,
            getCustomReportWizardConfig: getCustomReportWizardConfig,
            getCustomReportConfig: getCustomReportConfig,
            getSavedReportsConfig: getSavedReportsConfig,
            setParam: setParam,
            setSessionParam: setSessionParam,
            sessionParamsSet: sessionParamsSet,

            apiEndPoints: {
                segments: getSegmentsEndPoint,
                storesAndPeople: getStoresAndPeopleEndPoint,
                storesList: getStoresListEndPoint,
                losList: getLOSListEndPoint,
                customReport: getCustomReportEndPoint,
                customReportList: getCustomReportListEndPoint,
                customReportStores: getCustomReportStoresEndPoint
            }
		};
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = configService;
        }
        exports = configService;
    } else {
        window.services = window.services || {};
        window.services.configService = configService;
    }

}());
