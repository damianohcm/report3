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
                    // these will contain query string and session params
                    // and will be set in angular.run, instead of saving them on $rootScope or $scope
                    token: '',
                    compKey: '',
                    csBaseUrl: '',
                    brand: '',
                    lang: '',
                    organization: '',
                    reportId: '',

                    newCustomReportModel: ''
                }
            },
            dd: {
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
            },
            br: {
                reportStrategies: {
                    'learning-path': {
                        pathId: 15, /* TODO: need to update this with new value once John has created the new Learning Path for BR */
                        title: 'Learning Path (BR)',
                        oneLevel: false
                    },
                    'new-and-trending': {
                        pathId: 18, /* TODO: need to update this with new value once John has created the new New and Trending for BR */
                        title: 'New & Trending (BR)',
                        oneLevel: true
                    },
                    custom: {
                        pathId: -1,
                        title: 'Custom',
                        oneLevel: false
                    }
                }
            }
        };

        var getCommonConfig = function() {
            return config.common;
        };

        var getBrandConfig = function(brand) {
            return config[brand] || alert('homeConfig: could not find brand ' + brand + ' in config');
        };

        var setCommonParam = function(key, value) {
            if (Object.keys(config.common.params).indexOf(key) > -1) {
                config.common.params[key] = value;
            } else {
                console.log('configService.setCommonParam: exception: unknown key', key);
                debugger;
            }
        };

        return {
			getCommonConfig: getCommonConfig,
            getBrandConfig: getBrandConfig,
            setCommonParam: setCommonParam
		};
    };

}());
