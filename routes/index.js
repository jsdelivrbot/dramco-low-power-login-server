var express = require('express');
var request = require('request');// You can include your JSON data directly with json parameter with request library
var fs = require("fs");
var router = express.Router();

// validate received key
// more info: https://stackoverflow.com/questions/42333598/simple-nodejs-http-request-equivalent-for-curl
function validateRequest(applicationID, key, callback) {
    var options = {
        uri: 'https://'+applicationID+'.data.thethingsnetwork.org/api/v2/query?last=7d',
        method: 'GET',
        headers: {
            'Authorization': 'key '+key,
            'Accept': 'application/json'
        }
    };

     var req = request(options, function(error, response, body) {
         console.log("receive status code : " + response.statusCode);
         if (response.statusCode === 200) {
             console.log(body);
             callback(body);
             return;
         }
        if (error) {
            console.log(error);
        }
        callback(false);
    });
}

function containsObject(obj, list) {
    var x;
    for (x in list) {
        if (list.hasOwnProperty(x) && x.applicationID === obj.applicationID && x.key === obj.key) {
            return true;
        }
    }

    return false;
}

function addRegistrationToFile(applicationID,key) {
        fs.readFile("data.json", 'utf8', function (err, data) {
            if (err.code === 'ENOENT') {
                console.log('File not found!');
                // no problem
            } else {
                throw err;
            }

            var newRegistrationData = {applicationID: applicationID, key: key};
            var oldRegistrationData = [];
            if (data instanceof Array) {
                oldRegistrationData = data;
            }
            //only store new registration if it is a new one
            if(!containsObject(newRegistrationData,oldRegistrationData)) oldRegistrationData.push(newRegistrationData);
            fs.writeFile ("data.json", JSON.stringify(oldRegistrationData), function(err) {
                if (err) throw err;
                console.log('complete');
            });
        });
}

/* GET home page. */
// https://low-power-login.herokuapp.com/login?applicationID=dramco-low-power-sensor-tutorial&key=ttn-account-v2.5VvYm0qTZgr1tBpL-FmRq1XDW5mV_uo3HwR5rVp09HM
router.get('/login', function(req, res) {
  var applicationID = req.query.applicationID;
  var key = req.query.key;

    validateRequest(applicationID, key, function(responseBody){
        var content = '';
        if(responseBody){
            content = 'Success!';
            addRegistrationToFile(applicationID,key);
        }else{
            content = 'Something went wrong. Are you sure you have correctly configured your Data Storage integration?';
        }
        res.render('index', { title: 'Login' , content: content, body : responseBody});
    });
});


// Request user data
router.get('/users', function(req,res){
    fs.readFile("data.json", 'utf8', function (err, data) {
        if (err.code === 'ENOENT') {
            console.log('File not found!');
            // no problem
        } else {
            throw err;
        }

        var registrationData = [];
        if (data instanceof Array) {
            registrationData = data;
        }
        res.send(JSON.stringify(registrationData));
    });
});


module.exports = router;
