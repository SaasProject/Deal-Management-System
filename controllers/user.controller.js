var express = require('express');
var router = express.Router();
var userService = require('services/user.service');

router.post('/login', function(req, res, next) {
    userService.authenticate(req.body.email, req.body.password).then(function(token) {
        if (token) {
            req.session.token = token.token;
            req.session.user = token.user;

            res.status(200).send(token.user);
        }
    }).catch(function(err) {
        console.log(err);
        res.status(400).send({AUTH_FAIL: true});
    });
});

router.get('/current', function(req, res, next) {
    if(req.session.user !== undefined) {
        res.status(200).send(req.session.user);
    } else {
        res.status(400).send({SESSION_EXPIRED: true});
    }
});

router.get('/logout', function(req, res, next){
    delete req.session.token
    delete req.session.user;

    res.status(200).send();
});

module.exports = router;