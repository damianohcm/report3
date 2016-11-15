'use strict';

const appRoot = 'app/',
	cspageRoot = 'cs-page/',
	sassRoot = 'sass/';

module.exports = {
	appRoot: appRoot,
	cspageRoot: cspageRoot,

	//source: appRoot + '**/*.js',
	//html: appRoot + '**/*.html',
	//css: appRoot + '**/*.css',
	
	appStyle1: 'main-dd',
	appStyle2: 'main-br',

	cspageStyle1: 'cspage-reporting-dd',
	cspageStyle2: 'cspage-reporting-br',

	appCssSourcePath: sassRoot + 'app/',
	cspageCssSourcePath: sassRoot + 'cspage/',

	appCssOutputPath: appRoot + 'css/',
	cspageCssOutputPath: cspageRoot + 'css/'
};