/*global requirejs, describe, it, chai, mocha*/
/* eslint-disable max-len */
(function(){

	requirejs(['../services/utilsService.js', '../services/reportService.js'], function() {
		mocha.setup('bdd');

		var utilsService = window.services.utilsService()
			, reportService = window.services.reportService(utilsService);
		utilsService.safeLog('loaded');

		var expect = chai.expect,
			_refErr = new Error('Unit test reference error'),
			_refModel = JSON.parse('{"columns":[{"id":"category","key":"category","position":0,"show":true,"locked":true,"css":"th-category","name":""},{"id":"summary","key":"summary","position":1,"show":true,"locked":true,"css":"th-summary","name":"Tot Completion %"},{"isGroup":true,"id":"welcome-to-dd","key":"welcome-to-dd","show":true,"position":2,"locked":false,"css":"th-course","name":"Welcome to Dunkin\' Donuts!"},{"isChild":true,"parentId":"welcome-to-dd","id":"welcome-1","key":"welcome-to-dd_welcome-1","position":3,"locked":false,"calculate":true,"css":"th-section","name":"Introduction","_show":false},{"isChild":true,"parentId":"welcome-to-dd","id":"welcome-2","key":"welcome-to-dd_welcome-2","position":4,"locked":false,"calculate":true,"css":"th-section","name":"History","_show":false},{"isChild":true,"parentId":"welcome-to-dd","id":"welcome-3","key":"welcome-to-dd_welcome-3","position":5,"locked":false,"calculate":true,"css":"th-section","name":"Future","_show":false},{"isGroup":true,"id":"guest-services","key":"guest-services","show":true,"position":6,"locked":false,"css":"th-course","name":"Guest Services"},{"isChild":true,"parentId":"guest-services","id":"guest-services-1","key":"guest-services_guest-services-1","position":7,"locked":false,"calculate":true,"css":"th-section","name":"Guest First Commitment","_show":false},{"isChild":true,"parentId":"guest-services","id":"guest-services-2","key":"guest-services_guest-services-2","position":8,"locked":false,"calculate":true,"css":"th-section","name":"The Six Steps of Guest Services","_show":false},{"isChild":true,"parentId":"guest-services","id":"guest-services-3","key":"guest-services_guest-services-3","position":9,"locked":false,"calculate":true,"css":"th-section","name":"Serving Guest with Disabilities","_show":false},{"isChild":true,"parentId":"guest-services","id":"guest-services-4","key":"guest-services_guest-services-4","position":10,"locked":false,"calculate":true,"css":"th-section","name":"Meeting Guest Expectations","_show":false},{"isGroup":true,"id":"crew-only","key":"crew-only","show":true,"position":11,"locked":false,"css":"th-course","name":"Crew only"},{"isChild":true,"parentId":"crew-only","id":"crew-only-1","key":"crew-only_crew-only-1","position":12,"locked":false,"calculate":true,"css":"th-section","name":"Crew Beginners","_show":false},{"isChild":true,"parentId":"crew-only","id":"crew-only-2","key":"crew-only_crew-only-2","position":13,"locked":false,"calculate":true,"css":"th-section","name":"Crew Intermediary","_show":false},{"isChild":true,"parentId":"crew-only","id":"crew-only-3","key":"crew-only_crew-only-3","position":14,"locked":false,"calculate":true,"css":"th-section","name":"Crew Advanced","_show":false}],"result":{"tot":10,"rows":[{"isGroup":true,"id":302068,"show":true,"isCollapsed":true,"children":[{"id":6543,"isChild":true,"show":true,"category":{"key":"category","locked":true,"value":"Ella Cunningham","value2":"Manager"},"summary":{"key":"summary","locked":true,"value":0,"suffix":"%"},"welcome-to-dd":{"isGroup":true,"key":"welcome-to-dd","id":"welcome-to-dd","value":0,"suffix":"%"},"welcome-to-dd_welcome-1":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"welcome-to-dd","id":"welcome-1","key":"welcome-to-dd_welcome-1"},"welcome-to-dd_welcome-2":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"welcome-to-dd","id":"welcome-2","key":"welcome-to-dd_welcome-2"},"welcome-to-dd_welcome-3":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"welcome-to-dd","id":"welcome-3","key":"welcome-to-dd_welcome-3"},"guest-services":{"isGroup":true,"key":"guest-services","id":"guest-services","value":0,"suffix":"%"},"guest-services_guest-services-1":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"guest-services","id":"guest-services-1","key":"guest-services_guest-services-1"},"guest-services_guest-services-2":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"guest-services","id":"guest-services-2","key":"guest-services_guest-services-2"},"guest-services_guest-services-3":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"guest-services","id":"guest-services-3","key":"guest-services_guest-services-3"},"guest-services_guest-services-4":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"guest-services","id":"guest-services-4","key":"guest-services_guest-services-4"},"crew-only":{"isGroup":true,"key":"crew-only","id":"crew-only","value":"N/A","suffix":"","isNA":true},"crew-only_crew-only-1":{"isChild":true,"realValue":-1,"value":"N/A","css":"col-child na","parentId":"crew-only","id":"crew-only-1","key":"crew-only_crew-only-1"},"crew-only_crew-only-2":{"isChild":true,"realValue":-1,"value":"N/A","css":"col-child na","parentId":"crew-only","id":"crew-only-2","key":"crew-only_crew-only-2"},"crew-only_crew-only-3":{"isChild":true,"realValue":-1,"value":"N/A","css":"col-child na","parentId":"crew-only","id":"crew-only-3","key":"crew-only_crew-only-3"},"parentId":302068},{"id":6544,"isChild":true,"show":true,"category":{"key":"category","locked":true,"value":"Max Garcia","value2":"Crew Member"},"summary":{"key":"summary","locked":true,"value":0,"suffix":"%"},"welcome-to-dd":{"isGroup":true,"key":"welcome-to-dd","id":"welcome-to-dd","value":0,"suffix":"%"},"welcome-to-dd_welcome-1":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"welcome-to-dd","id":"welcome-1","key":"welcome-to-dd_welcome-1"},"welcome-to-dd_welcome-2":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"welcome-to-dd","id":"welcome-2","key":"welcome-to-dd_welcome-2"},"welcome-to-dd_welcome-3":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"welcome-to-dd","id":"welcome-3","key":"welcome-to-dd_welcome-3"},"guest-services":{"isGroup":true,"key":"guest-services","id":"guest-services","value":0,"suffix":"%"},"guest-services_guest-services-1":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"guest-services","id":"guest-services-1","key":"guest-services_guest-services-1"},"guest-services_guest-services-2":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"guest-services","id":"guest-services-2","key":"guest-services_guest-services-2"},"guest-services_guest-services-3":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"guest-services","id":"guest-services-3","key":"guest-services_guest-services-3"},"guest-services_guest-services-4":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"guest-services","id":"guest-services-4","key":"guest-services_guest-services-4"},"crew-only":{"isGroup":true,"key":"crew-only","id":"crew-only","value":0,"suffix":"%"},"crew-only_crew-only-1":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"crew-only","id":"crew-only-1","key":"crew-only_crew-only-1"},"crew-only_crew-only-2":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"crew-only","id":"crew-only-2","key":"crew-only_crew-only-2"},"crew-only_crew-only-3":{"isChild":true,"realValue":-1,"value":"N/A","css":"col-child na","parentId":"crew-only","id":"crew-only-3","key":"crew-only_crew-only-3"},"parentId":302068}],"category":{"id":"category","key":"category","css":"category","locked":true,"value":"302068-Gallion Group, Inc."},"summary":{"id":"summary","key":"summary","locked":true,"value":0,"suffix":"%"},"welcome-to-dd":{"isGroup":true,"id":"welcome-to-dd","key":"welcome-to-dd","value":0,"suffix":""},"welcome-to-dd_welcome-1":{"isChild":true,"parentId":"welcome-to-dd","id":"welcome-1","key":"welcome-to-dd_welcome-1","value":0,"suffix":""},"welcome-to-dd_welcome-2":{"isChild":true,"parentId":"welcome-to-dd","id":"welcome-2","key":"welcome-to-dd_welcome-2","value":0,"suffix":""},"welcome-to-dd_welcome-3":{"isChild":true,"parentId":"welcome-to-dd","id":"welcome-3","key":"welcome-to-dd_welcome-3","value":0,"suffix":""},"guest-services":{"isGroup":true,"id":"guest-services","key":"guest-services","value":0,"suffix":""},"guest-services_guest-services-1":{"isChild":true,"parentId":"guest-services","id":"guest-services-1","key":"guest-services_guest-services-1","value":0,"suffix":""},"guest-services_guest-services-2":{"isChild":true,"parentId":"guest-services","id":"guest-services-2","key":"guest-services_guest-services-2","value":0,"suffix":""},"guest-services_guest-services-3":{"isChild":true,"parentId":"guest-services","id":"guest-services-3","key":"guest-services_guest-services-3","value":0,"suffix":""},"guest-services_guest-services-4":{"isChild":true,"parentId":"guest-services","id":"guest-services-4","key":"guest-services_guest-services-4","value":0,"suffix":""},"crew-only":{"isGroup":true,"id":"crew-only","key":"crew-only","value":0,"suffix":""},"crew-only_crew-only-1":{"isChild":true,"parentId":"crew-only","id":"crew-only-1","key":"crew-only_crew-only-1","value":0,"suffix":""},"crew-only_crew-only-2":{"isChild":true,"parentId":"crew-only","id":"crew-only-2","key":"crew-only_crew-only-2","value":0,"suffix":""},"crew-only_crew-only-3":{"isChild":true,"parentId":"crew-only","id":"crew-only-3","key":"crew-only_crew-only-3","value":0,"suffix":""}},{"isGroup":true,"id":302612,"show":true,"isCollapsed":true,"children":[{"id":4322,"isChild":true,"show":true,"category":{"key":"category","locked":true,"value":"John Doe","value2":"Manager"},"summary":{"key":"summary","locked":true,"value":0,"suffix":"%"},"welcome-to-dd":{"isGroup":true,"key":"welcome-to-dd","id":"welcome-to-dd","value":0,"suffix":"%"},"welcome-to-dd_welcome-1":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"welcome-to-dd","id":"welcome-1","key":"welcome-to-dd_welcome-1"},"welcome-to-dd_welcome-2":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"welcome-to-dd","id":"welcome-2","key":"welcome-to-dd_welcome-2"},"welcome-to-dd_welcome-3":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"welcome-to-dd","id":"welcome-3","key":"welcome-to-dd_welcome-3"},"guest-services":{"isGroup":true,"key":"guest-services","id":"guest-services","value":0,"suffix":"%"},"guest-services_guest-services-1":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"guest-services","id":"guest-services-1","key":"guest-services_guest-services-1"},"guest-services_guest-services-2":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"guest-services","id":"guest-services-2","key":"guest-services_guest-services-2"},"guest-services_guest-services-3":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"guest-services","id":"guest-services-3","key":"guest-services_guest-services-3"},"guest-services_guest-services-4":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"guest-services","id":"guest-services-4","key":"guest-services_guest-services-4"},"crew-only":{"isGroup":true,"key":"crew-only","id":"crew-only","value":"N/A","suffix":"","isNA":true},"crew-only_crew-only-1":{"isChild":true,"realValue":-1,"value":"N/A","css":"col-child na","parentId":"crew-only","id":"crew-only-1","key":"crew-only_crew-only-1"},"crew-only_crew-only-2":{"isChild":true,"realValue":-1,"value":"N/A","css":"col-child na","parentId":"crew-only","id":"crew-only-2","key":"crew-only_crew-only-2"},"crew-only_crew-only-3":{"isChild":true,"realValue":-1,"value":"N/A","css":"col-child na","parentId":"crew-only","id":"crew-only-3","key":"crew-only_crew-only-3"},"parentId":302612},{"id":4323,"isChild":true,"show":true,"category":{"key":"category","locked":true,"value":"Michael McDonald","value2":"Crew Member"},"summary":{"key":"summary","locked":true,"value":0,"suffix":"%"},"welcome-to-dd":{"isGroup":true,"key":"welcome-to-dd","id":"welcome-to-dd","value":0,"suffix":"%"},"welcome-to-dd_welcome-1":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"welcome-to-dd","id":"welcome-1","key":"welcome-to-dd_welcome-1"},"welcome-to-dd_welcome-2":{"isChild":true,"realValue":1,"value":"In Progress","css":"col-child in-progress","parentId":"welcome-to-dd","id":"welcome-2","key":"welcome-to-dd_welcome-2"},"welcome-to-dd_welcome-3":{"isChild":true,"realValue":0,"value":"Not Started","css":"","parentId":"welcome-to-dd","id":"welcome-3","key":"welcome-to-dd_welcome-3"},"guest-services":{"isGroup":true,"key":"guest-services","id":"guest-services","value":0,"suffix":"%"},"guest-services_guest-services-1":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"guest-services","id":"guest-services-1","key":"guest-services_guest-services-1"},"guest-services_guest-services-2":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"guest-services","id":"guest-services-2","key":"guest-services_guest-services-2"},"guest-services_guest-services-3":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"guest-services","id":"guest-services-3","key":"guest-services_guest-services-3"},"guest-services_guest-services-4":{"isChild":true,"realValue":2,"value":"Completed","css":"col-child completed","parentId":"guest-services","id":"guest-services-4","key":"guest-services_guest-services-4"},"crew-only":{"isGroup":true,"key":"crew-only","id":"crew-only","value":"N/A","suffix":"","isNA":true},"crew-only_crew-only-1":{"isChild":true,"realValue":-1,"value":"N/A","css":"col-child na","parentId":"crew-only","id":"crew-only-1","key":"crew-only_crew-only-1"},"crew-only_crew-only-2":{"isChild":true,"realValue":-1,"value":"N/A","css":"col-child na","parentId":"crew-only","id":"crew-only-2","key":"crew-only_crew-only-2"},"crew-only_crew-only-3":{"isChild":true,"realValue":-1,"value":"N/A","css":"col-child na","parentId":"crew-only","id":"crew-only-3","key":"crew-only_crew-only-3"},"parentId":302612}],"category":{"id":"category","key":"category","css":"category","locked":true,"value":"302612-Some other store, Inc."},"summary":{"id":"summary","key":"summary","locked":true,"value":0,"suffix":"%"},"welcome-to-dd":{"isGroup":true,"id":"welcome-to-dd","key":"welcome-to-dd","value":0,"suffix":""},"welcome-to-dd_welcome-1":{"isChild":true,"parentId":"welcome-to-dd","id":"welcome-1","key":"welcome-to-dd_welcome-1","value":0,"suffix":""},"welcome-to-dd_welcome-2":{"isChild":true,"parentId":"welcome-to-dd","id":"welcome-2","key":"welcome-to-dd_welcome-2","value":0,"suffix":""},"welcome-to-dd_welcome-3":{"isChild":true,"parentId":"welcome-to-dd","id":"welcome-3","key":"welcome-to-dd_welcome-3","value":0,"suffix":""},"guest-services":{"isGroup":true,"id":"guest-services","key":"guest-services","value":0,"suffix":""},"guest-services_guest-services-1":{"isChild":true,"parentId":"guest-services","id":"guest-services-1","key":"guest-services_guest-services-1","value":0,"suffix":""},"guest-services_guest-services-2":{"isChild":true,"parentId":"guest-services","id":"guest-services-2","key":"guest-services_guest-services-2","value":0,"suffix":""},"guest-services_guest-services-3":{"isChild":true,"parentId":"guest-services","id":"guest-services-3","key":"guest-services_guest-services-3","value":0,"suffix":""},"guest-services_guest-services-4":{"isChild":true,"parentId":"guest-services","id":"guest-services-4","key":"guest-services_guest-services-4","value":0,"suffix":""},"crew-only":{"isGroup":true,"id":"crew-only","key":"crew-only","value":0,"suffix":""},"crew-only_crew-only-1":{"isChild":true,"parentId":"crew-only","id":"crew-only-1","key":"crew-only_crew-only-1","value":0,"suffix":""},"crew-only_crew-only-2":{"isChild":true,"parentId":"crew-only","id":"crew-only-2","key":"crew-only_crew-only-2","value":0,"suffix":""},"crew-only_crew-only-3":{"isChild":true,"parentId":"crew-only","id":"crew-only-3","key":"crew-only_crew-only-3","value":0,"suffix":""}}]}}')
			
			;

        /* tests */
		describe('utilsService', function() {

			it('utilsService: should not be undefined', function(done) {
				expect(utilsService).to.not.be.undefined;
				done();
			});

			it('reportService: should not be undefined', function(done) {
				expect(reportService).to.not.be.undefined;
				done();
			});

			// respondTo tests
			it('utilsService should respond to', function(done) {
				expect(utilsService).to.respondTo('safeLog');
				expect(utilsService).to.respondTo('fastLoop');
				expect(utilsService).to.respondTo('getCsv');
				done();
			});

			// safeLog tests
			it('utilsService.safeLog: should not throw', function(done) {
				var fn = function () { 
					try {
						utilsService.safeLog('test');
					} catch (e) {
						throw _refErr;
					}
				};

				// expect to not throw
				expect(fn).to.not.throw(_refErr);
				done();
			});

			// fastLoop tests
			it('utilsService.fastLoop: should not throw', function(done) {
				var test = this.test;
				var fn = function () { 
					try {
						utilsService.fastLoop('abcde'.split(''), (item) => {
							console.log(test.title + ': fastLoop: item:', item);
						});
					} catch (e) {
						throw _refErr;
					}
				};

				// expect to not throw
				expect(fn).to.not.throw(_refErr);
				done();
			});

			// getCsv tests
			it('utilsService.getCsv: should not throw', function(done) {
				var test = this.test;
				var fn = function () { 
					try {
						var csvData = utilsService.getCsv(_refModel);
						console.log(test.title + ': csvData:', csvData);
					} catch (e) {
						debugger;
						throw _refErr;
					}
				};

				// expect to not throw
				expect(fn).to.not.throw(_refErr);
				done();
			});
		});
	

    	mocha.run();
	});
}());
