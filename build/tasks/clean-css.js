'use strict';

const gulp = require('gulp'),
    paths = require('../paths'),
    del = require('del'),
    vinylPaths = require('vinyl-paths');

// deletes all files in the output path
gulp.task('clean-css', function() {
    return gulp.src([
            paths.appCssOutputPath,
            paths.cspageCssOutputPath
        ])
        .pipe(vinylPaths(del));
});