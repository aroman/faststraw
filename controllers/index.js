'use strict';

var poll = require("../models/poll")

module.exports = function (server) {

    server.get('/', function (req, res) {
        var model = { name: 'FastStraw' };
		res.render('index', model);  
    });

    server.get('/create', function (req, res) {
		res.render('create');
    });


    server.post('/create', function (req, res) {
    	console.log(req.body);
    	if (!req.body.question || !req.body.invitees) {
    		res.send('<iframe width="560" height="315" src="//www.youtube.com/embed/PgIShXhX6Yo" frameborder="0" allowfullscreen></iframe>');
    	}
		res.render('create');
    });

    server.get('/vote/:token', function (req, res) {
        var model = { name: 'FastStraw' };
		res.render('vote', model);
    });

};
