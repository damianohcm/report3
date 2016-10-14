(function() {

	window.services = window.services || {};
  
	window.services.reportService = function(utilsService) {
		var private = {
			debug: false
		};

		// helper to get % cell css
		private.getGroupCellCss = function(cell) {
			if (!cell || typeof cell !== 'object' || !cell.hasOwnProperty('value')) {
				throw Error('getGroupCellCss: Invalid argument');
			} else {
				if (isNaN(cell.value)) {
					return 'col-group na';
				} else if (cell.value === 100) {
					return 'col-group completed';
				} else if (cell.value > 0) {
					return 'col-group in-progress';
				} else {
					return 'col-group zero';
				}
			}
		};

		// helper to get % cell css
		private.getGroupSummaryCellCss = function(cell) {
			if (!cell || typeof cell !== 'object' || !cell.hasOwnProperty('value')) {
				throw Error('getGroupCellCss: Invalid argument');
			} else {
				if (isNaN(cell.value)) {
					return 'col-group summary na';
				} else if (cell.value === 100) {
					return 'col-group summary completed';
				} else if (cell.value > 0) {
					return 'col-group summary in-progress';
				} else {
					return 'col-group summary zero';
				}
			}
		};

		// helper to get % cell css
		private.getChildSummaryCellCss = function(cell) {
			if (!cell || typeof cell !== 'object' || !cell.hasOwnProperty('value')) {
				throw Error('getChildSummaryCellCss: Invalid argument');
			} else {
				if (isNaN(cell.value)) {
					return 'col-child summary na';
				} else if (cell.value === 100) {
					return 'col-child summary completed';
				} else if (cell.value > 0) {
					return 'col-child summary in-progress';
				} else {
					return 'col-child summary zero';
				}
			}
		};

		// helper to get person segment cell css
		private.getPersonSegmentCellCss = function(cell) {
			if (!cell || typeof cell !== 'object' || !cell.hasOwnProperty('value')) {
				throw Error('getPersonSegmentCellCss: Invalid argument');
			} else {
				if (isNaN(cell.value)) {
					return 'col-group person na';
				} else if (cell.value === 100) {
					return 'col-group person completed';
				} else if (cell.value > 0) {
					return 'col-group person in-progress';
				} else {
					return 'col-group person';
				}
			}
		};

		// strategy to lookup person learning object status by id
		private.personLoCells = {
			'-1': {
				isChild: true,
				realValue: -1,
				value: 'N/A',
				css: 'col-child na'
			},
			0: {
				isChild: true,
				realValue: 0,
				value: 'Not Started',
				css: 'col-child'
			},
			1: {
				isChild: true,
				realValue: 1,
				value: 'In Progress',
				css: 'col-child in-progress'
			},
			2: {
				isChild: true,
				realValue: 2,
				value: 'Completed',
				css: 'col-child completed'
			}
		};

		/**
		 * @method getPersonRow
		 * @description
		 * Gets a row for a specific person and her learning objects
		 */
		private.getPersonRow = function(courses, person) {
			if (!courses || typeof courses !== 'object' || courses.length < 1 
				|| !person || typeof person !== 'object' 
				|| !person.hasOwnProperty('name') || !person.hasOwnProperty('title') || !person.hasOwnProperty('los')) {
				throw Error('getPersonRow: Invalid arguments');
			} else {

				utilsService.safeLog('getPersonRow', courses.length + ' ' + person.name);
				utilsService.safeLog('getPersonRow courses', JSON.stringify(courses));
				utilsService.safeLog('getPersonRow person', JSON.stringify(person));

				// init row and add first column for store name
				var row = {
					id: person.id,
					isChild: true,
					show: true, /* by default this is true, but the row will be hidden because the parent store row will have isCollapsed true */
					category: {
						key: 'category',
						locked: true,
						value: person.name,
						value2: person.title,
					},
					summary: {
						key: 'summary',
						locked: true,
						value: 0,
						suffix: '%'
					}
				};

				// loop through each course
				utilsService.fastLoop(courses, function(course) {

					// init cell
					var cell = {
						isGroup: true,
						key: course.id,
						id: course.id,
						value: 0,
						suffix: '%'
					};

					// store cell into row using course.id as the row property
					row[cell.key] = cell;

					var currentLos = _.filter(person.los, function(lo) {
						return lo.segmentId === course.id;
					});

					if (currentLos && currentLos.length > 0) {
						// add child cells (visibility is controlled by the child columns)
						utilsService.fastLoop(course.los, function(lo) {
							var personLo = _.find(currentLos, function(plo) {
								return plo.id === lo.id;
							});
							
							// if person lo is missing, we assume N/A for the lo
							var loValue = personLo ? personLo.value : -1;

							// child cell
							var childCell = JSON.parse(JSON.stringify(private.personLoCells[loValue]));
							childCell.parentId = course.id;
							childCell.id = lo.id;
							childCell.key = childCell.parentId + '_' + childCell.id;
							row[childCell.key] = childCell;
						});
					} else {
						cell.isNA = true;
						cell.value = 'N/A';
						cell.suffix = '';

						utilsService.fastLoop(course.los, function(lo) {
							// child cell
							var childCell = JSON.parse(JSON.stringify(private.personLoCells[-1]));
							childCell.parentId = course.id;
							childCell.id = lo.id;
							childCell.key = childCell.parentId + '_' + childCell.id;
							// child cell
							row[childCell.key] = childCell;
						});
					}
				});

				row.summary.value = 0;

				return row;
			}
		};

		/**
		 * @method aggregateSegmentByStore
		 * @decription
		 * A colGroup represents a course (segment)
		 * A rowGroup represents a store 
		 */
		private.aggregateSegmentByStore = function(colGroup, rowGroup, model) {
			if (!colGroup || typeof colGroup !== 'object' || !colGroup.hasOwnProperty('id') || !colGroup.id
				|| !rowGroup || typeof rowGroup !== 'object' 
				|| !rowGroup.hasOwnProperty('children')) {
				throw Error('aggregateSegmentByStore: Invalid arguments');
			} else {
				// aggregate all people
				var peopleRows = rowGroup.children, // the rowGroup children rows are the people rows
					peopleRowsCount = peopleRows.length, 
					naCount = 0,
					aggregated = 0;

				utilsService.fastLoop(peopleRows, function(personRow) {
					// include row in calculation only if personRow.show is true
					if (personRow.show) {
						var currentLos = [];
						utilsService.fastLoop(Object.keys(personRow), function(k) {
							if (personRow[k].hasOwnProperty('parentId') && personRow[k].parentId === colGroup.id) {
								currentLos.push(personRow[k]);
							}
						});
						//utilsService.safeLog('aggregateSegmentByStore: personRow ' + personRow.id + ' currentLos', currentLos);

						var aggregatedLos = 0, losCount = currentLos.length, naLosCount = 0;

						utilsService.fastLoop(currentLos, function(lo) {

							// get column lookup
							var colChild = _.find(model.columns, function(colLo) {
								return colLo.id === lo.id;
							});

							// check if col.calculate is true
							if (colChild.calculate) {
								if (lo.realValue > -1) {
									aggregatedLos += lo.realValue === 2 ? 1 : 0;
								} else {
									naLosCount++;
									losCount = losCount > 0 ? --losCount : 0;
								}
							} else {
								utilsService.safeLog('aggregateSegmentByStore [' + colChild.id + ' is hidden]', colChild);
								losCount = losCount > 0 ? --losCount : 0;
							}
							
						});

						if (naLosCount !== currentLos.length) {
							aggregated += losCount > 0 ? Math.round(aggregatedLos / losCount * 100) : 0;
						} else {
							// if person does not have any learning objects for this course, reduce peopleRowsCount and increase naCount
							peopleRowsCount = peopleRowsCount > 0 ? --peopleRowsCount : 0;
							naCount++;
						}
					} else {
						// reduce people count for each row that is hidden and increase naCount
						peopleRowsCount = peopleRowsCount > 0 ? --peopleRowsCount : 0;
						naCount++;
					}
				});

				// calculate percentage
				//utilsService.safeLog('aggregateSegmentByStore peopleCount: ' + peopleRowsCount + ' naCount: ' + naCount, aggregated);
				var finalValue;
				if (naCount !== peopleRows.length) {
					finalValue = peopleRowsCount > 0 ? Math.round(aggregated / peopleRowsCount) : 0;
				} else {
					// if all people are N/A, then aggregated value is also N/A
					finalValue = 'N/A';
				}

				return finalValue;
			}
		};

		/**
		 * @method aggregateLoByStore
		 * A colChild represents a lo
		 * A rowGroup represents a store 
		 */
		private.aggregateLoByStore = function(colChild, rowGroup, model) {
			var peopleRows = rowGroup.children, // the rowGroup children rows are the people rows
				peopleRowsCount = peopleRows.length, 
				naCount = 0,
				aggregated = 0;

			// loop through all store people
			utilsService.fastLoop(peopleRows, function(personRow) {
				// include row in calculation only if personaRow.show is true
				if (personRow.show) {
					// find matching person lo
					// var currentLo = _.find(personRow, function(personLo) {
					// 	return personLo.id === colChild.id;
					// });
					var currentLo;
					Object.keys(personRow).every(function(k) {
						if (personRow[k].hasOwnProperty('id') && personRow[k].id === colChild.id) {
							currentLo = personRow[k];
							return false;
						}
						return true;
					});
					//utilsService.safeLog('aggregateLoByStore: personRow ' + personRow.id + ' lo ' + colChild.id + ' ', currentLo);

					if (currentLo && currentLo.realValue > -1) {
						// get column lookup
						var lookupLo = _.find(model.columns, function(colLo) {
							return colLo.id === currentLo.id;
						});

						// check if col.calculate is true
						if (lookupLo.calculate) {
							if (currentLo.realValue > -1) {
								aggregated += currentLo.realValue === 2 ? 1 : 0;
							}
						} else {
							utilsService.safeLog('aggregateSegmentByStore [' + lookupLo.id + ' is hidden]', lookupLo);
						}

					} else {
						// if person does not have learning object, reduce peopleRowsCount and increase naCount
						peopleRowsCount = peopleRowsCount > 0 ? --peopleRowsCount : 0;
						naCount++;
					}
				} else {
					// reduce people count for each row that is hidden and increase naCount
					peopleRowsCount = peopleRowsCount > 0 ? --peopleRowsCount : 0;
					naCount++;
				}
			});

			var finalValue = 0;
			if (naCount !== peopleRows.length) {
				finalValue = peopleRowsCount > 0 ? Math.round(aggregated / peopleRowsCount * 100) : 0;
			} else {
				// if all people are N/A, then aggregated value is also N/A
				finalValue = 'N/A';
			}
			return finalValue;
		};

		/**
		 * @method recalculate
		 * @decsription
		 */
		var recalculate = function(model) {
			utilsService.safeLog('recalculate - WORKING ON IMPLEMENTATION');
			//data = JSON.parse(JSON.stringify(data));
			var topLevelColumn = model.topLevelColumn;

			// get store rows (row groups)
			var rowGroups = _.filter(model.result.rows, function(row) {
				return row.isGroup;
			});

			// get segments columns (column groups)
			var colGroups = _.filter(model.columns, function(column) {
				return column.isGroup;
			});

			// begin: store (rowGroup) loop
			utilsService.fastLoop(rowGroups, function(rowGroup) {

				// include row in calculation only if rowGroup.show is true
				if (rowGroup.show) {

					// begin: course (colGroup) loop
					// aggregate each person data by course
					var coursesCount = colGroups.length, naCoursesCount = 0, storeAggregated = 0;

					utilsService.fastLoop(colGroups, function(colGroup) {

						// only include colGroup in calculation if group column is visible and we are not in detail view (topLevelColumn will be undefined)
						if (!topLevelColumn && colGroup.show || (topLevelColumn && topLevelColumn.id === colGroup.id)) {
							// get group cell (course cell)
							var groupCell = rowGroup[colGroup.key]
								, cellSuffix = '';

							// aggregate current segment
							groupCell.value = private.aggregateSegmentByStore(colGroup, rowGroup, model);
							groupCell.css = private.getGroupCellCss(groupCell);

							if (groupCell.value === 'N/A') {
								cellSuffix = '';
								naCoursesCount++;
								coursesCount = coursesCount > 0 ? --coursesCount : 0;
							} else {
								cellSuffix = '%';
								storeAggregated += groupCell.value;
							}
							groupCell.suffix = cellSuffix + (private.debug ? ' (aggregateSegmentByStore)' : '');

							// get all child columns (course los)
							var colChildren = _.filter(model.columns, function(col) {
								return col.parentId === colGroup.id;
							});

							utilsService.fastLoop(colChildren, function(colChild) {
								var childCell = rowGroup[colChild.key]
									, childCellSuffix = '';

								childCell.value = private.aggregateLoByStore(colChild, rowGroup, model);
								childCell.css = private.getGroupCellCss(childCell);
								
								if (childCell.value === 'N/A') {
									childCellSuffix = '';
									naCoursesCount++;
								} else {
									childCellSuffix = '%';
								}
								childCell.suffix = childCellSuffix+ (private.debug ? ' (aggregateLoByStore)' : '');

							}); // end: course los (child columns) loop

						} else {
							coursesCount = coursesCount > 0 ? --coursesCount : 0;
						}

					}); // end: course (columnGroup) loop


					// the row (horizontal) percentage for the rowGroup (store)
					var rowGroupSummaryValue = 0, rowGroupSummarySuffix = '';
					if (coursesCount > 0 && naCoursesCount !== colGroups.length) {
						rowGroupSummaryValue = coursesCount > 0 ? Math.round(storeAggregated / coursesCount) : 0;
						rowGroupSummarySuffix = '%';
					} else {
						// if all courses are N/A, then aggregated value is also N/A
						rowGroupSummaryValue = 'N/A';
						rowGroupSummarySuffix = '';
					}

					// store value in rowGroup summary cell 
					rowGroup.summary.value = rowGroupSummaryValue;
					rowGroup.summary.css = private.getGroupSummaryCellCss(rowGroup.summary);
					rowGroup.summary.suffix = rowGroupSummarySuffix + (private.debug ? ' (rowGroup.summary)' : '');


					// get all child rows (people)
					// // var rowChildren = _.filter(model.result.rows, function(row) {
					// // 	return row.parentId === rowGroup.id;
					// // });
					var rowChildren = rowGroup.children;

					utilsService.fastLoop(rowChildren, function(personRow) {

						// include row in calculation only if personRow.show is true
						if (personRow.show) {

							// loop through each course
							var aggregatedPerson = 0;
							naCoursesCount = 0;
							coursesCount = colGroups.length;

							utilsService.fastLoop(colGroups, function(colGroup) {
							
								// only include colGroup in calculation if group column is visible and we are not in detail view (topLevelColumn will be undefined)
								if (!topLevelColumn && colGroup.show || (topLevelColumn && topLevelColumn.id === colGroup.id)) {
									var personCourseCell = personRow[colGroup.key];

									// the person cells for each lo
									var currentLos = _.filter(personRow, function(lo) {
										return lo.parentId === colGroup.id;
									});

									// aggregate lo value
									var aggregatedLos = 0, losCount = currentLos.length, naLosCount = 0;

									utilsService.fastLoop(currentLos, function(lo) {
										// get column
										var colChild = _.find(model.columns, function(colLo) {
											return colLo.id === lo.id;
										});

										// check if col.calculate is true
										if (colChild.calculate) {
											utilsService.safeLog('recalculate: personRow.id ' + personRow.id + ' ' + colGroup.id + ' [' + lo.id + ']', lo);
											if (lo.realValue > -1) {
												aggregatedLos += lo.realValue === 2 ? 1 : 0;
											} else {
												naLosCount++;
												losCount = losCount > 0 ? --losCount : 0;
											}
										} else {
											utilsService.safeLog('recalculate: personRow.id ' + personRow.id + ' ' + colGroup.id + ' [' + lo.id + ' is hidden]', lo);
											naLosCount++;
											losCount = losCount > 0 ? --losCount : 0;
										}
									});

									if (naLosCount !== currentLos.length) {
										// person course aggregated
										personCourseCell.value = losCount > 0 ? Math.round(aggregatedLos / losCount * 100) : 0;
										aggregatedPerson += personCourseCell.value;
										utilsService.safeLog('recalculate: personRow.id ' + personRow.id + ' ' + colGroup.id + ' personCourseCell.value', personCourseCell.value);
									} else {
										naCoursesCount++;
										coursesCount--;
										personCourseCell.isNA = true;
										personCourseCell.value = 'N/A';
										personCourseCell.prefix = '%';
									}

									personCourseCell.css = private.getPersonSegmentCellCss(personCourseCell);

								} else {
									coursesCount = coursesCount > 0 ? --coursesCount : 0;
								}
							});

							// the row (horizontal) percentage for all the course sections for this person
							var personRowSummaryValue = 0, personRowSummarySuffix = '';
							if (coursesCount > 0 && naCoursesCount !== colGroups.length) {
								personRowSummaryValue = coursesCount > 0 ? Math.round(aggregatedPerson / coursesCount) : 0;
								personRowSummarySuffix = '%';
							} else {
								// if all courses are N/A, then aggregated value is also N/A
								personRowSummaryValue = 'N/A';
								personRowSummarySuffix = '';
							}

							// set person row summary
							personRow.summary.value = personRowSummaryValue;
							personRow.summary.css = private.getChildSummaryCellCss(personRow.summary);
							personRow.summary.suffix = personRowSummarySuffix + (private.debug ? ' (personRow.summary)' : '');

						} else {
							//ignore... might want to remove this code eventually;
						}
					});
				} else {
					// just ignore, no need to do anything... might want to remove this code after development is complete
				}

			}); // end: store (rowGroup) loop
			
		};

		/**
		 * @method getModel
		 * @decsription
		 * Helper to get a model with the aggregated data that can be used in a generic way
		 */
		var getModel = function(data) {

            // TODO: check if the backend can easily add segmentId to each person Learning Object.
            // if not, we have to map it here:
            if (!data.stores[0].people[0].los[0].segmentId) {
                utilsService.safeLog('Adding segmentId to people learning objects');

				utilsService.fastLoop(data.stores, function(store) {
                    utilsService.fastLoop(store.people, function(person) {
                        utilsService.fastLoop(person.los, function(personLo) {
                            var itemLo;
                            utilsService.fastLoop (data.segments, function(segm) {
                                itemLo = _.find(segm.los, function(lookupLo) {
                                    return lookupLo.id === personLo.id;
                                });

                                if (itemLo) {
                                    personLo.segmentId = segm.id;
                                }
                            });
                        });
                    });
                });

                utilsService.safeLog('Data with segmentId on people learning object', data);
            }
            

			// building model
			var model = {
				columns: [{
					id: 'category',
					key: 'category',
					position:  0,
					show: true,
					locked: true,
					css: 'th-category',
					name:  ''
				}, {
					id: 'summary',
					key: 'summary',
					position:  1,
					show: true,
					locked: true,
					css: 'th-summary',
					name:  'Tot Completion % for Learning Path'
				}],
				result: {
					tot: 10,
					rows: []
				}
			};

			// 1. Add to model.columns collection
			// loop through each course and add a column for each course
			utilsService.fastLoop(data.segments, function(course, colGroupPosition) {
				
				// group cell
				var colGroup = {
					isGroup: true,
					id: course.id,
					key: course.id,
					show: true,
					position:  model.columns.length,
					groupPosition: colGroupPosition,
					locked: false,
					css: 'th-course',
					name: course.name
				};

				// push row
				model.columns.push(colGroup);

				// add child columns
				utilsService.fastLoop(course.los, function(section) {
					// child cell
					var colChild = {
						isChild: true,
						parentId: course.id,
						id: section.id,
						key: course.id + '_' + section.id,
						position:  model.columns.length,
						locked: false,
						calculate: true, /* by default child columns are calculated when hidden, unless specifically hidden by user action, in which case calculate is also set to false */
						css: 'th-section',
						name: section.name
					};

					/*
					Child columns should calculate also when they are hidden by default. 
					If hidden by user action, then mark them as calculate false to exlude them from the calculation
					In order to accomplish this, we have a setter for show that will also set _calc to false when column is hidden 
					*/
					colChild._show = false; /* by default child columns are hidden */

					Object.defineProperty(colChild, 'show', {
						get: function() {
							// never show a column that has show false or that has been excluded from calculation
							return this._show && this.calculate;
						},
						set: function(v) {
							this._show = v;
						}
					});

					// push row
					model.columns.push(colChild);
				});
			});

			// 2. Aggregate data and add to model.result.rows collection
			// loop through each store and add a row for each store
			var rowGroups = [];
			utilsService.fastLoop(data.stores, function(store) {

				// init row and add first column for store name
				var rowGroup = {
					isGroup: true,
					id: store.id,
					show: true,
					isCollapsed: true, /* start with children collapsed by default */
					children: [],
					category: {
						id: 'category',
						key: 'category',
						css: 'category',
						locked: true,
						value: store.id + '-' + store.name
					}, 
					summary: {
						id: 'summary',
						key: 'summary',
						locked: true,
						value: 0,
						suffix: '%'
					}
				};

				var peopleByStore = store.people;

				utilsService.safeLog('peopleByStore', peopleByStore);

				// loop through each course and aggregate
				// and build a cell for each course
				utilsService.fastLoop(data.segments, function(course) {
					// init group cell with value zero
					var groupCell = {
						isGroup: true,
						id: course.id,
						key: course.id,
						value: 0,
						suffix: ''
					};

					// store groupCell into row using course.id as the row property
					rowGroup[groupCell.key] = groupCell;

					// add child cell for each course lo
					utilsService.fastLoop(course.los, function(courseLo) {
						var childCell = {
							isChild: true,
							parentId: course.id,
							id: courseLo.id,
							key: course.id + '_' + courseLo.id,
							value: 0,
							suffix: ''
						};

						// add child cell
						rowGroup[childCell.key] = childCell;
					});
				});

				utilsService.fastLoop(peopleByStore, function(person) {
					var personRow = private.getPersonRow(data.segments, person);
					personRow.parentId = rowGroup.id;
					rowGroup.children.push(personRow);
				});

				// push rowGroup
				rowGroups.push(rowGroup);
			});

			model.result.rows = rowGroups;
			model.result._rowGroups = rowGroups;
			model.topLevelColumn = undefined;

			utilsService.safeLog('model', JSON.stringify(model));

			recalculate(model, data);

			model.result.rows = [];
			return model;
		};
		
		return {
			getModel: getModel,
			recalculate: recalculate,
			private: private
		};
	};
  
	// // get reference to Main module
	// var app = angular.module('Main');
	
	// // register service with angular
	// app.factory('reportService', [reportService]);
  
}());
