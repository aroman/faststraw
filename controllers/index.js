'use strict';


module.exports = function (server) {

    server.get('/', function (req, res) {
        var model = { name: 'faststraw' };
        
        res.render('index', model);
        
    });

};
