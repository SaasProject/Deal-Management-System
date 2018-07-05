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
var fs = require('fs');
var emailService = require('services/email.service');
db.bind('deals');

var fs = require('fs');
var multer = require('multer');
var path = require('path');

var service = {};

service.addDeal = addDeal;
service.editDeal = editDeal;
service.getDealById = getDealById;
service.deleteDeal = deleteDeal;
service.uploadFile = uploadFile;


module.exports = service;

function addDeal(deal, user) {
    var deferred = Q.defer();

    var ID = "DL-0000";
    var IDnumber;
    var previousID;


    db.deals.find({}).toArray(function (err, deals) {
        if (err) deferred.reject(err);

        //use .length to get number of documents
        if (deals.length > 0) {
            previousID = deals[deals.length - 1].ID;
            IDnumber = previousID.slice(3, 7);
            IDnumber++;
            if (IDnumber <= 9) {
                ID = previousID.slice(0, 6) + IDnumber;
            } else if (IDnumber > 9 || IDnumber <= 99) {
                ID = previousID.slice(0, 5) + IDnumber;
            } else if (IDnumber > 99 || IDnumber <= 999) {
                ID = previousID.slice(0, 4) + IDnumber;
            } else {
                ID = previousID.slice(0, 3) + IDnumber;
            }
            saveToDB();
        } else {
            saveToDB();
        }
    });

    function saveToDB() {

        deal.ID = ID;

        //add change history array here
        deal['Change History'] = [];
        deal['Change History'].push({
            date: getCurrentDate(),
            user: user,
            level: deal.profile['Level'],
            content: 'Level was changed to ' + deal.profile['Level']
        });

        //set closedDate only if the level is 1
        if (deal.profile['Level'] === '1') {
            deal.closedDate = getCurrentDate();
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

function editDeal(deal, user) {
    var deferred = Q.defer();

    //get the old level for change history
    db.deals.findOne({ _id: mongo.helper.toObjectID(deal._id) }, { 'profile.Level': 1 }, function (err, aDeal) {
        if (err) {
            console.log(err)
            deferred.reject(err);
        } else if (aDeal) {
            //compare current level to the new level. 
            //if different, push to change history. else, continue
            if (aDeal.profile['Level'] !== deal.profile['Level']) {
                //deal['Change History'] array was already created during addDeal()
                deal['Change History'].push({
                    date: getCurrentDate(),
                    user: user,
                    level: deal.profile['Level'],
                    content: 'Level was changed to ' + deal.profile['Level']
                });
            }

            delete deal._id;

            if (deal.profile['Level'] === '1') {
                deal.closedDate = getCurrentDate();
            }

            db.deals.update({ ID: deal.ID }, { $set: deal }, function (err) {
                if (err) {
                    deferred.reject(err);
                }
                deferred.resolve();
            });
        } else {
            deferred.reject({ notFound: true });
        }
    });

    return deferred.promise;
}


function getDealById(ID) {
    var deferred = Q.defer();

    console.log(ID);

    db.deals.findOne({ ID: ID }, function (err, deal) {
        if (err) deferred.reject(err);

        //console.log(deal)
        if (deal) {
            deferred.resolve(deal);
        } else {
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
    db.deals.update({ ID: ID }, { $set: { deleted: true } }, function (err, writeResult) {
        if (err) {
            deferred.reject(err);
        }
        else {
            //n is used to know if the document was removed
            if (writeResult.result.nModified === 0) {
                deferred.reject({ notFound: true });
            }
            else {
                deferred.resolve();
            }
        }
    });

    return deferred.promise;
}

//jeremy 2018-07-02
function uploadFile(req, res) {
    var deferred = Q.defer();
    var storage = multer.diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
            return cb(null, file.originalname);
        },
    });
    var upload = multer({
        storage: storage,
        fileFilter: function (req, file, cb) {
            if (path.extname(file.originalname) !== '.xls' &&
                path.extname(file.originalname) !== '.xlsx' &&
                path.extname(file.originalname) !== '.ods') {
                return cb(new Error('Wrong file extension'));
            }

            cb(null, true);
        }
    }).single(req.params.name);

    upload(req, res, function (err) {
        if (err) {
            console.log('error');
            deferred.reject(err);
        } else if (!req.file) {
            console.log('no file uploaded');
            deferred.reject({ NO_FILE: true });
        } else {

            /**
             * check file type here
             */

            console.log(req.file);
            //console.log(req.file.buffer.toString());
            fs.readFile('./uploads/' + req.file.originalname, function (err, data) {
                if (err) {
                    console.log('error', err);
                    deferred.reject(err);
                } else {
                    console.log('data is: ' + data);
                    console.log(data.toString().split('\n'));
                    deferred.resolve();
                }
            });
        }
    });

    return deferred.promise;
}

//jeremy 2018-07-05
function getCurrentDate() {
    const currentDate = new Date();
    //+ 1 since month in javascript starts with 0
    var currentMonth = currentDate.getMonth() + 1, currentDay = currentDate.getDate();
    //add leading zeroes for months and days 1 to 9
    currentMonth = (currentMonth < 10) ? '0' + currentMonth : currentMonth;
    currentDay = (currentDay < 10) ? '0' + currentDay : currentDay;

    //format to yyyy/MM/dd
    return currentDate.getFullYear() + '/' + currentMonth + '/' + currentDay;
}