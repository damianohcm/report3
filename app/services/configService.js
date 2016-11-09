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

        return {
			getCommonConfig: getCommonConfig,
            getBrandConfig: getBrandConfig
		};
    };

}());
