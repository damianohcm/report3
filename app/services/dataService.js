(function() {

	window.services = window.services || {};
  
    window.services.dataService = function($http, utilsService) {
		
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

		/**
		 * @method fixReportAPIData
		 * Helper to bring deep-dested data from segment api down one level
		 */
		const fixReportAPIData = function(dataToFix, reportConfigStrategy) {

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

			var segments = dataToFix.segments;

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
			const mapLoFields = function(lo) {
				lo.id = (lo.loid || lo.object_id || lo.id);
				lo.type = (lo.item_type || lo.type || 'Not Set');
				lo.name = (lo.name || lo.title);
				return lo;
			};

			const updateMappedLos = function(mappedLos, lo) {
				// do not add Curriculum type
				if (lo.type.toLowerCase() !== 'curriculum') {
					mappedLos.push(lo);
				}
			};

			utilsService.fastLoop(segments, function(seg) {
				// since we are already looping on Segments, make their properties consistent
				seg.id = (seg.id || seg.item_id);
				seg.name = (seg.title || seg.name);
				seg.type = (seg.item_type || seg.type || 'Not Set');

				var mappedLos = [];

				utilsService.fastLoop(seg.los, function(lo) {
					lo = mapLoFields(lo);

					// update mappedLos 
					updateMappedLos(mappedLos, lo);

					// if there are children los, add them all
					if (lo.los && lo.los.length > 0) {
						utilsService.fastLoop(lo.los, function(childLo) {
							childLo = mapLoFields(childLo);
							// update mappedLos 
							updateMappedLos(mappedLos, childLo);
						});
					}
				});

				seg.los = mappedLos;
			});

			dataToFix.segments = segments;
			utilsService.safeLog('dataService: dataToFix.segments', dataToFix.segments, true);

			var stores = dataToFix.stores 
				&& dataToFix.stores.length 
				? dataToFix.stores
				: [];

			// map store people lo id to lookup
			// this is because the backend does not return which parent Segment id the person LOs belong to
			// also determine if all people org_quid are the same
			var peopleOrgStrategy = {
				74: 'br', //Baskin-Robbins
				75: 'dd', // Dunkin' Donuts
				76: 'ddbr' //Dunkin' Donuts/Baskin-Robbins Combo
			};

			var peopleOrgs = [];
			utilsService.fastLoop(stores, function(store) {
				utilsService.fastLoop(store.people, function(person) {
					// build a unique list of people org_guid values
					var org = peopleOrgStrategy[person.org_guid];
					if (!org) {
						var msg = 'dataService.fixReportData: could not find mapping for org_guid ' + person.org_guid;
						console.log(msg);
						alert(msg);
					} else if (peopleOrgs.indexOf(org) === -1) {
						peopleOrgs.push(org);
					}

					utilsService.fastLoop(person.los, function(personLo) {
						if (personLo) {
							utilsService.fastLoop(segments, function(segm) {
								var itemLo = _.find(segm.los, function(lookupLo) {
									return lookupLo.id === personLo.id;
								});

								if (itemLo) {
									personLo.segmentId = segm.id;
								}
							});
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
			fixReportAPIData: fixReportAPIData
		};
	};

}());
