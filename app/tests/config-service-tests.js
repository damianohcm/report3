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
                    'getEnvironment',
                    'getCommonConfig',  
                    'getCustomReportConfig', 
                    'getCustomReportWizardConfig',
                    'getReportConfig',
                    'getSavedReportsConfig',
                    'getBrands', 
                    'getBrandConfig', 
                    'setParam', 
                    'setSessionParam', 
                    'sessionParamsSet',
                    'apiEndPoints'
                ]);

                done();
            });

			// respondTo tests
			it('configService should respond to', function(done) {
				expect(configService).to.respondTo('enableLog');
				expect(configService).to.respondTo('getEnvironment');
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
                        'logEnabled', 
                        'peopleOrgStrategy'
                    ]);

                    expect(commonConfig.totCompletionTitlePrefix).to.be.a('string');
                    expect(commonConfig.apiBaseUrl).to.be.a('string');
                    expect(commonConfig.apiPaths).to.be.an('object');
                    expect(commonConfig.params).to.be.an('object');
                    expect(commonConfig.sessionParams).to.be.an('object');
                    expect(commonConfig.logEnabled).to.be.a('boolean');
                    expect(commonConfig.peopleOrgStrategy).to.be.an('object');
                    
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
                            'customReportStoresList', 
                            'customReportLOSList',
                            'customReport',
                            'customReportList',
                            'customReportStores'
                        ]);

                        expect(apiPaths.reportSegments).to.be.a('string');
                        expect(apiPaths.reportStores).to.be.a('string');
                        expect(apiPaths.customReportStoresList).to.be.a('string');
                        expect(apiPaths.customReportLOSList).to.be.a('string');
                        expect(apiPaths.customReport).to.be.a('string');
                        expect(apiPaths.customReportList).to.be.a('string');
                        expect(apiPaths.customReportStores).to.be.a('string');

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
                            'reportType', 
                            'reportId',
                            'reportParamsModel'
                        ]);

                        expect(params.brand).to.be.a('string');
                        expect(params.reportType).to.be.a('string');
                        expect(params.reportId).to.be.a('string');
                        expect(params.reportParamsModel).to.be.a('string');

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

                // peopleOrgStrategy tests
                describe('configService: commonConfig.peopleOrgStrategy', () => {
                    const peopleOrgStrategy = commonConfig.peopleOrgStrategy;

                    it('commonConfig.peopleOrgStrategy: should have valid properties', function(done) {
                        
                        console.log('commonConfig.peopleOrgStrategy keys', Object.keys(peopleOrgStrategy));

                        expect(Object.keys(peopleOrgStrategy).length).to.equal(3);

                        done();
                    });
                });
            
			});

            // reportConfig tests
            describe('configService: reportConfig: tests', function() {
                var reportConfig = configService.getReportConfig();

                // reportConfig tests
                it('configService: reportConfig: should have valid properties', function(done) {
                    //console.log('reportConfig keys', Object.keys(reportConfig));

                    expect(reportConfig).to.have.all.keys([
                        'useTestData', 
                        'debug', 
                        'averageCalculationMode', 
                        'notApplicableLabels', 
                        'notApplicableIncludeInCalc', 
                        'colorPersonSegmentCell', 

                        'colSummaryHeaderMaxLength',
                        'colGroupHeaderMaxLength',
                        'colChildheaderMaxLength',
                        'rowGroupHeaderMaxLength',
                        'rowChildheaderMaxLength',

                        'displayPersonHireDate',

                        'useFixedWidthForCols',
                        'colCategoryWidth',
                        'colSummaryWidth',
                        'colSegmentWidth',

                        'showAdditionalLoadingMessageAfter',
                        'additionalLoadingMessage'
                    ]);

                    expect(reportConfig.useTestData).to.be.a('boolean');
                    expect(reportConfig.debug).to.be.a('boolean');
                    expect(reportConfig.averageCalculationMode).to.be.a('string');

                    expect(reportConfig.notApplicableLabels).to.be.a('object');
                    expect(reportConfig.notApplicableIncludeInCalc).to.be.a('boolean');
                    expect(reportConfig.colorPersonSegmentCell).to.be.a('boolean');

                    expect(reportConfig.colSummaryHeaderMaxLength).to.be.a('number');
                    expect(reportConfig.colGroupHeaderMaxLength).to.be.a('number');
                    expect(reportConfig.colChildheaderMaxLength).to.be.a('number');
                    expect(reportConfig.rowGroupHeaderMaxLength).to.be.a('number');
                    expect(reportConfig.rowChildheaderMaxLength).to.be.a('number');

                    expect(reportConfig.colSummaryHeaderMaxLength).to.be.at.least(1);
                    expect(reportConfig.colGroupHeaderMaxLength).to.be.at.least(1);
                    expect(reportConfig.colChildheaderMaxLength).to.be.at.least(1);
                    expect(reportConfig.rowGroupHeaderMaxLength).to.be.at.least(1);
                    expect(reportConfig.rowChildheaderMaxLength).to.be.at.least(1);
                    
                    expect(reportConfig.displayPersonHireDate).to.be.a('boolean');

                    expect(reportConfig.useFixedWidthForCols).to.be.a('boolean');
                    expect(reportConfig.colCategoryWidth).to.be.a('string').to.have.length.above(4);
                    expect(reportConfig.colSummaryWidth).to.be.a('string').to.have.length.above(4);
                    expect(reportConfig.colSegmentWidth).to.be.a('string').to.have.length.above(4);

                    expect(reportConfig.showAdditionalLoadingMessageAfter).to.be.a('number').to.be.at.least(1);
                    expect(reportConfig.additionalLoadingMessage).to.be.a('string').to.have.length.above(20);

                    // notApplicableLabels tests
                    describe('configService: reportConfig.notApplicableLabels: tests', function() {
                        var notApplicableLabels = reportConfig.notApplicableLabels;

                        it('configService: reportConfig: notApplicableLabels: should have valid properties', function(notApplicableLabelsDone) {
                            //console.log('notApplicableLabels keys', Object.keys(reportConfig));
                            expect(notApplicableLabels).to.have.all.keys([
                                'aggregateSegmentByStore', 
                                'aggregateLoByStore', 
                                'personRow'
                            ]);

                            expect(notApplicableLabels.aggregateSegmentByStore).to.be.a('string').to.have.length.above(0);
                            expect(notApplicableLabels.aggregateLoByStore).to.be.a('string').to.have.length.above(0);
                            expect(notApplicableLabels.personRow).to.be.a('string').to.have.length.above(0);

                            notApplicableLabelsDone();
                        });
                    });
                    
                    done();
                });
            });

            // customReportWizardConfig tests
            describe('configService: customReportWizardConfig: tests', function() {
                var customReportWizardConfig = configService.getCustomReportWizardConfig();

                // customReportWizardConfig tests
                it('configService: customReportWizardConfig: should have valid properties', function(done) {
                    //console.log('customReportWizardConfig keys', Object.keys(customReportWizardConfig));

                    expect(customReportWizardConfig).to.have.all.keys([
                        'useTestData',
                        'wizardTitle',
                        'maxStores',
                        'maxStoresLimitType', 
                        'maxCourses',
                        'maxCoursesLimitType'
                    ]);

                    expect(customReportWizardConfig.useTestData).to.be.a('boolean'); 
                    expect(customReportWizardConfig.wizardTitle).to.be.a('string').to.have.length.above(5); 
                    expect(customReportWizardConfig.maxStores).to.be.a('number');
                    expect(customReportWizardConfig.maxStores).to.be.at.least(1);

                    expect(customReportWizardConfig.maxStoresLimitType).to.be.a('number');
                    expect([1, 2]).to.contain(customReportWizardConfig.maxStoresLimitType);

                    expect(customReportWizardConfig.maxCourses).to.be.a('number');
                    expect(customReportWizardConfig.maxCourses).to.be.at.least(1);

                    expect(customReportWizardConfig.maxCoursesLimitType).to.be.a('number');
                    expect([1, 2]).to.contain(customReportWizardConfig.maxCoursesLimitType);
                    
                    
                    done();
                });
            });

            // customReportConfig tests
            describe('configService: customReportConfig: tests', function() {
                var customReportConfig = configService.getCustomReportConfig();

                // customReportConfig tests
                it('configService: customReportConfig: should have valid properties', function(done) {
                    //console.log('customReportConfig keys', Object.keys(customReportConfig));

                    expect(customReportConfig).to.have.all.keys([
                        'useTestData', 
                        'debug', 
                        'averageCalculationMode', 
                        'notApplicableLabels', 
                        'notApplicableIncludeInCalc', 
                        'colorPersonSegmentCell', 

                        'colSummaryHeaderMaxLength',
                        'colGroupHeaderMaxLength',
                        'colChildheaderMaxLength',
                        'rowGroupHeaderMaxLength',
                        'rowChildheaderMaxLength',

                        'displayPersonHireDate',

                        'useFixedWidthForCols',
                        'colCategoryWidth',
                        'colSummaryWidth',
                        'colSegmentWidth',

                        'showAdditionalLoadingMessageAfter',
                        'additionalLoadingMessage'
                    ]);

                    expect(customReportConfig.useTestData).to.be.a('boolean');
                    expect(customReportConfig.debug).to.be.a('boolean');
                    expect(customReportConfig.averageCalculationMode).to.be.a('string');

                    expect(customReportConfig.notApplicableLabels).to.be.a('object');
                    expect(customReportConfig.notApplicableIncludeInCalc).to.be.a('boolean');
                    expect(customReportConfig.colorPersonSegmentCell).to.be.a('boolean');

                    expect(customReportConfig.colSummaryHeaderMaxLength).to.be.a('number');
                    expect(customReportConfig.colGroupHeaderMaxLength).to.be.a('number');
                    expect(customReportConfig.colChildheaderMaxLength).to.be.a('number');
                    expect(customReportConfig.rowGroupHeaderMaxLength).to.be.a('number');
                    expect(customReportConfig.rowChildheaderMaxLength).to.be.a('number');

                    expect(customReportConfig.colSummaryHeaderMaxLength).to.be.at.least(1);
                    expect(customReportConfig.colGroupHeaderMaxLength).to.be.at.least(1);
                    expect(customReportConfig.colChildheaderMaxLength).to.be.at.least(1);
                    expect(customReportConfig.rowGroupHeaderMaxLength).to.be.at.least(1);
                    expect(customReportConfig.rowChildheaderMaxLength).to.be.at.least(1);
                    
                    expect(customReportConfig.displayPersonHireDate).to.be.a('boolean');

                    expect(customReportConfig.useFixedWidthForCols).to.be.a('boolean');
                    expect(customReportConfig.colCategoryWidth).to.be.a('string').to.have.length.above(4);
                    expect(customReportConfig.colSummaryWidth).to.be.a('string').to.have.length.above(4);
                    expect(customReportConfig.colSegmentWidth).to.be.a('string').to.have.length.above(4);

                    expect(customReportConfig.showAdditionalLoadingMessageAfter).to.be.a('number').to.be.at.least(1);
                    expect(customReportConfig.additionalLoadingMessage).to.be.a('string').to.have.length.above(20);

                    // notApplicableLabels tests
                    describe('configService: customReportConfig.notApplicableLabels: tests', function() {
                        var notApplicableLabels = customReportConfig.notApplicableLabels;

                        it('configService: customReportConfig: notApplicableLabels: should have valid properties', function(notApplicableLabelsDone) {
                            //console.log('notApplicableLabels keys', Object.keys(customReportConfig));
                            expect(notApplicableLabels).to.have.all.keys([
                                'aggregateSegmentByStore', 
                                'aggregateLoByStore', 
                                'personRow'
                            ]);

                            expect(notApplicableLabels.aggregateSegmentByStore).to.be.a('string').to.have.length.above(0);
                            expect(notApplicableLabels.aggregateLoByStore).to.be.a('string').to.have.length.above(0);
                            expect(notApplicableLabels.personRow).to.be.a('string').to.have.length.above(0);

                            notApplicableLabelsDone();
                        });
                    });
            
                    done();
                });
            });

            // savedReportsConfig tests
            describe('configService: savedReportsConfig: tests', function() {
                var savedReportsConfig = configService.getSavedReportsConfig();

                // savedReportsConfig tests
                it('configService: savedReportsConfig: should have valid properties', function(done) {
                    //console.log('savedReportsConfig keys', Object.keys(savedReportsConfig));

                    expect(savedReportsConfig).to.have.all.keys([
                        'useTestData'
                    ]);

                    expect(savedReportsConfig.useTestData).to.be.a('boolean');
            
                    done();
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
                        'oneLevel',
                        'titleSuffix'
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
                        'oneLevel',
                        'titleSuffix'
                    ]);
                    
					done();
				});

            });

        });

        // apiEndPoints tests
        describe('configService.apiEndPoints', function() {
            var apiEndPoints = configService.apiEndPoints;

            // apiEndPoints tests
            it('apiEndPoints: shoudl repsond to', function(done) {
                expect(apiEndPoints).to.respondTo('segments');
                expect(apiEndPoints).to.respondTo('storesAndPeople');
                expect(apiEndPoints).to.respondTo('storesList');
                expect(apiEndPoints).to.respondTo('losList');

                done();
            });

            // apiEndPoints tests
            it('apiEndPoints.segments: should return correct value', function(done) {
                var apiBaseUrl = configService.getCommonConfig().apiBaseUrl;
                var expected = apiBaseUrl + '/api/curricula_report/v1/segments-list/15/?user=uJas34Df&format=json';
                var result = apiEndPoints.segments(15, 'uJas34Df', 'asdcef');
                //console.log('result', result);
                expect(result).to.be.a('string');
                expect(result).to.equal(expected);
                
                done();
            });
            it('apiEndPoints.storesAndPeople: should return correct value', function(done) {
                var apiBaseUrl = configService.getCommonConfig().apiBaseUrl;
                var expected = apiBaseUrl + '/api/curricula_report/v1/stores/?lpath_id=15&user=uJas34Df&format=json';
                var result = apiEndPoints.storesAndPeople(15, 'uJas34Df', 'asdcef');
                //console.log('result', result);
                expect(result).to.be.a('string');
                expect(result).to.equal(expected);
                
                done();
            });
            it('apiEndPoints.storesList: should return correct value', function(done) {
                var apiBaseUrl = configService.getCommonConfig().apiBaseUrl;
                var expected = apiBaseUrl + '/api/curricula_report/v1/stores-list/?user=15&format=json';
                var result = apiEndPoints.storesList(15, 'uJas34Df');
                console.log('result', result);
                expect(result).to.be.a('string');
                expect(result).to.equal(expected);
                
                done();
            });
            it('apiEndPoints.losList: should return correct value', function(done) {
                var apiBaseUrl = configService.getCommonConfig().apiBaseUrl;
                var expected = apiBaseUrl + '/api/curricula_report/v1/lo-list/?format=json';
                var result = apiEndPoints.losList();
                console.log('result', result);
                expect(result).to.be.a('string');
                expect(result).to.equal(expected);
                
                done();
            });
        });


		mocha.run();
    });

}());
