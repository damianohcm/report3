(function() {

	window.services = window.services || {};
  
    window.services.dataService = function($http) {

		var getData = function(fileName) {
			var url = 'data/' + fileName;

			return $http
				.get(url)
				.then(function(response) {
					return response.data;
				});
		};

		return {
			getData: getData
		};
	};

}());
