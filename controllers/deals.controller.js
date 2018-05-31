var express = require('express');
var router = express.Router();
var dealsService = require('services/deals.service');



router.post('/addDeal', function(req, res, next) {
    
    //console.log(req.body);

    dealsService.addDeal(req.body)
    .then(function() {
        res.status(200).send();
    })
    .catch(function(err) {
        res.status(400).send();
    });
});

router.put('/editDeal', function(req, res, next) {
    
    console.log(req.body);

    dealsService.editDeal(req.body)
    .then(function() {
        res.status(200).send();
    })
    .catch(function(err) {
        res.status(400).send();
    });
});

module.exports = router;

