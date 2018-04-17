/*
 * Simple node.js express server
 * By John Godbey 2018
 */

// Includes
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// The sample UUID is: d1fdd200-3e9e-11e8-b467-0ed5f89f718b

// Error message to return on bad file request
var fileNotFoundError = 'Could not find the specified email.';


app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    return next();
})


app.post('/requestEmailArchive', function (req, res) {
    console.log(req.body);      // file requested
	// There may be some safety issues here.
	// The server should probably only be allowed to send very specific files
	var filepath = path.join(__dirname + '/' + (req.body)['filename']);
	if (fs.existsSync(filepath)){
		res.sendFile(filepath);
	} else {
		res.status(500).send(JSON.stringify(fileNotFoundError));
	}
})

app.get('/', (req, res) => {
  res.status(200).send('Hello, world!').end();
});

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Email Archive listening at http://%s:%s", host, port)

})