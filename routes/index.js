var express = require('express');
var request = require('request');// You can include your JSON data directly with json parameter with request library
var fs = require("fs");
var path = require("path");
var router = express.Router();

const URI_TO_JSONBLOB = 'https://jsonblob.com/api/jsonBlob/a0ad9800-8cc0-11e7-8b46-a1d5479b81f6';

//const PATH = path.join(__dirname, "data.json");

// validate received key
// more info: https://stackoverflow.com/questions/42333598/simple-nodejs-http-request-equivalent-for-curl
function validateRequest(applicationID, key, callback) {
    var options = {
        uri: 'https://' + applicationID + '.data.thethingsnetwork.org/api/v2/query?last=7d',
        method: 'GET',
        headers: {
            'Authorization': 'key ' + key,
            'Accept': 'application/json'
        }
    };

    request(options, function (error, response, body) {
        console.log("receive status code : " + response.statusCode);
        if (response.statusCode === 200) {
            console.log(body);
            callback(body);
            return;
        }
        if (response.statusCode === 204) {
            console.log("no content");
            callback("no content");
            return;
        }
        if (error) {
            console.log(error);
        }
        callback(false);
    });
}

function containsObject(obj, list) {
    console.log("Check if "+JSON.stringify(obj) + " in list: " + JSON.stringify(list));

    for(var i = 0; i < list.length; i++)
    {
        if(list[i].applicationID === obj.applicationID && list[i].key === obj.key) return true;
    }

    return false;
}

/*function checkForFile(fileName, callback) {
    fs.stat(PATH, function (err, stat) {
        if (err == null) {
            console.log('File exists');
        } else if (err.code == 'ENOENT') {
            // file does not exist
            fs.writeFile(PATH, '');
        } else {
            console.log('Some other error: ', err.code);
        }
        callback();
    });
}*/

/*function getRegistrationsFromFile(callback) {
    checkForFile(PATH, function () {
        fs.readFile(PATH, 'utf8', function (err, data) {
            if (err) throw err;
            if (data) {
                data = JSON.parse(data);
            } else {
                data = [];
            }
            console.log("Read: " + data);
            callback(data);
        });
    });
}*/

function storeJSONObject(object, callback) {
    var request = require('request');

    var headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    var dataString = JSON.stringify(object);

    var options = {
        url: URI_TO_JSONBLOB,
        method: 'PUT',
        headers: headers,
        body: dataString
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body);
            callback();
        }
    });
}

function getJSONObject(callback) {

    var headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    var options = {
        url: URI_TO_JSONBLOB,
        headers: headers
    };


    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log("Retrieved JSON: "+body);
            callback(JSON.parse(body));
        }
    });

}

function storeRegistrationData(applicationID, key) {
    getJSONObject(function (registrations) {
        var newRegistrationData = {applicationID: applicationID, key: key};
        //only store new registration if it is a new one
        if (!containsObject(newRegistrationData, registrations)) registrations.push(newRegistrationData);
        else console.log("Already in the list");
        storeJSONObject(registrations, function(){});
    });
}

/* GET home page. */
// https://low-power-login.herokuapp.com/login?applicationID=dramco-low-power-sensor-tutorial&key=ttn-account-v2.5VvYm0qTZgr1tBpL-FmRq1XDW5mV_uo3HwR5rVp09HM
// https://low-power-login.herokuapp.com/login?applicationID=test-app-geof&key=ttn-account-v2.Q9oucCNKtijgzMNPEJ2fUKI9UoR97NKCIS2-MK8JPaE
router.post('/login', function (req, res) {
    console.log(req.body);
    var applicationID = req.body.applicationID;
    var key = req.body.accessKey;

    console.log("K: "+key+" - ID: "+applicationID);

    validateRequest(applicationID, key, function (responseBody) {
        var content = '';
        if (responseBody) {
            storeRegistrationData(applicationID, key);
            res.render("success.jade");
        } else {
            res.render("error.jade");
        }

    });
});


// Request user data
router.get('/', function (req, res) {
    res.render("index.jade");
});

// Request user data
router.get('/users', function (req, res) {
    getJSONObject(function (obj) {
        res.send(JSON.stringify(obj));
    });
});

// Request user data
router.get('/clean', function (req, res) {
    storeJSONObject([], function(){
        getJSONObject(function (obj) {
            res.send(JSON.stringify(obj));
        });
    });

});


/*router.get('/hello' , function(req,res){
    var headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    var dataString = '{"people":["bill", "steve", "bob"]}';

    var options = {
        url: 'https://jsonblob.com/api/jsonBlob',
        method: 'POST',
        headers: headers,
        body: dataString
    };


    request(options, function(error, response, body) {
        if (!error && response.statusCode === 201) {
            console.log(body);
            console.log(response.headers['location']);
            res.send(response.headers['location']);
        }
    });
});*/


module.exports = router;
