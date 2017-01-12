(function() {

	var reportService = function(utilsService) {
		var reportConfig,
		
			// label to be used when learning objects are missing
			// (missing los are considered N/A - not applicable)
			notApplicableLabel,
			notApplicableIncludeInCalc,
			_personSegmentCellCssWithColor;

		var private = {
		};

		var _getDebugMessage = function(val) {
			if (reportConfig.debug) {
				return ' (val)'.replace('val', val);
			} else {
				return '';
			}
		};

		/**
		 * @method toggleAverageCalculationMode
		 * @description
		 * Toggles reportConfig.averageCalculationMode from 'segments' to 'los' or viceversa.
		 * After toggling, you have to update calculations on model by calling reportService.recalculate($scope.model) from the controller.
		 */
		var toggleAverageCalculationMode = function() {
			// toggle average calculation from normal to weighted and viceversa
			var current = reportConfig.averageCalculationMode;
			//utilsService.safeLog('averageCalculationMode: current: ' + current);
			reportConfig.averageCalculationMode = (current === 'los' ? 'segments' : 'los');
			return reportConfig.averageCalculationMode;
		};

		/**
		 * @method setReportConfig
		 * @description
		 * Call to set the reportConfig to use.
		 */
		var setReportConfig = function(value) {
			reportConfig = value;
			notApplicableLabel = reportConfig.notApplicableLabel,
			notApplicableIncludeInCalc = reportConfig.notApplicableIncludeInCalc;
			_personSegmentCellCssWithColor = reportConfig.colorPersonSegmentCell ? ' with-color' : '';
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
					return 'col-group person na' + _personSegmentCellCssWithColor;
				} else if (cell.value === 100) {
					return 'col-group person completed' + _personSegmentCellCssWithColor;
				} else if (cell.value > 0) {
					return 'col-group person in-progress' + _personSegmentCellCssWithColor;
				} else {
					return 'col-group person' + _personSegmentCellCssWithColor;
				}
			}
		};

		// strategy to lookup person learning object status by id
		private.personLoCells = {
			'-1': {
				isChild: true,
				realValue: -1,
				value: 'Not Started*', /* missing learning objects are considered N/A - Not Applicable */
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
		private.getPersonRow = function(segments, person) {
			if (!segments || typeof segments !== 'object' || segments.length < 1 
				|| !person || typeof person !== 'object' 
				|| !person.hasOwnProperty('name') || !person.hasOwnProperty('title') || !person.hasOwnProperty('los')) {
				debugger;
				throw Error('getPersonRow: Invalid arguments');
			} else {

				utilsService.safeLog('getPersonRow', segments.length + ' ' + person.name);
				utilsService.safeLog('getPersonRow segments', segments);
				utilsService.safeLog('getPersonRow person', person);

				var personName = (person.name),
					personId = person.id;

				// init row and add first column for store name
				var row = {
					id: personId,
					isChild: true,
					show: true, /* by default this is true, but the row will be hidden because the parent store row will have isCollapsed true */
					category: {
						key: 'category',
						locked: true,
						value: private.escapeSpecialChars(personName),
						valueTrunc: private.truncateText(personName, reportConfig.rowChildheaderMaxLength),
						value2: person.title,
						value3: reportConfig.displayPersonHireDate ? (person.hire_date ? person.hireDate : 'Unknown') : undefined,
						css: 'person',
						cssValueSpan: 'person'
					},
					summary: {
						key: 'summary',
						locked: true,
						value: 0,
						suffix: '%',
						css: '',
						cssValueSpan: ''
					}
				};

				// loop through each segment
				utilsService.fastLoop(segments, function(segment) {
					var segmentId = Number(segment.id);

// if (person.name === 'Jay Patel' && segment.id === 1) {
// 	debugger;
// }

					// init cell
					var cell = {
						isGroup: true,
						key: segmentId,
						id: segmentId,
						value: 0,
						suffix: '%'
					};

					// store cell into row using segment.id as the row property
					row[cell.key] = cell;

					var currentLos = _.filter(person.los, function(lo) {
						if (!lo) {
							var errMsg = 'reportService: WARNING: person.lo is null';
							utilsService.safeLog(errMsg, person);
							alert(errMsg);
						}
						return lo.segmentId === segment.id;
					});

					if (currentLos.length > 0) {
						// add child cells (visibility is controlled by the child columns)
						utilsService.fastLoop(segment.los, function(lo) {
// if (person.name === 'Jay Patel' && segment.id === 1) {
// 	debugger;
// }
							var personLo = _.find(currentLos, function(plo) {
								return plo.id === lo.id;
							});

// if (!personLo && person.name === 'Jay Patel' && segment.id === 1) {
// 	console.log('reportService: debugging: segment is', segment.id, segment.name, currentLos.length);
// 	console.log('reportService: debugging: segments.lo match not found in person los', person.name, lo.id);
// }
							
							// if person lo is missing, we assume N/A (which is -1) for the lo
							var loValue = personLo && !isNaN(personLo.value) ? personLo.value : -1;

							// child cell
							var childCell;
							try {
								loValue = Number(loValue);
								childCell = JSON.parse(JSON.stringify(private.personLoCells[loValue]));
							} catch (e) {
								console.log('reportService.js: Exception parsing json', e);
								debugger;
								alert(e);
							}
							childCell.parentId = segment.id;
							childCell.id = lo.id;
							childCell.key = childCell.parentId + '_' + childCell.id;
							row[childCell.key] = childCell;
						});
					} else {
// if (person.name === 'Jay Patel' && segment.id === 1) {
// 	console.log('reportService: debugging: segment is', segment.id, segment.name);
// 	console.log('reportService: debugging: person has no los', person.name, person.los);
// }

						cell.isNA = true;
						cell.value = notApplicableLabel;
						cell.suffix = '';

						utilsService.fastLoop(segment.los, function(lo) {
							// child cell
							var childCell;
							var childCell = JSON.parse(JSON.stringify(private.personLoCells[-1]));
							childCell.parentId = segment.id;
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
		 * @method decreaseCount
		 * Helper to safely decrease a counter
		 */
		private.decreaseCount = function(count) {
			return count > 0 ? --count : 0;
		};

		/**
		 * @method convertLoRealValue
		 * Convert lo value of either 0, 1 or 2 into only 0 or 1
		 */
		private.convertLoRealValue = function(value) {
			return value === 2 ? 1 : 0;
		};

		/**
		 * @method safePercent
		 * Safely performs a division and applies a multipler if passed in
		 */
		private.safePercent = function(nominator, denominator, multiplier) {
			multiplier = multiplier || 1; 
			return denominator > 0 ? Math.round(nominator / denominator * multiplier) : 0;
		};

		/**
		 * @method aggregateSegmentByStore
		 * @decription
		 * A colGroup represents a segment (segment)
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
									aggregatedLos += private.convertLoRealValue(lo.realValue);
								} else {
									// if person does not have a learning object increase naLosCount
									naLosCount++;
									// decrease losCount only if notApplicableIncludeInCalc is false
									if (notApplicableIncludeInCalc === false) {
										losCount = private.decreaseCount(losCount);
									}
								}
							} else {
								// col is hidden and should not be calculated
								utilsService.safeLog('aggregateSegmentByStore [' + colChild.id + ' is hidden]', colChild);
								losCount = private.decreaseCount(losCount);
							}
							
						});

						// if naLosCount is not equal to currentLos.length means person has at least one or more los so aggregate
						if (naLosCount !== currentLos.length) {
							////aggregated += losCount > 0 ? Math.round(aggregatedLos / losCount * 100) : 0;
							aggregated += private.safePercent(aggregatedLos, losCount, 100);
						} else {
							// if person does not have any learning objects for this segment increase naCount
							naCount++;
							// decrease peopleRowsCount only if notApplicableIncludeInCalc is false
							if (notApplicableIncludeInCalc === false) {
								peopleRowsCount = private.decreaseCount(peopleRowsCount);
							}
						}
					} else {
						// row is hidden: increase naCount and reduce people count
						naCount++;
						peopleRowsCount = private.decreaseCount(peopleRowsCount);
					}
				});

				// calculate percentage
				//utilsService.safeLog('aggregateSegmentByStore peopleCount: ' + peopleRowsCount + ' naCount: ' + naCount, aggregated, true);
				var finalValue;
				if (naCount !== peopleRows.length) {
					////finalValue = peopleRowsCount > 0 ? Math.round(aggregated / peopleRowsCount) : 0;
					finalValue = private.safePercent(aggregated, peopleRowsCount);
				} else {
					// if all people are N/A, then aggregated value is also N/A
					finalValue = notApplicableLabel;
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

				// include row in calculation only if personRow.show is true
				if (personRow.show) {
					// find matching person lo
					var currentLo;
					Object.keys(personRow).every(function(k) {
						var cell = personRow[k];
						if (cell.hasOwnProperty('isChild') && cell.hasOwnProperty('id') 
							&& cell.id === colChild.id) {
							currentLo = cell;
							return false;
						}
						return true;
					});
					//utilsService.safeLog('aggregateLoByStore: personRow ' + personRow.id + ' lo ' + colChild.id + ' ', currentLo, true);

// if (colChild.id === '3f8c8bd7-5aae-4184-a824-68edf528a011' && !currentLo) {
// 	debugger;
// }

					if (currentLo && currentLo.realValue > -1) {
						// // get column lookup
						// var lookupLo = _.find(model.columns, function(colLo) {
						// 	return colLo.id === currentLo.id;
						// });

						// // check if col.calculate is true
						// if (lookupLo.calculate) {
						// 	if (currentLo.realValue > -1) {
						// 		aggregated += private.convertLoRealValue(currentLo.realValue);
						// 	}
						// } else {
						// 	utilsService.safeLog('aggregateSegmentByStore [' + lookupLo.id + ' is hidden]', lookupLo);
						// }

						// check if col.calculate is true
						if (colChild.calculate) {
							if (currentLo.realValue > -1) {
								aggregated += private.convertLoRealValue(currentLo.realValue);
							}
						} else {
							utilsService.safeLog('aggregateSegmentByStore [' + colChild.id + ' is hidden]', colChild);
						}

					} else {
						// if person does not have any learning objects for this segment increase naCount
						naCount++;
						if (notApplicableIncludeInCalc === false) {
							// reduce people count only if notApplicableIncludeInCalc is false
							peopleRowsCount = private.decreaseCount(peopleRowsCount);
						}
					}
				} else {
					// row is hidden: increase naCount and reduce people count
					naCount++;
					peopleRowsCount = private.decreaseCount(peopleRowsCount);
				}
			});

			var finalValue = 0;
			if (naCount !== peopleRows.length) {
				////finalValue = peopleRowsCount > 0 ? Math.round(aggregated / peopleRowsCount * 100) : 0;
				finalValue = private.safePercent(aggregated, peopleRowsCount, 100);
			} else {
				// if all people are N/A, then aggregated value is also N/A
				finalValue = notApplicableLabel;
			}
			return finalValue;
		};

		/**
		 * @object averageStrategies
		 * @description
		 */
		var averageStrategies = {
			segments: function(isDetailView, aggregated, weightedAggregated, segmentsCount, totLosCount) {
				// always do average using number of segments as denominator
				return private.safePercent(aggregated, segmentsCount);
			},
			los: function(isDetailView, aggregated, weightedAggregated, segmentsCount, totLosCount) {
				if (isDetailView) {
					// if we are in detail view, still use segments count for denominator
					return private.safePercent(aggregated, segmentsCount);
				} else {
					// otherwise use totLosCount as denominator
					return private.safePercent(weightedAggregated, totLosCount);
				}
			}
		};

		/**
		 * @method recalculate
		 * @description
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

			var averageStrategy = averageStrategies[reportConfig.averageCalculationMode]; 
			if (!averageStrategy) {
				alert('Could not find average strategy for ' + reportConfig.averageCalculationMode);
			}

			// begin: store (rowGroup) loop
			utilsService.fastLoop(rowGroups, function(rowGroup) {

				// include row in calculation only if rowGroup.show is true
				if (rowGroup.show) {

					// begin: segment (colGroup) loop
					// aggregate each person data by segment
					var colGroupsCount = colGroups.length, naColGroupsCount = 0, 
						totLosCount = 0,
						rowGroupAggregated = 0,
						rowGroupAggregatedWeighted = 0;

					utilsService.fastLoop(colGroups, function(colGroup) {

						// only include colGroup in calculation if group column is visible 
						// and we are not in detail view (topLevelColumn will be undefined)
						if (!topLevelColumn && colGroup.show || (topLevelColumn && topLevelColumn.id === colGroup.id)) {
							// get group cell (segment cell)
							var groupCell = rowGroup[colGroup.key]
								, cellSuffix = '';

							// aggregate current segment
							groupCell.value = private.aggregateSegmentByStore(colGroup, rowGroup, model);
							groupCell.css = private.getGroupCellCss(groupCell);

							//utilsService.safeLog('groupCell.value', groupCell.value, true);

							if (groupCell.value === notApplicableLabel) {
								cellSuffix = '';
								naColGroupsCount++;
								if (notApplicableIncludeInCalc === false) {
									colGroupsCount = private.decreaseCount(colGroupsCount);
								}
							} else {
								cellSuffix = '%';
								rowGroupAggregated += groupCell.value;
							}

							groupCell.suffix = cellSuffix + _getDebugMessage('aggSegByPC'); /* groupCell is segment - this is aggregated Segment by PC */

							// get all child columns (segment los)
							var colChildren = _.filter(model.columns, function(col) {
								return col.parentId === colGroup.id;
							});
							
							// loop through child columns
							var aggregatedLos = 0;

							utilsService.fastLoop(colChildren, function(colChild) {
								var childCell = rowGroup[colChild.key]
									, childCellSuffix = '';

								//utilsService.safeLog('colChild.calculate ' + colChild.calculate, colChild.name);
								if (colChild.calculate) {
									//utilsService.safeLog('childCell.value', childCell.value);
									totLosCount += 1;
								}

								if (childCell) {
									childCell.value = private.aggregateLoByStore(colChild, rowGroup, model);
									childCell.css = private.getGroupCellCss(childCell);
									
									//utilsService.safeLog('childCell.value ' + colChild.calculate, childCell.value);

									if (childCell.value === notApplicableLabel) {
										childCellSuffix = '';
										//naColGroupsCount++;
									} else {
										aggregatedLos += childCell.value;
										childCellSuffix = '%';
									}

									// aggregateLoByStore 
									childCell.suffix = childCellSuffix + _getDebugMessage('aLoByS');
								} else {
									utilsService.safeLog('warning: could not find childCell in rowGroup for colChild.key', colChild.key);
								}

							}); // end: segment los (child columns) loop


							rowGroupAggregatedWeighted += (aggregatedLos);

						} else {
							// col is hidden or we are in details view
							colGroupsCount = private.decreaseCount(colGroupsCount);
						}

					}); // end: segment (columnGroup) loop

					// the row (horizontal) percentage for the rowGroup (store)
					var rowGroupSummaryValue = 0, rowGroupSummarySuffix = '';
					//utilsService.safeLog('colGroupsCount naColGroupsCount colGroups.length rowGroupAggregated', colGroupsCount, naColGroupsCount, colGroups.length, rowGroupAggregated);
					if (colGroupsCount > 0 && naColGroupsCount !== colGroups.length) {
						// do average
						// if normal average, divide rowGroupAggregated by colGroupsCount
						//utilsService.safeLog('rowGroupAggregated ' + rowGroupAggregated, colGroupsCount, totLosCount);
						rowGroupSummaryValue = averageStrategy(!!topLevelColumn, rowGroupAggregated, rowGroupAggregatedWeighted, colGroupsCount, totLosCount);
						rowGroupSummarySuffix = '%';
					} else {
						// if all segments are N/A, then aggregated value is also N/A
						rowGroupSummaryValue = notApplicableLabel;
						rowGroupSummarySuffix = '';
					}

					// store value in rowGroup summary cell 
					rowGroup.summary.value = rowGroupSummaryValue;
					rowGroup.summary.css = private.getGroupSummaryCellCss(rowGroup.summary);
					rowGroup.summary.suffix = rowGroupSummarySuffix + _getDebugMessage('pcSum'); /* rowGroup is PC - this is the summary cell for the PC */


					// get all child rows (people)
					var rowChildren = rowGroup.children;

					utilsService.fastLoop(rowChildren, function(personRow) {

						// include row in calculation only if personRow.show is true
						if (personRow.show) {

							// loop through each segment
							var rowChildAggregated = 0,
							rowChildAggregatedWeighted = 0;
							naColGroupsCount = 0;
							colGroupsCount = colGroups.length;
							totLosCount = 0;

							utilsService.fastLoop(colGroups, function(colGroup) {
							
								// only include colGroup in calculation if group column is visible and 
								// we are not in detail view (topLevelColumn will be undefined)
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
												aggregatedLos += private.convertLoRealValue(lo.realValue);
											} else {
												naLosCount++;
												if (notApplicableIncludeInCalc === false) {
													// decrease los count only if notApplicableIncludeInCalc is false
													losCount = private.decreaseCount(losCount);
												}
											}
										} else {
											utilsService.safeLog('recalculate: personRow.id ' + personRow.id + ' ' + colGroup.id + ' [' + lo.id + ' is hidden]', lo);
											naLosCount++;
											losCount = private.decreaseCount(losCount);
										}
									});

									totLosCount += losCount;

									if (naLosCount !== currentLos.length) {
										// person segment aggregated
										////personCourseCell.value = losCount > 0 ? Math.round(aggregatedLos / losCount * 100) : 0;
										personCourseCell.value = private.safePercent(aggregatedLos, losCount, 100);
										rowChildAggregated += personCourseCell.value;
										rowChildAggregatedWeighted += (personCourseCell.value * losCount);
										utilsService.safeLog('recalculate: personRow.id ' + personRow.id + ' ' + colGroup.id + ' personCourseCell.value', personCourseCell.value);
									} else {
										naColGroupsCount++;
										if (notApplicableIncludeInCalc === false) {
											colGroupsCount--;
										}
										personCourseCell.isNA = true;
										personCourseCell.value = notApplicableLabel;
										personCourseCell.suffix = '';
									}

									personCourseCell.css = private.getPersonSegmentCellCss(personCourseCell);

								} else {
									colGroupsCount = private.decreaseCount(colGroupsCount);
								}
							});

							// the row (horizontal) percentage for all the segment los for this person
							var personRowSummaryValue = 0, personRowSummarySuffix = '';
							if (colGroupsCount > 0 && naColGroupsCount !== colGroups.length) {
								// do average
								personRowSummaryValue = averageStrategy(!!topLevelColumn, rowChildAggregated, rowChildAggregatedWeighted, colGroupsCount, totLosCount);
								personRowSummarySuffix = '%';
							} else {
								// if all segments are N/A, then aggregated value is also N/A
								personRowSummaryValue = notApplicableLabel;
								personRowSummarySuffix = '';
							}

							// set person row summary
							personRow.summary.value = personRowSummaryValue;
							personRow.summary.css = private.getChildSummaryCellCss(personRow.summary);
							personRow.summary.suffix = personRowSummarySuffix + _getDebugMessage('prs');

						} else {
							// Person row is hidden
							// ignore... might want to remove this code eventually;
						}
					});
				} else {
					// PC row is hidden
					// just ignore, no need to do anything... might want to remove this code after development is complete
				}

			}); // end: store (rowGroup) loop
			
		};

		/**
		 * @method escapeSpecialChars
		 * @description
		 * Helper to escape some special chars like copyright, registered mark etc.
		 */
		private.escapeSpecialChars = function(text) {
			// whatever we escape here, we'll have to unescape in the csv export in utilsService.js
			return (text || '')
				.replace('\'', '&rsquo;')
				.replace('©', '&copy;')
				.replace('®', '&reg;')
				.replace('™', '&trade;');
		};

		/**
		 * @method truncateText
		 * @description
		 * Helper to limit text length to a max length, and add "..."
		 */
		private.truncateText = function(text, maxLen) {
			// if (text.length > maxLen) {
			// 	return text.substring(0, maxLen).trim() + ' ...';
			// } else {
			// 	return text;
			// }

			// check how many uppercase there are. The more uppercase chars, the more we want to truncate as uppercase chars take more space
			var origStr = (text || '').trim(), origLen = origStr.length;
			//console.log('origLen', origLen);
			var str = (origStr.length > maxLen ? origStr.substring(0, maxLen) : origStr).trim();
			var caps = str.replace(/[^A-Z]/g, '').length;
			
			if (caps > 1 && caps < 16)  {
				var addAllowed = Math.round((16 - caps) * 0.7);
				//console.log('addAllowed', addAllowed);
				var newMax = str.length + addAllowed;
				var newMaxLen = Math.round(maxLen * 1.00);
				newMaxLen = newMaxLen > 30 ? newMaxLen : 30;
				newMax = newMax > newMaxLen ? newMaxLen : newMax;
				//console.log('newMax', newMax);
				str = origStr.substring(0, newMax);
				
			}

			var diffFromOrig = origLen - str.length;
			//console.log('diffFromOrig', diffFromOrig);
			if (diffFromOrig > 0) {
				str = str.substring(0, str.length - 4) + ' ...';
			}

			return str;
		};

		/**
		 * @method formatName
		 * @description
		 * Helper format col name approriately
		 */
		private.formatName = function(text, maxLen) {
			return private.truncateText(private.escapeSpecialChars(text), maxLen);
		};

		/**
		 * @method getModel
		 * @description
		 * Helper to get a model with the aggregated data that can be used in a generic way
		 */
		var getModel = function(data, totCompletionTitle) {  

			utilsService.safeLog('reportSerivce: totCompletionTitle', totCompletionTitle);

			// building model
			var model = {
				isDetailOnly: (data && data.segments || []).length === 1, /* if there is only one segment, then we only display in detail view (i.e. New and Trending or Custom Report with one segment only) */
				totCompletionTitle: totCompletionTitle,
				columns: [{
					id: 'category',
					key: 'category',
					position:  0,
					show: true,
					locked: true,
					css: 'th-category',
					name:  '',
					type: '',
					/* front end things */
					title: 'Click to expand Category',
					removeTitle: 'Remove Category',
					addCss: {
						rowThMiddle: 'row-th-middle',
						rowThMiddleInner: 'row-th-middle-inner',
						rowThText: 'row-th-text'
					}
				}, {
					id: 'summary',
					key: 'summary',
					position:  1,
					show: true,
					locked: true,
					css: 'th-summary pointer',
					////name:  /* computed property added below */
					////nameTrunc:  /* computed property added below */
					type: '',
					/* front end things */
					title: 'Click to toggle average calculation mode',
					removeTitle: '',
					addCss: {
						rowThMiddle: 'row-text',
						rowThMiddleInner: '',
						rowThText: ''
					}
				}],
				result: {
					tot: 10,
					rows: []
				}
			};

			/* computed property for summary columne name - 'Tot Completion % for ...' */
			Object.defineProperty(model.columns[1], 'name', {
				get: function() {
					return private.escapeSpecialChars(this.totCompletionTitle);
				}.bind(model)
			});
			Object.defineProperty(model.columns[1], 'nameTrunc', {
				get: function() {
					return private.formatName(this.totCompletionTitle, reportConfig.colSummaryHeaderMaxLength);
				}.bind(model)
			});

			// 1. Add to model.columns collection
			// loop through each segment and add a column for each segment
			utilsService.fastLoop(data.segments, function(segment, colGroupPosition) {

				// group cell
				var colName = (segment.title || segment.name),
					segmentId = Number(segment.id);
				
				var colGroup = {
					isGroup: true,
					id: segmentId,
					key: segmentId,
					show: true,
					position:  model.columns.length,
					groupPosition: colGroupPosition,
					locked: false,
					css: 'th-segment valign-top pointer',
					name: private.escapeSpecialChars(colName),
					nameTrunc: private.truncateText(colName, reportConfig.colGroupHeaderMaxLength),
					type: segment.type,
					/* front end things */
					title: 'Click to expand Category',
					removeTitle: 'Remove Category',
					addCss: {
						rowThMiddle: 'row-text',
						rowThMiddleInner: '',
						rowThText: ''
					}
				};

				// push row
				model.columns.push(colGroup);

				// add child columns
				var segmentLos = (segment.los || segment.learning_objects);
				utilsService.fastLoop(segmentLos, function(lo) {
					// child cell
					var learningObjectId = lo.id,
						colChildKey = segmentId + '_' + learningObjectId,
						colChildName = (lo.title || lo.name);

					//utilsService.safeLog('colChildName', colChildName);

					var colChild = {
						isChild: true,
						parentId: segmentId,
						id: learningObjectId,
						key: colChildKey,
						position:  model.columns.length,
						locked: false,
						calculate: true, /* by default child columns are calculated when hidden, unless specifically hidden by user action, in which case calculate is also set to false */
						css: 'th-lo valign-top',
						name: private.escapeSpecialChars(colChildName),
						nameTrunc: private.truncateText(colChildName, reportConfig.colChildheaderMaxLength),
						type: lo.type,
						/* front end things */
						title: '',
						removeTitle: 'Remove Course',
						addCss: {
							rowThMiddle: 'row-text',
							rowThMiddleInner: '',
							rowThText: ''
						}
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
						}.bind(colChild),
						set: function(v) {
							this._show = v;
						}.bind(colChild)
					});

					// push row
					model.columns.push(colChild);
				});
			});

			// default sort by PC name (store)
			// and people by descending title and then ascending name
			data.stores = _.sortBy(data.stores, 'name').reverse();

			var peopleSorter = function(person) {
				return person.title.toLowerCase().indexOf('manager') === -1 
					? (person.name && person.name.length && person.name.substring(0, 1)) 
					: '';
			};

			utilsService.fastLoop(data.stores, function(store) {
				store.people = _.sortBy(store.people, peopleSorter);
			});
			
			// 2. Aggregate data and add to model.result.rows collection
			// loop through each store and add a row for each store
			var rowGroups = [];
			utilsService.fastLoop(data.stores, function(store) {

				var storeName = (store.name),
					storeId = store.id;

				// init row and add first column for store name
				var rowGroup = {
					isGroup: true,
					id: storeId,
					show: true,
					isCollapsed: true, /* start with children collapsed by default */
					children: [],
					category: {
						id: 'category',
						key: 'category',
						css: 'category',
						locked: true,
						value: private.escapeSpecialChars(storeName),
						valueTrunc: private.truncateText(storeName, reportConfig.rowGroupHeaderMaxLength)
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

				// loop through each segment and aggregate
				// and build a cell for each segment
				utilsService.fastLoop(data.segments, function(segment) {
					var segmentId = Number(segment.id);

					// init group cell with value zero
					var groupCell = {
						isGroup: true,
						id: segmentId,
						key: segmentId,
						value: 0,
						suffix: ''
					};

					// store groupCell into row using ssegmentId as the row property
					rowGroup[groupCell.key] = groupCell;

					// add child cell for each segment lo
					utilsService.fastLoop(segment.los, function(segmentLo) {
						var childCellId = segmentLo.id,
							childCellKey = segmentId + '_' + childCellId;

						var childCell = {
							isChild: true,
							parentId: segmentId,
							id: childCellId,
							key: childCellKey,
							value: 0,
							suffix: ''
						};

						// add child cell
						rowGroup[childCell.key] = childCell;
					});
				});

				utilsService.fastLoop(peopleByStore, function(person) {
					if (data.segments && person) {
						var personRow = private.getPersonRow(data.segments, person);
						personRow.parentId = rowGroup.id;
						rowGroup.children.push(personRow);
					} else {
						utilsService.safeLog('warning: no segments or person');
					}
				});

				// push rowGroup
				rowGroups.push(rowGroup);
			});

			// temporarily set rows to allow for calculation
			model.result.rows = rowGroups;
			model.result._rowGroups = rowGroups;
			model.topLevelColumn = undefined;

			utilsService.safeLog('model', JSON.stringify(model));

			// calculate
			recalculate(model, data);

			// remove rows - they will load in the controller from _rowGroups with a timeout for performance
			model.result.rows = [];

			return model;
		};
		
		return {
			setReportConfig: setReportConfig,
			getModel: getModel,
			recalculate: recalculate,
			private: private,
			reportConfig: reportConfig,
			toggleAverageCalculationMode: toggleAverageCalculationMode
		};
	};
  
	// // get reference to Main module
	// var app = angular.module('Main');
	
	// // register service with angular
	// app.factory('reportService', [reportService]);

	if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = reportService;
        }
        exports = reportService;
    } else {
        window.services = window.services || {};
        window.services.reportService = reportService;
    }
  
}());
