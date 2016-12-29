'use strict';

const gulp = require('gulp'),
    paths = require('../paths'),
    del = require('del'),
    vinylPaths = require('vinyl-paths');

// deletes all files in the app/css
gulp.task('clean-app-css', function() {
    return gulp.src([
            paths.appCssOutputPath
        ])
        .pipe(vinylPaths(del));
});

// deletes all files in the cs-page/css
gulp.task('clean-cspage-css', function() {
    return gulp.src([
            paths.cspageCssOutputPath + '*.css'
        ])
        .pipe(vinylPaths(del));
});

// run all clean css tasks
gulp.task('clean-css', function() {
    return runSequence(
		'clean-app-css',
		'clean-cspage-css',
		callback
	);
});
