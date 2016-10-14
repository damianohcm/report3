module.exports = {
    options: {
        configFile: './.eslintrc',
        reset: true,
        //rulePaths: ['conf/rules']
    },
    target: [
        './app/app.js', 
        './app/controllers/*.js', 
        './app/services/*.js', 
        './app/tests/*.js' 
        //'./app/**/*.js'
    ]
};
