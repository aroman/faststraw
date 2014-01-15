
var kraken = require('kraken-js'),
	mongoose = require('mongoose'),
    app = {};


app.configure = function configure(nconf, next) {
    // Fired when an app configures itself
    mongoose.connect('mongodb://faststraw:fastpass@ds053858.mongolab.com:53858/faststraw');
    mongoose.connection.on('connected', function () {
    	console.log("Connected to database, passing the reins back to Kraken.");
    	next(null);
    });
};


app.requestStart = function requestStart(server) {
    // Fired at the beginning of an incoming request
};


app.requestBeforeRoute = function requestBeforeRoute(server) {
    // Fired before routing occurs
};


app.requestAfterRoute = function requestAfterRoute(server) {
    // Fired after routing occurs
};


kraken.create(app).listen(function (err) {
    if (err) {
        console.error(err);
    }
});
