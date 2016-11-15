'use strict';

const gulp = require('gulp'),
    gulpDebug = require('gulp-debug'),
    runSequence = require('run-sequence'),
    plumber = require('gulp-plumber'),
    paths = require('../paths'),
    //assign = Object.assign || require('object.assign'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    htmlmin = require('gulp-htmlmin'),

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

// // copies changed html files to the output directory
// gulp.task('build-html', function() {
// 	return gulp.src(paths.html)
// 		.pipe(changed(paths.output, {extension: '.html'}))
// 		.pipe(htmlmin({collapseWhitespace: true}))
// 		.pipe(gulp.dest(paths.output));
// });


// run sass and outpus the css
const appStyleTask = function (brand) {
	const styleName = 'main-' + brand,
        source = paths.appCssSourcePath + styleName + '.scss', 
		dest = paths.appCssOutputPath + styleName + '.css';
	
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
	//.pipe(concat(paths.style1 + '.css'))
	.pipe(gulp.dest(dest));
};

gulp.task('build-app-css-dd', function () {
    appStyleTask('dd');
});
gulp.task('build-app-css-br', function () {
    appStyleTask('br');
});


gulp.task('build-css', function(callback) {
	return runSequence(
        'clean-css',
		[
            'build-app-css-dd'
            //, 'build-css-style2'
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