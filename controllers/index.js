'use strict';


module.exports = function (server) {

    server.get('/', function (req, res) {
        var model = { name: 'FastStraw' };
        
        res.render('index', model);
        
    });

};
