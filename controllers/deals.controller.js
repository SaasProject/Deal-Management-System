var express = require('express');
var router = express.Router();
var dealsService = require('services/deals.service');



router.post('/addDeal', function(req, res, next) {
    
    //console.log(req.body);

    dealsService.addDeal(req.body)
    .then(function(token) {
        res.status(200);
    })
    .catch(function(err) {
        res.status(400);
    });
});

module.exports = router;

