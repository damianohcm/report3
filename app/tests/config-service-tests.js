/*global requirejs, describe, it, chai, mocha*/
/* eslint-disable max-len */
(function(){

	requirejs([
		'../services/configService.js',
		'../services/utilsService.js'
	], function() {
		mocha.setup('bdd');

		var configService = window.services.configService(),
			utilsService = window.services.utilsService(configService);
		
        configService.enableLog();
        var expect = chai.expect,
			_refErr = new Error('Unit test reference error');

		//utilsService.safeLog('loaded', Object.keys(configService), true);

        /* tests */
		describe('configService', function() {

			it('configService: should not be undefined', function(done) {
				expect(configService).to.not.be.undefined;
                done();
			});

            // properties
			it('configService: should have correct properties', function(done) {
                
                //console.log('configService: configService keys', Object.keys(configService));

                expect(configService).to.have.all.keys([
                    'enableLog', 
                    'getCommonConfig', 
                    'getBrands', 
                    'getBrandConfig', 
                    'setParam', 
                    'setSessionParam', 
                    'sessionParamsSet'
                ]);

                done();
            });

			// respondTo tests
			it('configService should respond to', function(done) {
				expect(configService).to.respondTo('enableLog');
				expect(configService).to.respondTo('getCommonConfig');
				expect(configService).to.respondTo('getBrands');
				expect(configService).to.respondTo('getBrandConfig');
				expect(configService).to.respondTo('setParam');
				expect(configService).to.respondTo('setSessionParam');
				done();
			});

            // getCommonConfig tests
			describe('configService.getCommonConfig', function() {
				var getCommonConfig = configService.getCommonConfig;

                // configService tests
				it('configService.getCommonConfig: should not throw', function(done) {
					var fn = function () { 
						try {
							getCommonConfig();
						} catch (e) {
							throw _refErr;
						}
					};

					// expect to not throw
					expect(fn).to.not.throw(_refErr);
					done();
				});
            });

            // getBrands tests
			describe('configService.getBrands', function() {
				var getBrands = configService.getBrands;

                // configService tests
				it('configService.getBrands: should not throw', function(done) {
					var fn = function () { 
						try {
							getBrands();
						} catch (e) {
							throw _refErr;
						}
					};

					// expect to not throw
					expect(fn).to.not.throw(_refErr);
					done();
				});
            });

            // commonConfig tests
            describe('configService: commonConfig: tests', function() {
                var commonConfig = configService.getCommonConfig();

                // commonConfig tests
				it('configService: commonConfig: should have valid properties', function(done) {
					//console.log('commonConfig keys', Object.keys(commonConfig));

                    expect(commonConfig).to.have.all.keys([
                        'totCompletionTitlePrefix', 
                        'apiBaseUrl', 
                        'apiPaths', 
                        'params', 
                        'sessionParams', 
                        'logEnabled'
                    ]);

                    expect(commonConfig.totCompletionTitlePrefix).to.be.a('string');
                    expect(commonConfig.apiBaseUrl).to.be.a('string');
                    expect(commonConfig.apiPaths).to.be.an('object');
                    expect(commonConfig.params).to.be.an('object');
                    expect(commonConfig.sessionParams).to.be.an('object');
                    expect(commonConfig.logEnabled).to.be.a('boolean');
                    
					done();
				});

                // apiPaths tests
                describe('configService: commonConfig.apiPaths', function() {
                    var apiPaths = commonConfig.apiPaths;

                    it('commonConfig.apiPaths: should have valid properties', function(done) {
                        
                        //console.log('commonConfig.apiPaths keys', Object.keys(apiPaths));

                        expect(apiPaths).to.have.all.keys([
                            'reportSegments', 
                            'reportStores', 
                            'customReportStoresLookup', 
                            'customReportLOsLookup'
                        ]);

                        expect(apiPaths.reportSegments).to.be.a('string');
                        expect(apiPaths.reportStores).to.be.a('string');
                        expect(apiPaths.customReportStoresLookup).to.be.a('string');
                        expect(apiPaths.customReportLOsLookup).to.be.a('string');

                        done();
                    });
                });

                // params tests
                describe('configService: commonConfig.params', function() {
                    var params = commonConfig.params;

                    it('commonConfig.params: should have valid properties', function(done) {
                        
                        //console.log('commonConfig.params keys', Object.keys(params));

                        expect(params).to.have.all.keys([
                            'brand', 
                            'reportId', 
                            'newCustomReportModel'
                        ]);

                        expect(params.brand).to.be.a('string');
                        expect(params.reportId).to.be.a('string');
                        expect(params.newCustomReportModel).to.be.a('string');

                        done();
                    });
                });

                // sessionParams tests
                describe('configService: commonConfig.sessionParams', function() {
                    var sessionParams = commonConfig.sessionParams;

                    it('commonConfig.sessionParams: should have valid properties', function(done) {
                        
                        console.log('commonConfig.sessionParams keys', Object.keys(sessionParams));

                        expect(sessionParams).to.have.all.keys([
                            'token', 
                            'compKey', 
                            'csBaseUrl', 
                            'lang', 
                            'organization'
                        ]);

                        expect(sessionParams.token).to.be.a('string');
                        expect(sessionParams.compKey).to.be.a('string');
                        expect(sessionParams.csBaseUrl).to.be.a('string');
                        expect(sessionParams.lang).to.be.a('string');
                        expect(sessionParams.organization).to.be.a('string');

                        done();
                    });
                });
			});

            // brands tests
            describe('configService: brands: tests', function() {
                var brands = configService.getBrands();

                // brands tests
				it('configService: brands: should be an array and contain number of expected brands', function(done) {
					expect(brands).to.be.an('array');
                    expect(brands.length).to.equal(2);
					done();
				});

                // brands tests
				it('configService: brands 1: should have all properties', function(done) {
					
                    var brand = brands[0];

                    expect(brand).to.have.all.keys([
                        'key', 
                        'title', 
                        'reportStrategies'
                    ]);

                    expect(brand.key).to.be.a('string');
                    expect(brand.title).to.be.a('string');
                    expect(brand.reportStrategies).to.be.an('object');

                    expect(brand.reportStrategies).to.have.all.keys([
                        'learning-path', 
                        'new-and-trending', 
                        'custom'
                    ]);

                    expect(brand.reportStrategies['learning-path']).to.have.all.keys([
                        'pathId', 
                        'title', 
                        'oneLevel'
                    ]);
                    
					done();
				});

                it('configService: brands 2: should have all properties', function(done) {
					
                    var brand = brands[1];

                    expect(brand).to.have.all.keys([
                        'key', 
                        'title', 
                        'reportStrategies'
                    ]);

                    expect(brand.key).to.be.a('string');
                    expect(brand.title).to.be.a('string');
                    expect(brand.reportStrategies).to.be.an('object');

                    expect(brand.reportStrategies).to.have.all.keys([
                        'learning-path', 
                        'new-and-trending', 
                        'custom'
                    ]);

                    expect(brand.reportStrategies['learning-path']).to.have.all.keys([
                        'pathId', 
                        'title', 
                        'oneLevel'
                    ]);
                    
					done();
				});

            });

        });


		mocha.run();
    });

}());
