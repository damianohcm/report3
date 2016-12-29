'use strict';

const gulp = require('gulp'),
    gulpDebug = require('gulp-debug'),
    runSequence = require('run-sequence'),
    plumber = require('gulp-plumber'),
    paths = require('../paths'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat');

// run sass and outpus the css for cspage
const cspageStyleTask = function (brand) {
	const styleName = 'cspage-reporting-' + brand,
        source = paths.cspageCssSourcePath + styleName + '.scss', 
		dest = paths.cspageCssOutputPath;
	
	return gulp.src(source)
		.pipe(gulpDebug({
			title: 'GulpDebug-cspageStyleTask: source: ' + source + ' dest: ' + dest
		}))
	// The plumber step will ensure that if we write syntactically invalid 
	// sass, even though the step won't run, the gulp task won't exit. This
	// is helpful because it allows us to fix our syntax without having to 
	// restart the gulp watch task.
	.pipe(plumber())
	.pipe(sass({
		//outputStyle: 'compressed'
	}).on('error', sass.logError))
	//.pipe(concat(paths.cspageCssOutputPath + styleName + '.css'))
	.pipe(gulp.dest(dest));
};

gulp.task('build-cspage-css-dd', function () {
    cspageStyleTask('dd');
});

gulp.task('build-cspage-css-br', function () {
    cspageStyleTask('br');
});

gulp.task('build-cspage-css', function (callback) {
    return runSequence(
        'clean-cspage-css',
		[
			'build-cspage-css-dd',
            'build-cspage-css-br'
        ],
		callback
	);
});