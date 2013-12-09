'use strict';

var mongoose = require('mongoose');

var pollSchema = new mongoose.Schema({
	created: {type: Date, default: Date.now},
	owner: String,
	question: String,
	voters: [{
		email: String,
		date_voted: Date,
		vote: Boolean
	}]
})

module.exports = mongoose.model('Poll', pollSchema);