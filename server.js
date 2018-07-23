/*Main Server of the Saas Team Project*/
require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');


const scheduler = require('node-schedule');
const moment = require('moment');

//added by dyan0 --socket.io for realtime
var http = require('http').Server(app);
var io = require('socket.io')(http);

//macku
var net = require('net'),
    JsonSocket = require('json-socket');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://192.168.223.65:27017/";
var ObjectID = require('mongodb').ObjectID;
var fs = require('fs');

//services for email reminders
//const userService = require('./services/user.service');
const ModuleService = require('./services/modules.service');
const EmailService = require('./services/email.service');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/profile_pictures'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true })); //equvalent of 9h (same as jwt)

// use JWT auth to secure the api   // edited by dyan0: added '/api/users/emailOn'
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/user/login', '/api/user/current', '/api/user/logout'] }), function (err, req, res, next) {

});

// routes
app.use('/app', require('./controllers/app.controller'));
app.use('/api/user', require('./controllers/api/user.controller'));
app.use('/api/client', require('./controllers/api/client.controller'));
app.use('/api/deals', require('./controllers/api/deals.controller'));
app.use('/api/modules', require('./controllers/api/modules.controller'));

app.use('/scripts', express.static(__dirname + '/node_modules/'));


//added by dyan0
io.on('connection', function (socket) {

    //console.log('a user is connected');
    socket.on('disconnect', function () {
        //console.log('a user has disconnected');
    })
});

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});



// start server --edited by dyan0 from app.listen to http.listen
var server = http.listen(5000, function () {
    console.log(5000);
    //[sec] (optional) [min] [hour] [day of month] [month] [day of week]

    scheduler.scheduleJob('*/30 * * * *', function () {
        console.log('every 30 min of the clock');
        console.log(new Date().toLocaleTimeString());
        ModuleService.getAllModuleDocs('deals').then(function (deals) {
            for (var i = 0; i < deals.length; i++) {
                //check the due date and compare to the current date
                if(moment().diff(deals[i]['essential']['Due Date'].replace(/\//g, '-'), 'days', false) > 0) {
                    console.log('overdue: ' + deals[i]['essential']['Deal Name']);
                    console.log('people responsible: \n' + deals[i]['essential']['Assignee'] + '\n' + 
                    deals[i]['profile']['AWS Resp (Sales) person'] + '\n' + 
                    deals[i]['profile']['AWS Resp (Dev) person']);
                }
            }
        });

        //email jeremy.reccion@awsys-i.com using jeremybreccion@gmail.com
    });
});