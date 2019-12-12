'use strict';

const express = require('express')
	, http = require('http');

let _logger,
    _expressInstance,
    _httpServer;

/**
 * @class App
 * @description
 */
class App {

    constructor(args) {
		try {
            _logger = args.logger || console;
            _expressInstance = express();
            _httpServer = http.Server(_expressInstance);

            // setup up express app
            //const staticPath = __dirname + '/../html';
            _expressInstance.use('/', express.static('./app'));
            _expressInstance.use('/cs-page', express.static('./cs-page'));
            _expressInstance.use('/img', express.static('./img'));

        } catch (e) {
            console.log('App.constructor: exception', e);
        }
    }

    start(port) {
        // start node/express http server
        _httpServer.listen(port, () => {
            _logger.log('httpServer listening on *:' + port);
        });
    }

};

// instantiate and start
const _app = new App({
		logger: console
	});

_app.start(3081);
