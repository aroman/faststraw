'use strict';

var poll = require("../models/poll")

module.exports = function (server) {

    server.get('/', function (req, res) {
        var model = { name: 'FastStraw' };
		res.render('index', model);  
    });

    server.get('/vote/:token', function (req, res) {
        var model = { name: 'FastStraw' };
		res.render('vote', model);
    });

};
