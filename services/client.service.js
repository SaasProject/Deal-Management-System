var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var fs=require('fs');
var emailService = require('services/email.service');
db.bind('clients');

var fs = require('fs');
 
var service = {};



service.addClient = addClient;    // macku

 
module.exports = service;



function addClient(client){
    var deferred = Q.defer();
    //console.log(client)


     db.clients.insert(
            client,
            function (err, doc) {
                if (err) deferred.reject(err);
 
                deferred.resolve();
            });

    return deferred.promise;
}
 
