var express = require('express');
var request = require('request'); // You can include your JSON data directly with json parameter with request library
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

/* GET home page. */
router.get('/login', function(req, res) {
  var applicationID = req.query.applicationID;
  var key = req.query.key;

    validateRequest(applicationID, key, function(responseBody){
        var content = '';
        if(responseBody){
            content = 'Success!';
            //TODO store to file
        }else{
            content = 'Something went wrong. Are you sure you have correctly configured your Data Storage integration?';
        }
        res.render('index', { title: 'Login' , content: content, body : responseBody});
    });
});

module.exports = router;
