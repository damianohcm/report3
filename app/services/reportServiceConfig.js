(function() {
    window.services = window.services || {};

  
	window.services.reportServiceConfig = function() {

        var getConfig = function() {
            var config = {
                useTestData: true,
                notApplicableLabel: '0% *',
                notApplicableIncludeInCalc: true,
                debug: false,
                colorPersonSegmentCell: false /* use to drive the addition of css class "with-color" */
            };

            return config;
        };

        return {
			getConfig: getConfig
		};
    };

}());
