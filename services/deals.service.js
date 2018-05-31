var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var fs=require('fs');
var emailService = require('services/email.service');
db.bind('deals');

var fs = require('fs');
 
var service = {};

service.addDeal = addDeal; 
service.editDeal = editDeal;    // macku

 
module.exports = service;

function addDeal(deal){
    var deferred = Q.defer();

    var possibleID = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var randomedID ="";

	randomize();

    function randomize(){
	    
	    for (var z = 0; z < 5; z++){
			     randomedID += possibleID.charAt(Math.floor(Math.random() * possibleID.length));
			}
		deal.ID = randomedID;
		checkForDuplicate();
	}

	function checkForDuplicate(){
		db.deals.findOne({ ID: deal.ID }, function (err, deal) {
	        if(deal){
	        	randomize();
	        }else{
	        	addDealtoDB();
	        }
	    });
	}


	function addDealtoDB(){
	    db.deals.insert(
	            deal,
	            function (err, doc) {
	                if (err) deferred.reject(err);
	 
	                deferred.resolve();
	            });
	}


    return deferred.promise;
}

function editDeal(deal){
	var deferred = Q.defer();


	db.deals.update({ID : deal.ID}, {$set: deal}, function(err){
            if(err) {
               deferred.reject(err);
            }
            deferred.resolve();
        });

	return deferred.promise;
}
