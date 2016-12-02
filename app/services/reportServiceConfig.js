(function() {
    /**
     * @service reportServiceConfig
     * Use this to set config values for reportService
     */
	var reportServiceConfig = function() {

        var getConfig = function() {
            var config = {
                useTestData: false, /* set to true to load static json data from app/data/ folder instead of using the live API endpoints */
                debug: false, /* true will output additional info in the cells to help identify the code in reportService that populates them */

                averageCalculationMode: 'los', /* 'segments' = Segments average; 'los' = Learning Objects Weighted Average */
                
                notApplicableLabel: '0% *', /* the label used when Learning Objects are Not Applicabile - they are missing from the person los arrays */
                notApplicableIncludeInCalc: true, /* whether to include the N/A columns in the average aggregated calculation for summary */
                colorPersonSegmentCell: false, /* use to drive the addition of css class "with-color" - Dunking does not want them colored but other customers might want it */
                
                colSummaryHeaderMaxLength: 75, /* max length of Summary column header (Tot Completion For ...) */
                colGroupHeaderMaxLength: 75, /* max length of group columns headers (Segments) */
                colChildheaderMaxLength: 55, /* max length of child columns headers (Learning objects) */
                rowGroupHeaderMaxLength: 25, /* max length of PC/store name */
                rowChildheaderMaxLength: 22 /* max length of Person name */
            };

            return config;
        };

        return {
			getConfig: getConfig
		};
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = reportServiceConfig;
        }
        exports = reportServiceConfig;
    } else {
        window.services = window.services || {};
        window.services.reportServiceConfig = reportServiceConfig;
    }

}());
