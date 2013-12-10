'use strict';

var mongoose = require('mongoose');

var pollSchema = new mongoose.Schema({
	created: {type: Date, default: Date.now},
	question: String,
	voters: [{
		email: String,
		token: String,
		date_voted: Date,
		vote: Boolean
	}]
})

module.exports = mongoose.model('Poll', pollSchema);