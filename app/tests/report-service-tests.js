/*global requirejs, describe, it, chai, mocha*/
/* eslint-disable max-len */
(function(){

	requirejs([
			'../services/configService.js',
			'../services/utilsService.js', 
			'../services/reportService.js'
		], function() {
		mocha.setup('bdd');

		var configService = window.services.configService()
			, utilsService = window.services.utilsService(configService)
			, reportConfig = configService.getReportConfig()
			, service = window.services.reportService(utilsService, reportConfig);

		// important: set reportConfig to use by reportService
		service.setReportConfig(reportConfig);

		utilsService.safeLog('loaded', service, true);
		utilsService.safeLog('reportConfig', reportConfig, true);

		var expect = chai.expect,
			_refErr = new Error('Unit test reference error'),

			_refModel = JSON.parse('{"columns":[{"id":"category","key":"category","position":0,"show":true,"locked":true,"css":"th-category","name":""},{"id":"summary","key":"summary","position":1,"show":true,"locked":true,"css":"th-summary","name":"Tot Completion %"},{"isGroup":true,"id":"9001","key":"9001","show":true,"position":2,"locked":false,"css":"th-segment","name":"Welcome to Dunkin\' Donuts!"},{"isChild":true,"parentId":"9001","id":"welcome-1","key":"welcome-to-dd_welcome-1","position":3,"locked":false,"calculate":true,"css":"th-lo","name":"Introduction","_show":false},{"isChild":true,"parentId":"9001","id":"welcome-2","key":"welcome-to-dd_welcome-2","position":4,"locked":false,"calculate":true,"css":"th-lo","name":"History","_show":false},{"isChild":true,"parentId":"9001","id":"welcome-3","key":"welcome-to-dd_welcome-3","position":5,"locked":false,"calculate":true,"css":"th-lo","name":"Future","_show":false},{"isGroup":true,"id":"9002","key":"9002","show":true,"position":6,"locked":false,"css":"th-segment","name":"Guest Services"},{"isChild":true,"parentId":"9002","id":"guest-services-1","key":"guest-services_guest-services-1","position":7,"locked":false,"calculate":true,"css":"th-lo","name":"Guest First Commitment","_show":false},{"isChild":true,"parentId":"9002","id":"guest-services-2","key":"guest-services_guest-services-2","position":8,"locked":false,"calculate":true,"css":"th-lo","name":"The Six Steps of Guest Services","_show":false},{"isChild":true,"parentId":"9002","id":"guest-services-3","key":"guest-services_guest-services-3","position":9,"locked":false,"calculate":true,"css":"th-lo","name":"Serving Guest with Disabilities","_show":false},{"isChild":true,"parentId":"9002","id":"guest-services-4","key":"guest-services_guest-services-4","position":10,"locked":false,"calculate":true,"css":"th-lo","name":"Meeting Guest Expectations","_show":false},{"isGroup":true,"id":"9003","key":"9003","show":true,"position":11,"locked":false,"css":"th-segment","name":"Crew only"},{"isChild":true,"parentId":"9003","id":"crew-only-1","key":"crew-only_crew-only-1","position":12,"locked":false,"calculate":true,"css":"th-lo","name":"Crew Beginners","_show":false},{"isChild":true,"parentId":"9003","id":"crew-only-2","key":"crew-only_crew-only-2","position":13,"locked":false,"calculate":true,"css":"th-lo","name":"Crew Intermediary","_show":false},{"isChild":true,"parentId":"9003","id":"crew-only-3","key":"crew-only_crew-only-3","position":14,"locked":false,"calculate":true,"css":"th-lo","name":"Crew Advanced","_show":false}],"result":{"tot":10,"rows":[{"isGroup":true,"id":302068,"show":true,"isCollapsed":true,"children":[{"id":6543,"isChild":true,"show":true,"category":{"key":"category","locked":true,"value":"Ella Cunningham","value2":"Manager"},"summary":{"key":"summary","locked":true,"value":0,"suffix":"%"},"Welcome to Dunkin\' Donuts!":{"isGroup":true,"key":"9001","id":"9001","value":0,"suffix":"%"},"welcome-to-dd_welcome-1":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"9001","id":"welcome-1","key":"welcome-to-dd_welcome-1"},"welcome-to-dd_welcome-2":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"9001","id":"welcome-2","key":"welcome-to-dd_welcome-2"},"welcome-to-dd_welcome-3":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"9001","id":"welcome-3","key":"welcome-to-dd_welcome-3"},"Guest Services":{"isGroup":true,"key":"9002","id":"9002","value":0,"suffix":"%"},"guest-services_guest-services-1":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"9002","id":"guest-services-1","key":"guest-services_guest-services-1"},"guest-services_guest-services-2":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"9002","id":"guest-services-2","key":"guest-services_guest-services-2"},"guest-services_guest-services-3":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"9002","id":"guest-services-3","key":"guest-services_guest-services-3"},"guest-services_guest-services-4":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"9002","id":"guest-services-4","key":"guest-services_guest-services-4"},"crew-only":{"isGroup":true,"key":"9003","id":"9003","value":"0% *","suffix":"","isNA":true},"crew-only_crew-only-1":{"isChild":true,"realValue":-1,"value":"0% *","css":"col-child na","parentId":"9003","id":"crew-only-1","key":"crew-only_crew-only-1"},"crew-only_crew-only-2":{"isChild":true,"realValue":-1,"value":"0% *","css":"col-child na","parentId":"9003","id":"crew-only-2","key":"crew-only_crew-only-2"},"crew-only_crew-only-3":{"isChild":true,"realValue":-1,"value":"0% *","css":"col-child na","parentId":"9003","id":"crew-only-3","key":"crew-only_crew-only-3"},"parentId":302068},{"id":6544,"isChild":true,"show":true,"category":{"key":"category","locked":true,"value":"Max Garcia","value2":"Crew Member"},"summary":{"key":"summary","locked":true,"value":0,"suffix":"%"},"Welcome to Dunkin\' Donuts!":{"isGroup":true,"key":"9001","id":"9001","value":0,"suffix":"%"},"welcome-to-dd_welcome-1":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"9001","id":"welcome-1","key":"welcome-to-dd_welcome-1"},"welcome-to-dd_welcome-2":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"9001","id":"welcome-2","key":"welcome-to-dd_welcome-2"},"welcome-to-dd_welcome-3":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"9001","id":"welcome-3","key":"welcome-to-dd_welcome-3"},"Guest Services":{"isGroup":true,"key":"9002","id":"9002","value":0,"suffix":"%"},"guest-services_guest-services-1":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"9002","id":"guest-services-1","key":"guest-services_guest-services-1"},"guest-services_guest-services-2":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"9002","id":"guest-services-2","key":"guest-services_guest-services-2"},"guest-services_guest-services-3":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"9002","id":"guest-services-3","key":"guest-services_guest-services-3"},"guest-services_guest-services-4":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"9002","id":"guest-services-4","key":"guest-services_guest-services-4"},"crew-only":{"isGroup":true,"key":"9003","id":"9003","value":0,"suffix":"%"},"crew-only_crew-only-1":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"9003","id":"crew-only-1","key":"crew-only_crew-only-1"},"crew-only_crew-only-2":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"9003","id":"crew-only-2","key":"crew-only_crew-only-2"},"crew-only_crew-only-3":{"isChild":true,"realValue":-1,"value":"0% *","css":"col-child na","parentId":"9003","id":"crew-only-3","key":"crew-only_crew-only-3"},"parentId":302068}],"category":{"id":"category","key":"category","css":"category","locked":true,"value":"302068-Gallion Group, Inc."},"summary":{"id":"summary","key":"summary","locked":true,"value":0,"suffix":"%"},"Welcome to Dunkin\' Donuts!":{"isGroup":true,"id":"9001","key":"9001","value":0,"suffix":""},"welcome-to-dd_welcome-1":{"isChild":true,"parentId":"9001","id":"welcome-1","key":"welcome-to-dd_welcome-1","value":0,"suffix":""},"welcome-to-dd_welcome-2":{"isChild":true,"parentId":"9001","id":"welcome-2","key":"welcome-to-dd_welcome-2","value":0,"suffix":""},"welcome-to-dd_welcome-3":{"isChild":true,"parentId":"9001","id":"welcome-3","key":"welcome-to-dd_welcome-3","value":0,"suffix":""},"Guest Services":{"isGroup":true,"id":"9002","key":"9002","value":0,"suffix":""},"guest-services_guest-services-1":{"isChild":true,"parentId":"9002","id":"guest-services-1","key":"guest-services_guest-services-1","value":0,"suffix":""},"guest-services_guest-services-2":{"isChild":true,"parentId":"9002","id":"guest-services-2","key":"guest-services_guest-services-2","value":0,"suffix":""},"guest-services_guest-services-3":{"isChild":true,"parentId":"9002","id":"guest-services-3","key":"guest-services_guest-services-3","value":0,"suffix":""},"guest-services_guest-services-4":{"isChild":true,"parentId":"9002","id":"guest-services-4","key":"guest-services_guest-services-4","value":0,"suffix":""},"crew-only":{"isGroup":true,"id":"9003","key":"9003","value":0,"suffix":""},"crew-only_crew-only-1":{"isChild":true,"parentId":"9003","id":"crew-only-1","key":"crew-only_crew-only-1","value":0,"suffix":""},"crew-only_crew-only-2":{"isChild":true,"parentId":"9003","id":"crew-only-2","key":"crew-only_crew-only-2","value":0,"suffix":""},"crew-only_crew-only-3":{"isChild":true,"parentId":"9003","id":"crew-only-3","key":"crew-only_crew-only-3","value":0,"suffix":""}},{"isGroup":true,"id":302612,"show":true,"isCollapsed":true,"children":[{"id":4322,"isChild":true,"show":true,"category":{"key":"category","locked":true,"value":"John Doe","value2":"Manager"},"summary":{"key":"summary","locked":true,"value":0,"suffix":"%"},"Welcome to Dunkin\' Donuts!":{"isGroup":true,"key":"9001","id":"9001","value":0,"suffix":"%"},"welcome-to-dd_welcome-1":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"9001","id":"welcome-1","key":"welcome-to-dd_welcome-1"},"welcome-to-dd_welcome-2":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"9001","id":"welcome-2","key":"welcome-to-dd_welcome-2"},"welcome-to-dd_welcome-3":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"9001","id":"welcome-3","key":"welcome-to-dd_welcome-3"},"Guest Services":{"isGroup":true,"key":"9002","id":"9002","value":0,"suffix":"%"},"guest-services_guest-services-1":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"9002","id":"guest-services-1","key":"guest-services_guest-services-1"},"guest-services_guest-services-2":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"9002","id":"guest-services-2","key":"guest-services_guest-services-2"},"guest-services_guest-services-3":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"9002","id":"guest-services-3","key":"guest-services_guest-services-3"},"guest-services_guest-services-4":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"9002","id":"guest-services-4","key":"guest-services_guest-services-4"},"crew-only":{"isGroup":true,"key":"9003","id":"9003","value":"0% *","suffix":"","isNA":true},"crew-only_crew-only-1":{"isChild":true,"realValue":-1,"value":"0% *","css":"col-child na","parentId":"9003","id":"crew-only-1","key":"crew-only_crew-only-1"},"crew-only_crew-only-2":{"isChild":true,"realValue":-1,"value":"0% *","css":"col-child na","parentId":"9003","id":"crew-only-2","key":"crew-only_crew-only-2"},"crew-only_crew-only-3":{"isChild":true,"realValue":-1,"value":"0% *","css":"col-child na","parentId":"9003","id":"crew-only-3","key":"crew-only_crew-only-3"},"parentId":302612},{"id":4323,"isChild":true,"show":true,"category":{"key":"category","locked":true,"value":"Michael McDonald","value2":"Crew Member"},"summary":{"key":"summary","locked":true,"value":0,"suffix":"%"},"Welcome to Dunkin\' Donuts!":{"isGroup":true,"key":"9001","id":"9001","value":0,"suffix":"%"},"welcome-to-dd_welcome-1":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"9001","id":"welcome-1","key":"welcome-to-dd_welcome-1"},"welcome-to-dd_welcome-2":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"9001","id":"welcome-2","key":"welcome-to-dd_welcome-2"},"welcome-to-dd_welcome-3":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"9001","id":"welcome-3","key":"welcome-to-dd_welcome-3"},"Guest Services":{"isGroup":true,"key":"9002","id":"9002","value":0,"suffix":"%"},"guest-services_guest-services-1":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"9002","id":"guest-services-1","key":"guest-services_guest-services-1"},"guest-services_guest-services-2":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"9002","id":"guest-services-2","key":"guest-services_guest-services-2"},"guest-services_guest-services-3":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"9002","id":"guest-services-3","key":"guest-services_guest-services-3"},"guest-services_guest-services-4":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"9002","id":"guest-services-4","key":"guest-services_guest-services-4"},"crew-only":{"isGroup":true,"key":"9003","id":"9003","value":"0% *","suffix":"","isNA":true},"crew-only_crew-only-1":{"isChild":true,"realValue":-1,"value":"0% *","css":"col-child na","parentId":"9003","id":"crew-only-1","key":"crew-only_crew-only-1"},"crew-only_crew-only-2":{"isChild":true,"realValue":-1,"value":"0% *","css":"col-child na","parentId":"9003","id":"crew-only-2","key":"crew-only_crew-only-2"},"crew-only_crew-only-3":{"isChild":true,"realValue":-1,"value":"0% *","css":"col-child na","parentId":"9003","id":"crew-only-3","key":"crew-only_crew-only-3"},"parentId":302612}],"category":{"id":"category","key":"category","css":"category","locked":true,"value":"302612-Some other store, Inc."},"summary":{"id":"summary","key":"summary","locked":true,"value":0,"suffix":"%"},"Welcome to Dunkin\' Donuts!":{"isGroup":true,"id":"9001","key":"9001","value":0,"suffix":""},"welcome-to-dd_welcome-1":{"isChild":true,"parentId":"9001","id":"welcome-1","key":"welcome-to-dd_welcome-1","value":0,"suffix":""},"welcome-to-dd_welcome-2":{"isChild":true,"parentId":"9001","id":"welcome-2","key":"welcome-to-dd_welcome-2","value":0,"suffix":""},"welcome-to-dd_welcome-3":{"isChild":true,"parentId":"9001","id":"welcome-3","key":"welcome-to-dd_welcome-3","value":0,"suffix":""},"Guest Services":{"isGroup":true,"id":"9002","key":"9002","value":0,"suffix":""},"guest-services_guest-services-1":{"isChild":true,"parentId":"9002","id":"guest-services-1","key":"guest-services_guest-services-1","value":0,"suffix":""},"guest-services_guest-services-2":{"isChild":true,"parentId":"9002","id":"guest-services-2","key":"guest-services_guest-services-2","value":0,"suffix":""},"guest-services_guest-services-3":{"isChild":true,"parentId":"9002","id":"guest-services-3","key":"guest-services_guest-services-3","value":0,"suffix":""},"guest-services_guest-services-4":{"isChild":true,"parentId":"9002","id":"guest-services-4","key":"guest-services_guest-services-4","value":0,"suffix":""},"crew-only":{"isGroup":true,"id":"9003","key":"9003","value":0,"suffix":""},"crew-only_crew-only-1":{"isChild":true,"parentId":"9003","id":"crew-only-1","key":"crew-only_crew-only-1","value":0,"suffix":""},"crew-only_crew-only-2":{"isChild":true,"parentId":"9003","id":"crew-only-2","key":"crew-only_crew-only-2","value":0,"suffix":""},"crew-only_crew-only-3":{"isChild":true,"parentId":"9003","id":"crew-only-3","key":"crew-only_crew-only-3","value":0,"suffix":""}}]}}'),

			_refColGroups = _.filter(_refModel.columns, function(col) {
				return col.isGroup;
			}),
			_refColGroup = _.find(_refColGroups, function(col) {
				return col.key === '9001';
			}),

			_refRowGroups = _.filter(_refModel.result.rows, function(row) {
				return row.isGroup;
			}),
			_refRowGroup = _.find(_refRowGroups, function(row) {
				return row.id === 302068;
			}),
			
			_courses = JSON.parse('[{"id":"9001","name":"Welcome to Dunkin\' Donuts!","los":[{"id":"welcome-1","name":"Introduction","type":"Video"},{"id":"welcome-2","name":"History","type":"Video"},{"id":"welcome-3","name":"Future","type":"Video"}],"show":true},{"id":"9002","name":"Guest Services","los":[{"id":"guest-services-1","name":"Guest First Commitment","type":"Online Class"},{"id":"guest-services-2","name":"The Six Steps of Guest Services","type":"Online Class"},{"id":"guest-services-3","name":"Serving Guest with Disabilities","type":"Online Class"},{"id":"guest-services-4","name":"Meeting Guest Expectations","type":"Online Class"}],"show":true},{"id":"9003","name":"Crew only","los":[{"id":"crew-only-1","name":"Crew Beginners","type":"Video"},{"id":"crew-only-2","name":"Crew Intermediary","type":"Video"},{"id":"crew-only-3","name":"Crew Advanced","type":"Video"}],"show":true}]'),
			_personManager = JSON.parse('{"id":6543,"name":"Ella Cunningham","title":"Manager","los":[{"id":"welcome-1","value":2,"segmentId":"9001"},{"id":"welcome-2","value":1,"segmentId":"9001"},{"id":"welcome-3","value":0,"segmentId":"9001"},{"id":"guest-services-1","value":2,"segmentId":"9002"},{"id":"guest-services-2","value":2,"segmentId":"9002"},{"id":"guest-services-3","value":1,"segmentId":"9002"},{"id":"guest-services-4","value":0,"segmentId":"9002"}]}'),
			_personCrew = JSON.parse('{"id":6544,"name":"Max Garcia","title":"Crew Member","los":[{"id":"welcome-1","value":0,"segmentId":"9001"},{"id":"welcome-2","value":1,"segmentId":"9001"},{"id":"welcome-3","value":2,"segmentId":"9001"},{"id":"guest-services-1","value":2,"segmentId":"9002"},{"id":"guest-services-2","value":1,"segmentId":"9002"},{"id":"guest-services-3","value":0,"segmentId":"9002"},{"id":"guest-services-4","value":0,"segmentId":"9002"},{"id":"crew-only-1","value":1,"segmentId":"9003"},{"id":"crew-only-2","value":1,"segmentId":"9003"},{"id":"crew-only-3","value":2,"segmentId":"9003"}]}'),
			
			_expectedData = {
				manager: {
					row: {
						summary: {
							key: 'summary',
							locked: true,
							value: 42,
							suffix: '%'
						},
						'9001': {
							isGroup: true,
							id: 9001,
							key: 9001,
							value: 33,
							suffix: '%'
						},
						'9002':  {
							isGroup: true,
							id: 9002,
							key: 9002,
							value: 50,
							suffix: '%'
						},
						'9003': {
							isGroup: true,
							id: 9003,
							key: 9003,
							value: reportConfig.notApplicableLabels.personRow,
							suffix: ''
						}
					}
				},
				crew: {
					row: {
						summary: {
							key: 'summary',
							locked: true,
							value: 30,
							suffix: '%'
						},
						'9001': {
							isGroup: true,
							id: 9001,
							key: 9001,
							value: 33,
							suffix: '%'
						},
						'9002':  {
							isGroup: true,
							id: 9002,
							key: 9002,
							value: 25,
							suffix: '%'
						},
						'9003': {
							isGroup: true,
							id: 9003,
							key: 9003,
							value: 33,
							suffix: '%'
						}
					}
				},
				store: {
					row: {
						'9001': {
							value: 33,
							suffix: '%'
						},
						'9002': {
							value: 38,
							suffix: '%'
						},
						'9003': {
							value: 0,
							suffix: '%'
						}
					},
					aggregateLoByStore: {
						'welcome-1': {
							value: 50,
							suffix: '%'
						},
						'welcome-2': {
							value: 0,
							suffix: '%'
						},
						'welcome-3': {
							value: 50,
							suffix: '%'
						},
						'guest-services-1': {
							value: 100,
							suffix: '%'
						},
						'guest-services-2': {
							value: 50,
							suffix: '%'
						},
						'guest-services-3': {
							value: 0,
							suffix: '%'
						},
						'guest-services-4': {
							value: 0,
							suffix: '%'
						},
						'crew-only-1': {
							value: 0,
							suffix: '%'
						},
						'crew-only-2': {
							value: 0,
							suffix: '%'
						},
						'crew-only-3': {
							value: reportConfig.notApplicableLabels.personRow,
							suffix: ''
						},
					}
				}
			};

		/* service tests */
		describe('reportService', function() {

			it('service: should not be undefined', function(done) {
				expect(service).to.not.be.undefined;
				done();
			});

			// respondTo tests
			it('service: should respond to', function(done) {
				expect(service).to.respondTo('getModel');
				expect(service).to.respondTo('recalculate');
				done();
			});

			// properties tests
			it('service: should have "private" property', function(done) {
				expect(service.private).to.be.an('object');
				done();
			});

			// service.private tests
			describe('service.private', function() {
				var private = service.private;

				it('service.private: should respond to', function(done) {
					expect(private).to.respondTo('getPersonSegmentCellCss');
					expect(private).to.respondTo('getPersonRow');
					expect(private).to.respondTo('aggregateSegmentByStore');
					expect(private).to.respondTo('aggregateLoByStore');
					done();
				});

				// properties tests
				it('service.private: should have "personLoCells" property', function(done) {
					expect(private.personLoCells).to.be.an('object');
					done();
				});
			});

			// service.private.personLoCells tests
			describe('service.private.personLoCells', function() {
				var personLoCells = service.private.personLoCells;

				// properties tests
				it('service.private: should have "personLoCells" property', function(done) {
					expect(personLoCells).to.be.an('object');
					done();
				});

				// personLoCells tests
				it('service.private.personLoCells: should return correct label and css when value is 0 (zero)', function(done) {
					var value = 0, item = personLoCells[value];
					expect(item).to.be.an('object');
					expect(item.value).to.be.a('string')
						.to.equal('Not Started');
					expect(item.css).to.be.a('string')
						.to.equal('col-child');
					done();
				});
				it('service.private.personLoCells: should return correct label and css when value is 1 (one)', function(done) {
					var value = 1, item = personLoCells[value];
					expect(item).to.be.an('object');
					expect(item.value).to.be.a('string')
						.to.equal('In Progress');
					expect(item.css).to.be.a('string')
						.to.equal('col-child in-progress');
					done();
				});
				it('service.private.personLoCells: should return correct label and css when value is 2 (two)', function(done) {
					var value = 2, item = personLoCells[value];
					expect(item).to.be.an('object');
					expect(item.value).to.be.a('string')
						.to.equal('Completed');
					expect(item.css).to.be.a('string')
						.to.equal('col-child completed');
					done();
				});
			});

			// service.private.getPersonSegmentCellCss tests
			describe('service.private.getPersonSegmentCellCss', function() {
				var getPersonSegmentCellCss = service.private.getPersonSegmentCellCss;

				// getPersonSegmentCellCss tests
				it('service.private.getPersonSegmentCellCss: should not throw', function(done) {
					var fn = function () { 
						try {
							var cell = {
								value: reportConfig.notApplicableLabels.aggregateSegmentByStore
							};

							getPersonSegmentCellCss(cell);
						} catch (e) {
							throw _refErr;
						}
					};

					// expect to not throw
					expect(fn).to.not.throw(_refErr);
					done();
				});
				it('service.private.getPersonSegmentCellCss: should throw when invalid arguments', function(done) {
					var test = this.test,
						fn = function () { 
							try {
								getPersonSegmentCellCss(); // calling without argument should cause it to throw
							} catch (e) {
								console.log(test.title + ': Expected exception thrown', e);
								throw _refErr;
							}
						};

					// expect to throw
					expect(fn).to.throw(_refErr);
					done();
				});
				it('service.private.getPersonSegmentCellCss: should return correct css when value is N/A or not a number', function(done) {
					var cell = {
						value: reportConfig.notApplicableLabels.aggregateSegmentByStore
					}, item = getPersonSegmentCellCss(cell);
					expect(item).to.be.a('string')
						.to.equal('col-group person na');
					done();
				});
				it('service.private.getPersonSegmentCellCss: should return correct css when value is exactly 100', function(done) {
					var cell = {
						value: 100
					}, item = getPersonSegmentCellCss(cell);
					expect(item).to.be.a('string')
						.to.equal('col-group person completed');
					done();
				});
				it('service.private.getPersonSegmentCellCss: should return correct css when value is > 0 and < 100', function(done) {
					var cell = {
						value: 99
					}, item = getPersonSegmentCellCss(cell);
					expect(item).to.be.a('string')
						.to.equal('col-group person in-progress');

					// test lower boundary
					cell.value = 1;
					item = getPersonSegmentCellCss(cell);
					expect(item).to.be.a('string')
						.to.equal('col-group person in-progress');
					done();
				});
				it('service.private.getPersonSegmentCellCss: should return correct css when value is 0 (zero)', function(done) {
					var cell = {
						value: 0
					}, item = getPersonSegmentCellCss(cell);
					expect(item).to.be.a('string')
						.to.equal('col-group person');
					done();
				});
			});

			// service.private.getPersonRow tests
			describe('service.private.getPersonRow', function() {
				var getPersonRow = service.private.getPersonRow;
				// getPersonRow tests
				it('service.private.getPersonRow: should not throw', function(done) {
					this.timeout(3000);
					var test = this.test,
						fn = function () { 
							try {
								getPersonRow(_courses, _personManager);
							} catch (e) {
								console.log(test.title + ': UNEXPECTED exception thrown', e);
								debugger;
								throw _refErr;
							}
						};

					// expect to not throw
					expect(fn).to.not.throw(_refErr);
					done();
				});
				it('service.private.getPersonRow: should throw when invalid arguments', function(done) {
					this.timeout(3000);
					var test = this.test,
						fn = function () { 
							try {
								getPersonRow(); // calling without argument should cause it to throw
							} catch (e) {
								console.log(test.title + ': Expected exception thrown', e);
								throw _refErr;
							}
						};

					// expect to throw
					expect(fn).to.throw(_refErr);
					done();
				});

				it('service.private.getPersonRow: returned row should have the proper structure for a person of type manager', function(done) {
					var test = this.test,
						result = getPersonRow(_courses, _personManager);

					console.log(test.title + ': result', JSON.stringify(result));
					
					expect(result).to.not.be.undefined;
					expect(result).to.be.an('object');

					var rowExpectedKeys = [
						'isChild'
						, 'id'
						, 'show'
						, 'category'
						, 'summary'
					];

					// we are expecting the row to have a cell for each course and also for each course.los
					_.each(_courses, function(course) {
						rowExpectedKeys.push(course.id);
						_.each(course.los, function(lo) {
							rowExpectedKeys.push(course.id + '_' + lo.id);
						});
					});

					console.log(test.title + ': rowExpectedKeys', rowExpectedKeys);
					console.log(test.title + ': result keys', Object.keys(result));
					
					expect(result).to.have.all.keys(rowExpectedKeys);
					done();
				});

				it('service.private.getPersonRow: returned row should have the proper structure for a person of type crew', function(done) {
					var test = this.test,
						result = getPersonRow(_courses, _personCrew);

					console.log(test.title + ': result', JSON.stringify(result));

					expect(result).to.not.be.undefined;
					expect(result).to.be.an('object');

					var rowExpectedKeys = [
						'isChild'
						, 'id'
						, 'show'
						, 'category'
						, 'summary'
					];

					// we are expecting the row to have a cell for each course and also for each course.los
					_.each(_courses, function(course) {
						rowExpectedKeys.push(course.id);
						_.each(course.los, function(lo) {
							rowExpectedKeys.push(course.id + '_' + lo.id);
						});
					});

					console.log(test.title + ': rowExpectedKeys', rowExpectedKeys);
					console.log(test.title + ': result keys', Object.keys(result));
					
					expect(result).to.have.all.keys(rowExpectedKeys);
					done();
				});

				// data checks
				it('service.private.getPersonRow: returned row should have valid row summary structure for a person of type manager', function(done) {
					var test = this.test,
						result = getPersonRow(_courses, _personManager);

					//console.log(test.title + ': result', JSON.stringify(result));
					console.log(test.title + ': result.summary', JSON.stringify(result.summary));

					expect(result.summary).to.not.be.undefined;
					expect(result.summary).to.have.all.keys([
						'key', 'locked', 'value', 'suffix',
						'css', 'cssValueSpan'
					]);

					var expectedCell = _expectedData.manager.row.summary;
					expect(result.summary.key).to.equal(expectedCell.key);
					expect(result.summary.locked).to.equal(expectedCell.locked);
					//expect(result.summary.suffix).to.equal(expectedCell.suffix);
					
					done();
				});

				it('service.private.getPersonRow: returned row should have valid row summary structure for a person of type crew', function(done) {
					var test = this.test,
						result = getPersonRow(_courses, _personCrew);

					console.log(test.title + ': result', JSON.stringify(result));
					console.log(test.title + ': result.summary', JSON.stringify(result.summary));
					
					expect(result.summary).to.not.be.undefined;
					expect(result.summary).to.have.all.keys([
						'key', 'locked', 'value', 'suffix',
						'css', 'cssValueSpan'
					]);

					var expectedCell = _expectedData.crew.row.summary;
					expect(result.summary.key).to.equal(expectedCell.key);
					expect(result.summary.locked).to.equal(expectedCell.locked);
					//expect(result.summary.suffix).to.equal(expectedCell.suffix);
					
					done();
				});

				it('service.private.getPersonRow: returned row should have valid course cells structures for a person of type manager', function(done) {
					var test = this.test,
						result = getPersonRow(_courses, _personManager);

					//console.log(test.title + ': result', JSON.stringify(result));

					_.each(_courses, function(course) {
						var expectedCell = _expectedData.manager.row[course.id],
							courseCell = result[course.id];
						
						console.log(test.title + ': expectedCell: ' + JSON.stringify(expectedCell) + ' courseCell:', JSON.stringify(courseCell));
						// {"isGroup":true,"key":"welcome-to-dd","id":"welcome-to-dd","value":0,"suffix":"%"}
						console.log(test.title + ': expectedCell keys: ' + Object.keys(expectedCell) + ' courseCell keys:', Object.keys(courseCell));
						
						expect(courseCell).to.not.be.undefined;
						expect(courseCell.isGroup).to.equal(expectedCell.isGroup);
						expect(courseCell.key).to.equal(expectedCell.key);
						expect(courseCell.id).to.equal(expectedCell.id);
						expect(courseCell.suffix).to.equal(expectedCell.suffix);

						if (courseCell.value === reportConfig.notApplicableLabels.personRow) {
							expect(courseCell.isNA).to.equal(true);
						}
					});
					
					done();
				});

				it('service.private.getPersonRow: returned row should have valid course cells values for a person of type crew', function(done) {
					var test = this.test,
						result = getPersonRow(_courses, _personCrew);

					//console.log(test.title + ': result', JSON.stringify(result));

					_.each(_courses, function(course) {
						var expectedCell = _expectedData.crew.row[course.id],
							courseCell = result[course.id];
						
						console.log(test.title + ': expectedCell: ' + JSON.stringify(expectedCell) + ' courseCell:', JSON.stringify(courseCell));

						expect(courseCell).to.not.be.undefined;
						expect(courseCell.isGroup).to.equal(expectedCell.isGroup);
						expect(courseCell.key).to.equal(expectedCell.key);
						expect(courseCell.id).to.equal(expectedCell.id);
						expect(courseCell.suffix).to.equal(expectedCell.suffix);

						if (courseCell.value === reportConfig.notApplicableLabels.aggregateSegmentByStore) {
							expect(courseCell.isNA).to.equal(true);
						}
					});
					
					done();
				});
			});

			// service.private.aggregateSegmentByStore tests
			describe('service.private.aggregateSegmentByStore', function() {
				var aggregateSegmentByStore = service.private.aggregateSegmentByStore;
				// aggregateSegmentByStore tests
				it('service.private.aggregateSegmentByStore: should not throw', function(done) {
					this.timeout(3000);
					var test = this.test,
						fn = function () { 
							try {
								aggregateSegmentByStore(_refColGroup, _refRowGroup, _refModel);
							} catch (e) {
								console.log(test.title + ': UNEXPECTED exception thrown', e);
								debugger;
								throw _refErr;
							}
						};

					// expect to not throw
					expect(fn).to.not.throw(_refErr);
					done();
				});

				it('service.private.aggregateSegmentByStore: should throw when invalid arguments', function(done) {
					this.timeout(3000);
					var test = this.test,
						fn = function () { 
							try {
								aggregateSegmentByStore(); // calling without argument should cause it to throw
							} catch (e) {
								console.log(test.title + ': Expected exception thrown', e);
								throw _refErr;
							}
						};

					// expect to throw
					expect(fn).to.throw(_refErr);
					done();
				});

				// data checks
				it('service.private.aggregateSegmentByStore: result should be the correct aggregated value by store', function(done) {
					var test = this.test;

					// test all courses for one store
					_.each(_refColGroups, function(colGroup) {
						var result = aggregateSegmentByStore(colGroup, _refRowGroup, _refModel)
							, expectedCell = _expectedData.store.row[colGroup.id];
						console.log(test.title + ': course ' + colGroup.id + ' result: ' + result, result === expectedCell.value);

						expect(result).to.equal(expectedCell.value);
					});

					done();
				});
			});

			// service.private.aggregateLoByStore tests
			describe('service.private.aggregateLoByStore', function() {
				var aggregateLoByStore = service.private.aggregateLoByStore;
				// aggregateLoByStore tests
				it('service.private.aggregateLoByStore: should not throw', function(done) {
					this.timeout(3000);
					var test = this.test,
						fn = function () { 
							try {
								// var cell = {
								// 	value: reportConfig.notApplicableLabels.aggregateLoByStore
								// };

								// var courseLo = _courses[0].los[0];
								// aggregateLoByStore(courseLo, _refRowGroup);

								var colChild = _.find(_refModel.columns, function(col) {
									return col.parentId === _refColGroup.id;
								});

								aggregateLoByStore(colChild, _refRowGroup, _refModel);
							} catch (e) {
								console.log(test.title + ': UNEXPECTED exception thrown', e);
								debugger;
								throw _refErr;
							}
						};

					// expect to not throw
					expect(fn).to.not.throw(_refErr);
					done();
				});
				
				it('service.private.aggregateLoByStore: should throw when invalid arguments', function(done) {
					this.timeout(3000);
					var test = this.test,
						fn = function () { 
							try {
								aggregateLoByStore(); // calling without argument should cause it to throw
							} catch (e) {
								console.log(test.title + ': Expected exception thrown', e);
								throw _refErr;
							}
						};

					// expect to throw
					expect(fn).to.throw(_refErr);
					done();
				});

				// data checks
				it('service.private.aggregateLoByStore: result should be the correct aggregated value by store', function(done) {
					var test = this.test;

					// test all courses for one store
					_.each(_refColGroups, function(colGroup) {
						// test all los for one course

						var courseLos = _.filter(_refModel.columns, function(col) {
							return col.isChild && col.parentId === colGroup.id;
						});

						_.each(courseLos, function(colChild) {

							var result = aggregateLoByStore(colChild, _refRowGroup, _refModel)
								, expectedCell = _expectedData.store.aggregateLoByStore[colChild.id]
								;

							console.log(test.title + ': course: ' + colGroup.id + ' lo: ' + colChild.id
								+ ' expectedCell: ' + JSON.stringify(expectedCell) + ' result: ' + result, result === expectedCell.value);

							expect(result).to.equal(expectedCell.value);
						});
					});

					done();
				});
			});

		});

		mocha.run();
	});

}());
