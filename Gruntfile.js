'use strict';

const tasks = require('./grunt/tasks')


module.exports = (grunt) => {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        eslint: tasks.eslint,
        sass: tasks.sass
    });

    // Default task.
    grunt.registerTask('default', [
        'eslint',
        'sass'
    ]);

};
