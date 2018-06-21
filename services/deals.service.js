/*
    Deals Service
    Author(s): Sanchez, Macku
                Reccion, Jeremy
    Date Created: June 2018
    Date Modified: June 07, 2018
    Description: Service for the Deals Page
    Functions:
        addDeal();
        editDeal();
        getDealById();
        deleteDeal();
*/

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
service.getDealById = getDealById;
service.deleteDeal = deleteDeal;

 
module.exports = service;

function addDeal(deal){
    var deferred = Q.defer();

    var ID = "DL-0000";
    var IDnumber;
    var previousID;


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

        deal.ID = ID;
        //set deleted flag to false
        deal.deleted = false;
        
        if(deal.profile['Level'] === '1' && (deal.closedDate === undefined || deal.closedDate === null)){
            var currentDate = new Date();
            var currentMonth = currentDate.getMonth() + 1;
            currentMonth = (currentMonth < 10) ? '0' + currentMonth : currentMonth;
            
            deal.closedDate = currentDate.getFullYear() + currentMonth + currentDate.getDate();
            console.log(deal.closedDate);
        }
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
    
    if(deal.profile['Level'] === '1'  && (deal.closedDate === undefined || deal.closedDate === null)){
        var currentDate = new Date();
        var currentMonth = currentDate.getMonth() + 1;
        currentMonth = (currentMonth < 10) ? '0' + currentMonth : currentMonth;
        
        deal.closedDate = currentDate.getFullYear() + '-' + currentMonth + '-' + currentDate.getDate();
        console.log(deal.closedDate);
    }

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

//jeremy - 06/06/2018
//ID is the deal's ID (e.g. DL-0000) not _id
function deleteDeal(ID) {
    var deferred = Q.defer();

    //set the deleted flag to true
    db.deals.update({ID: ID}, {$set: {deleted: true}}, function(err, writeResult) {
        if(err){
            deferred.reject(err);
        }
        else{
            //n is used to know if the document was removed
            if(writeResult.result.nModified === 0){
                deferred.reject({notFound: true});
            }
            else{
                deferred.resolve();
            }
        }
    });

    return deferred.promise;
}