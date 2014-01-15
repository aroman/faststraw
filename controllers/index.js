'use strict';

var crypto = require('crypto');
var _ = require('underscore');
var async = require('async');
var postmark = require('postmark')(process.env.POSTMARK_API_KEY);
var Poll = require('../models/poll');

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
        // FIXME: This is so I don't get sued.
        if (invitees_blob.length > 100) {
            res.send("Hey, I'm sure you meant well, but this service is super pre-alpha right now, and I don't want to have to deal with people sending that many emails. Thanks for understanding :)")
            return;
        }
        var poll = new Poll();
        poll.question = question;
        poll.voters = [];
        async.each(_.uniq(invitees_blob.split(',')), function(invitee_blob, cb) {
            crypto.randomBytes(8, function (ex, buf) {
                poll.voters.push({
                    email: invitee_blob,
                    token: buf.toString('hex')
                });
                cb();
            });
        }, function (async_err) {
            poll.save(function(err) {
                if (err) {
                    res.send(err);
                } else {
                    var messages = [];
                    poll.voters.forEach(function(voter) {
                        messages.push({
                            'From': 'winston@faststraw.com',
                            'To': voter.email,
                            'Subject': poll.question,
                            'TextBody': "You've been asked a question on FastStraw!\n\nPlease click the link below to (anonymously) answer yes or no: http://www.faststraw.com/vote/" + poll._id + "/" + voter.token
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
    });

    server.get('/vote/:poll_id/:voter_token', function (req, res) {
        Poll.findById(req.params.poll_id, function (err, poll) {
            if (err) {
                res.send(err);
            } else {
                var index_of_voter = _.pluck(poll.voters, 'token').indexOf(req.params.voter_token);
                if (index_of_voter !== -1) {
                    if (_.has(poll.voters[index_of_voter]._doc, 'vote')) {
                        res.redirect("/cheater");
                        return;
                    } else {
                        res.render('vote', {question: poll.question});
                    }
                } else {
                    res.send('Silly rabbit, Trix are for kids!');
                }
            }
        });
    });

    server.post('/vote/:poll_id/:voter_token', function (req, res) {
        Poll.findById(req.params.poll_id, function (err, poll) {
            if (err) {
                res.send(err);
            } else {
                var index_of_voter = _.pluck(poll.voters, 'token').indexOf(req.params.voter_token);
                if (index_of_voter !== -1) {
                    if (_.has(poll.voters[index_of_voter]._doc, 'vote')) {
                        res.redirect("/cheater");
                        return;
                    }
                    poll.voters[index_of_voter].date_voted = Date.now();
                    if (_.has(req.body, "yes")) {
                        // Yes
                        poll.voters[index_of_voter].vote = true;
                    } else if (_.has(req.body, "no")) {
                        // No
                        poll.voters[index_of_voter].vote = false;
                    } else {
                        // unknown
                        res.send("Your browser did something stupid");
                        return;
                    }
                    poll.save(function(err) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.redirect("/thankyou");
                        }
                    });
                } else {
                    res.send('Silly rabbit, Trix are for kids!');
                }
            }
        });
    });

    server.get("/thankyou", function (req, res) {
        res.render("thankyou");
    });

    server.get("/cheater", function (req, res) {
        res.render("cheater");
    });

    server.get('/poll/:poll_id', function (req, res) {
        Poll.findById(req.params.poll_id, function (err, poll) {
            if (err) {
                res.send(err);
            } else {
                console.log(poll);
                var num_voted = 0;
                var num_yes = 0;
                var num_no = 0;
                var num_total = poll.voters.length;
                _.each(poll.voters, function(voter) {
                    if (voter.vote === true) {
                        num_yes++;
                        num_voted++;
                    }
                    else if (voter.vote === false) {
                        num_no++;
                        num_voted++;
                    }
                });
                res.render('poll', {question: poll.question,
                    num_yes: num_yes,
                    num_no: num_no,
                    num_voted: num_voted,
                    num_total: num_total
                });
            }
        });
    });

};
