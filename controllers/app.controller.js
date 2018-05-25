var express = require('express');
var router = express.Router();

router.use('/', function (req, res, next) {
    next();
});

router.get('/token', function (req, res) {
    res.send(req.session.token);
});

router.use('/', express.static('app'));
 
module.exports = router;