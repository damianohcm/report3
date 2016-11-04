(function() {
    window.services = window.services || {};

    /**
     * @service reportServiceConfig
     * Use this to set config values for reportService
     */
	window.services.reportServiceConfig = function() {

        var getConfig = function() {
            var config = {
                useTestData: true, /* set to true to load static json data from app/data/ folder instead of using the live API endpoints */
                notApplicableLabel: '0% *', /* the label used when Learning Objects are Not Applicabile - they are missing from the person los arrays */
                notApplicableIncludeInCalc: true, /* whether to include the N/A columns in the average aggregated calculation for summary */
                debug: false, /* true will output additional info in the cells to help identify the code in reportService that populates them */
                colorPersonSegmentCell: false /* use to drive the addition of css class "with-color" - Dunking does not want them colored but other customers might want it */
            };

            return config;
        };

        return {
			getConfig: getConfig
		};
    };

}());
