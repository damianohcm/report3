(function() {

    var dataService = function($http, utilsService) {
		
		var getData = function(url, method, payload) {

			if (method && method === 'post') {

				return $http
					.post(url, payload)
					.then(function(response) {
						return response.data;
					});

			} else {

				return $http
					.get(url)
					.then(function(response) {
						return response.data;
					});
			}
		
		};

		var postData = function(url, payload) {
			return $http
				.post(url, payload)
				.then(function(response) {
					return response.data;
				});
		};

		var putData = function(url, payload) {
			return $http
				.put(url, payload)
				.then(function(response) {
					return response.data;
				});
		};

		var deleteData = function(url) {
			return $http
				.delete(url)
				.then(function(response) {
					return response.data;
				});
		};

		// const validateStoresLOsAgainstSegmentsLOs = function(data) {

		// 	// loop through each store
		// 	utilsService.fastLoop(data.stores, function(store) {

		// 		// loop through store's people
		// 		utilsService.fastLoop(store.people, function(person) {
					
		// 			// loop through person los
		// 			utilsService.fastLoop(person.los, function(personLo) {
						
		// 				var segementsLen = data.segments.mength;

		// 				for (var i = segementsLen; i > 0;){
		// 					return item.id === personLo.segmentId;
		// 				};

		// 				if (!segment) {
		// 					alert('Could not find segment for perons LO with id ' + personLo.id);
		// 				}
						
		// 			});

		// 		});

		// 	});
		// };

		const fixSegmentsListAPIData = function (segmentsList, pathId) {
			// // if we ever have to wrap one-level only dat ainto a fake segment, use this:
			// // if (reportConfigStrategy.oneLevel) {
			// // 	debugger;
			// // 	// wrap within "fake" segment
			// // 	dataToFix.segments = [{
			// // 		//item_type: 'Section',
			// // 		id: -1,
			// // 		title: reportConfigStrategy.title,
			// // 		los: dataToFix.segments
			// // 	}];
			// // }
 
/* // example segments data as from API endpoint
{
	"learning_path_id": "15",
	"learning_path_name": "Dunkin Donuts Crew",
	"learning_path_items": [{
		"item_type": "Section",
		"id": 4,
		"title": "Guest Service"
		"los": [{
			"item_type": "Curriculum",
			"id": "4e4b4967-1ebf-4dd3-ad97-05f376686072",
			"name": "Guest Service",
			"los": [{
				"loid": "27279562-cc7c-40d2-91e2-e412fd04b3b5",
				"name": "Dunkin' Donuts Guest Service: Serving Guests with Disabilities"
			}, {
				"loid": "02aa0e43-fb99-4f50-9616-cc0f4939c3ea",
				"name": "Dunkin' Donuts Guest Service: Meeting Guest Expectations"
			}]
		}]
	}]
}
*/

			// helper to map lo fields and ensure consistency for Learning Objects
			const mapLoFields = function(lo, segmentId) {
				if (!segmentId) {
					var errMsg = 'dataService: segmentId cannot be undefined';
					alert(errMsg);
					throw Error(errMsg);
				}
				lo.id = (lo.id || lo.loid || lo.object_id);
				lo.type = (lo.item_type || lo.type || 'Not Set');
				lo.name = (lo.name || lo.title);
				lo.segmentId = segmentId;

				delete lo.loid;
				delete lo.item_type;
				return lo;
			};

			const updateMappedLos = function(mappedLos, lo) {
				// do not add Curriculum type
				if (lo.type.toLowerCase() !== 'curriculum') {
					mappedLos.push(lo);
				}
			};

			utilsService.fastLoop(segmentsList, function(seg) {
				// since we are already looping on Segments, make their properties consistent
				var segmentId = Number(seg.id || seg.item_id);
				seg.id = segmentId;
				seg.name = (seg.title || seg.name);
				seg.type = (seg.item_type || seg.type || 'Not Set');

				if (pathId) {
					seg.pathId = pathId;
				}

				var mappedLos = [];

				utilsService.fastLoop(seg.los, function(lo) {
					lo = mapLoFields(lo, segmentId);

					// update mappedLos 
					updateMappedLos(mappedLos, lo);

					// if there are children los, add them all
					if (lo.los && lo.los.length > 0) {
						utilsService.fastLoop(lo.los, function(childLo) {
							childLo = mapLoFields(childLo, segmentId);
							// update mappedLos 
							updateMappedLos(mappedLos, childLo);
						});
					}
				});

				seg.los = mappedLos;
			});

			//// utilsService.safeLog('dataService: segments', segmentsList, true);
			// console.log(JSON.stringify(segmentsList));
			// debugger;
			return segmentsList;
		};

		/**
		 * @method fixReportAPIData
		 * Helper to bring deep-dested data from segment api down one level
		 */
		const fixReportAPIData = function(dataToFix, peopleOrgStrategy, reportConfigStrategy) {
			
			dataToFix.segments = fixSegmentsListAPIData(dataToFix.segments);

			var stores = dataToFix.stores 
				&& dataToFix.stores.length 
				? dataToFix.stores
				: [];

			var peopleOrgs = [];
			utilsService.fastLoop(stores, function(store) {
				utilsService.fastLoop(store.people, function(person) {
					// build a unique list of people org_guid values
					var org = peopleOrgStrategy[person.org_guid];
					if (!org) {
						var msg = 'dataService.fixReportData: could not find mapping for org_guid ' + person.org_guid;
						console.log(msg);
						console.log('dataService.fixReportData: defaulting org_guid to Dunkin (75) for person ', person.name);
						//alert(msg);
						org = peopleOrgStrategy['75'];
						peopleOrgs.push(org);
					} else if (peopleOrgs.indexOf(org) === -1) {
						peopleOrgs.push(org);
					}

					utilsService.fastLoop(person.los, function(personLo) {
						utilsService.fastLoop(dataToFix.segments, function(segm) {
							var itemLo = _.find(segm.los, function(lookupLo) {
								return lookupLo.id === personLo.id;
							});

							if (itemLo) {
								personLo.segmentId = itemLo.segmentId;
							}
						});

						if (!personLo.segmentId) {
							var errMsg = 'dataService.fixReportData: Error mapping segmentId for personLo ' + personLo.id;
							console.log(errMsg);
						}
					});
				});
			});

			dataToFix.peopleOrgs = peopleOrgs;
			console.log('distinct people org_guid values', dataToFix.peopleOrgs);
			
			// returned fixed data
			dataToFix.stores = stores;

			return dataToFix;
		};

		return {
			getData: getData,
			postData: postData,
			putData: putData,
			deleteData: deleteData,
			fixSegmentsListAPIData: fixSegmentsListAPIData,
			fixReportAPIData: fixReportAPIData
		};
	};

	if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = dataService;
        }
        exports = dataService;
    } else {
        window.services = window.services || {};
        window.services.dataService = dataService;
    }

}());
