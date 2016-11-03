(function() {

	var utilsService;
	window.services = window.services || {};
  
    window.services.dataService = function($http, utils) {
		utilsService = utils;
		
		var getData = function(url) {

			return $http
				.get(url)
				.then(function(response) {
					return response.data;
				});
		
		};

		// var postData = function(url) {

		// 	return $http
		// 		.get(url)
		// 		.then(function(response) {
		// 			return response.data;
		// 		});
		// };

		return {
			getData: getData
		};
	};

}());
