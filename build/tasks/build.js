'use strict';

const gulp = require('gulp'),
    gulpDebug = require('gulp-debug'),
    runSequence = require('run-sequence'),
    plumber = require('gulp-plumber'),
    paths = require('../paths'),
    //assign = Object.assign || require('object.assign'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    htmlmin = require('gulp-htmlmin');

// // copies changed html files to the output directory
// gulp.task('build-html', function() {
// 	return gulp.src(paths.html)
// 		.pipe(changed(paths.output, {extension: '.html'}))
// 		.pipe(htmlmin({collapseWhitespace: true}))
// 		.pipe(gulp.dest(paths.output));
// });


gulp.task('build-css', function(callback) {
	return runSequence(
        [
			'build-app-css',
            'build-cspage-css'
        ],
		callback
	);
});

// this task calls the clean task (located
// in ./clean.js), then runs the build-system
// and build-html tasks in parallel
// https://www.npmjs.com/package/gulp-run-sequence
gulp.task('build', function(callback) {
	return runSequence(
		'build-css',
		callback
	);
});