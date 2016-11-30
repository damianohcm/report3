(function() {
    /**
     * @service configService
     * Use this to set config values 
     */
	var configService = function() {

        var config = {
            common: {
                // any config that is not specific to a single brand should go here,
                totCompletionTitlePrefix: 'Tot Completion % for ',
                apiBaseUrl: 'https://dunk-stg.tribridge-amplifyhr.com',
                apiPaths: {
                    reportSegments: '/api/curricula_report/v1/segments-list/[path_id]/?user=[user]', //&companyKey=[companyKey]',
                    reportStores: '/api/curricula_report/v1/stores/?lpath_id=[path_id]&user=[user]', //&companyKey=[companyKey]',
                    customReportStoresList: '/api/curricula_report/v1/stores-list/?user=[user]',
                    customReportLOSList: '/api/curricula_report/v1/lo-list/',
                    customReport: '/api/curricula_report/v1/custom-report/?user=[user]',
                    customReportList: '/api/curricula_report/v1/custom-report-list/?user=[user]',
                    customReportData: '/api/curricula_report/v1/custom-report-data/?user=[user]',
                },
                params: {
                    // these will contain query string params that we keep passing around
                    // and will be set in angular.run, instead of saving them on $rootScope or $scope
                    brand: '',
                    reportType: '',
                    reportId: '',
                    reportModel: ''
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
                logEnabled: false /* if true, utilsService.safeLog will output message to the console.log (also dependends on window.logEnabled) */
            },
            brands: [
                {
                    key: 'br',
                    title: 'Baskin-Robbins',
                    reportStrategies: {
                        'learning-path': {
                            pathId: 6, //19,
                            title: 'Learning Path',
                            oneLevel: false
                        },
                        'new-and-trending': {
                            pathId: 5, //20,
                            title: 'New & Trending',
                            oneLevel: true
                        },
                        custom: {
                            pathId: -1,
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

        var enableLog = function() {
            config.common.logEnabled = true;
        };

        var getCommonConfig = function() {
            return config.common;
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

        var getCustomReportEndPoint = function(token) {
            var commonConfig = config.common;
            return commonConfig.apiBaseUrl 
                + commonConfig.apiPaths.customReport
                    .replace('[user]', token)
                + '?format=json';
        };

        var getCustomReportListEndPoint = function(token) {
            var commonConfig = config.common;
            return commonConfig.apiBaseUrl 
                + commonConfig.apiPaths.customReportList
                    .replace('[user]', token)
                + '?format=json';
        };

        var getCustomReportDataEndPoint = function(token) {
            var commonConfig = config.common;
            return commonConfig.apiBaseUrl 
                + commonConfig.apiPaths.customReportData
                    .replace('[user]', token)
                + '?format=json';
        };

        return {
            enableLog: enableLog,
			getCommonConfig: getCommonConfig,
            getBrands: getBrands,
            getBrandConfig: getBrandConfig,
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
                customReportData: getCustomReportDataEndPoint
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
