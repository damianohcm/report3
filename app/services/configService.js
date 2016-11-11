(function() {
    window.services = window.services || {};

    /**
     * @service configService
     * Use this to set config values 
     */
	window.services.configService = function() {

        var config = {
            common: {
                // any config that is not specific to a single brand should go here,
                totCompletionTitlePrefix: 'Tot Completion % for ',
                apiBaseUrl: 'https://dunk-dev.tribridge-amplifyhr.com',
                params: {
                    // these will contain query string params that we keep passing around
                    // and will be set in angular.run, instead of saving them on $rootScope or $scope
                    brand: '',
                    reportId: '',
                    newCustomReportModel: ''
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
                            pathId: 19,
                            title: 'Learning Path (BR)',
                            oneLevel: false
                        },
                        'new-and-trending': {
                            pathId: 20,
                            title: 'New & Trending (BR)',
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
                            pathId: 15,
                            title: 'Learning Path',
                            oneLevel: false
                        },
                        'new-and-trending': {
                            pathId: 18,
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

        return {
			getCommonConfig: getCommonConfig,
            getBrands: getBrands,
            getBrandConfig: getBrandConfig,
            setParam: setParam,
            setSessionParam: setSessionParam,
            sessionParamsSet: sessionParamsSet
		};
    };

}());
