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
service.editDeal = editDeal;  
service.getDealById = getDealById;   // macku

 
module.exports = service;

function addDeal(deal){
    var deferred = Q.defer();

    var ID = "DL-0000";
    var IDnumber;
    var previousID;

    /*var possibleID = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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

*/


	db.deals.find({}).toArray(function(err, deals) {
        if (err) deferred.reject(err);
 
		//use .length to get number of documents
        if (deals.length > 0) {
            previousID = deals[deals.length-1].ID;
            IDnumber = previousID.slice(3,7);
            IDnumber++;
            if(IDnumber<=9){
                ID = previousID.slice(0,6)+IDnumber;
            }else if(IDnumber>9||IDnumber<=99){
            	ID = previousID.slice(0,5)+IDnumber;
            }else if(IDnumber>99||IDnumber<=999){
                ID = previousID.slice(0,4)+IDnumber;
            }else{
            	ID = previousID.slice(0,3)+IDnumber;
            }
            saveToDB();
        }else{
        	saveToDB();
        }
    });

    function saveToDB(){

    	deal.essential.ID = ID;
    	
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


	delete deal._id;

	db.deals.update({ID : deal.ID}, {$set: deal}, function(err){
            if(err) {
               deferred.reject(err);
            }
            deferred.resolve();
        });

	return deferred.promise;
}


function getDealById(ID) {
    var deferred = Q.defer();
    
    console.log(ID);
 
    db.deals.findOne({ID:ID}, function (err, deal) {
        if (err) deferred.reject(err);
 
        	//console.log(deal)
        	if(deal){
            	deferred.resolve(deal);
            }else{
            	deferred.reject();
            }

    });

    return deferred.promise;
}