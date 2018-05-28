var express = require('express');
var router = express.Router();
var clientService = require('services/client.service');

router.post('/addClient', function(req, res, next) {
    
    //console.log(req.body);

    clientService.addClient(req.body)
    .then(function(token) {
        res.status(200);
    })
    .catch(function(err) {
        res.status(400);
    });
});


module.exports = router;