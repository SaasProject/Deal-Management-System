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
service.getAllClients = getAllClients; //glenn
service.updateClient = updateClient; //glenn
service.deleteClient = deleteClient; //glenn
 
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

//glenn
function getAllClients() {
	var deferred = Q.defer();

    db.clients.find({}).toArray(function(err, client) {
        if (err) deferred.reject(err);
 
        if (client) {
            deferred.resolve(client);
        }
    });
    
    return deferred.promise;
}

//glenn
function updateClient(_id, clientParam) {
	var set = _.omit(clientParam,'_id');
    var deferred = Q.defer();
    
    db.clients.update({_id: mongo.helper.toObjectID(_id)}, {$set: set}, function(err){
        if(err) {
           deferred.reject(err);
        }
        deferred.resolve();
    });

    return deferred.promise;
}

//glenn
function deleteClient(_id){
	var deferred = Q.defer();

	db.clients.findById(_id, function (err, client) {
        if (err) deferred.reject(err);

		if(client) {

			db.clients.remove(
			{ _id: mongo.helper.toObjectID(_id) },
			function (err) {
				if (err){};
 
				deferred.resolve();
			});
		}
		else {
			deferred.reject();
		}

    });

    return deferred.promise;
}
 
