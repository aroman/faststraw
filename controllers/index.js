'use strict';

var Poll = require("../models/poll")

module.exports = function (server) {

    server.get('/', function (req, res) {
        var model = { name: 'FastStraw' };
		res.render('index', model);  
    });

    server.get('/create', function (req, res) {
		res.render('create');
    });


    server.post('/create', function (req, res) {
    	if (!req.body.question || !req.body.invitees) {
    		res.send('<iframe width="560" height="315" src="//www.youtube.com/embed/PgIShXhX6Yo" frameborder="0" allowfullscreen></iframe>');
    		return;
    	}
		var poll = new Poll();
		poll.question = req.body.question;
		poll.invitees = req.body.invitees.split(",");
		poll.save(function(err) {
			if (err) {
				res.send(err);
			} else {
				res.redirect('/vote/' + poll._id);
			}
		});
    });

    server.get('/vote/:poll_id', function (req, res) {
        var model = { name: 'FastStraw' };
		res.render('vote', model);
    });

};
