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
                apiBaseUrl: 'https://dunk-dev.tribridge-amplifyhr.com'
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
                        pathId: 17,
                        title: 'Learning Path',
                        oneLevel: false
                    },
                    'new-and-trending': {
                        pathId: 19,
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
        };

        var getCommonConfig = function() {
            return config.common;
        };

        var getBrandConfig = function(brand) {
            return config[brand] || alert('homeConfig: could not find brand ' + brand + ' in config');
        };

        return {
			getCommonConfig: getCommonConfig,
            getBrandConfig: getBrandConfig
		};
    };

}());
