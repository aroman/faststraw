'use strict';

var crypto = require('crypto')
var postmark = require("postmark")(process.env.POSTMARK_API_KEY);
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
    	var question = req.body.question;
    	var invitees_blob = req.body.invitees;
    	if (!question || !invitees_blob) {
    		res.send('<iframe width="560" height="315" src="//www.youtube.com/embed/PgIShXhX6Yo" frameborder="0" allowfullscreen></iframe>');
    		return;
    	}
		var poll = new Poll();
		poll.question = question;
		poll.voters = []
		invitees_blob.forEach(function(invitee_blob) {
			crypto.randomBytes(8, function (ex, buf) {
				poll.voters.push({
					email: invitee_blob,
					token: buf.toString('hex')
				});
			});
		});

		poll.save(function(err) {
			if (err) {
				res.send(err);
			} else {
				var messages = [];
				poll.voters.forEach(function(voter) {
					messages.push({
					    "From": "avi@romanoff.me", 
					    "To": voter.email, 
					    "Subject": poll.question, 
					    "TextBody": "Someone's asked you to answer a question!\n\nPlease click here to anonymously answer yes or no: http://faststraw.com/vote/" + poll._id + "/" + voter.token
					});
				});
				postmark.batch(messages, function (error, success) {
					if (error) {
						res.send(error);
					} else {
						console.log(success);
						res.redirect('/poll/' + poll._id);
					}
				});
			}
		});
    });

    server.get('/vote/:poll_id/:voter_hash', function (req, res) {
    	Poll.findById(req.params.poll_id, function (err, poll) {
    		if (err) {
    			res.send(err);
    		} else {
    			if (poll.voters.indexOf(req.params.poll_id) != -1) {
    				res.render('poll', {question: poll.question});
    			} else {
    				res.send("Silly rabbit, Trix are for kids!");
    			}
    			console.log(poll);
    		}
    	});
    });

    server.get('/poll/:poll_id', function (req, res) {
    	Poll.findById(req.params.poll_id, function (err, poll) {
    		if (err) {
    			res.send(err);
    		} else {
    			console.log(poll);
				res.render('poll', {question: poll.question});
    		}
    	});
    });

};
