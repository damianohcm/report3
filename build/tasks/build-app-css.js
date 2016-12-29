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

// copies vendors-css files to app/css
gulp.task('vendors-css', function() {
	return gulp.src(paths.vendorsCssRoot + '**/*.css')
		//.pipe(changed(paths.appCssOutputPath, {extension: '.css'}))
		//.pipe(concat({collapseWhitespace: true}))
		.pipe(gulp.dest(paths.appCssOutputPath));
});

// run sass and outpus the css
const appStyleTask = function (brand) {
	const styleName = 'main-' + brand,
        source = paths.appCssSourcePath + styleName + '.scss', 
		dest = paths.appCssOutputPath;
	
	return gulp.src(source)
		.pipe(gulpDebug({
			title: 'GulpDebug-appStyleTask: source: ' + source + ' dest: ' + dest
		}))
	// The plumber step will ensure that if we write syntactically invalid 
	// sass, even though the step won't run, the gulp task won't exit. This
	// is helpful because it allows us to fix our syntax without having to 
	// restart the gulp watch task.
	.pipe(plumber())
	.pipe(sass({
		//outputStyle: 'compressed'
	}).on('error', sass.logError))
	//.pipe(concat(paths.appCssOutputPath + styleName + '.css'))
	.pipe(gulp.dest(dest));
};

gulp.task('build-app-css-dd', function () {
    appStyleTask('dd');
});

gulp.task('build-app-css-br', function () {
    appStyleTask('br');
});

gulp.task('build-app-css', function (callback) {
    return runSequence(
        'clean-app-css',
		[
            'vendors-css',
			'build-app-css-dd',
            'build-app-css-br'
        ],
		callback
	);
});
