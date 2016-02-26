//Set up requirements
var express = require("express");
var Request = require('request');
var bodyParser = require('body-parser');
var _ = require('underscore');

//Create an 'express' object
var app = express();

//Set up the views directory
app.set("views", __dirname + '/views');
//Set EJS as templating language WITH html as an extension
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
//Add connection to the public folder for css & js files
app.use(express.static(__dirname + '/public'));

// Enable json body parsing of application/json
app.use(bodyParser.json());

/*---------------
//DATABASE CONFIG
----------------*/
var cloudant_USER = 'rkkmistry';
var cloudant_DB = 'feedme';
var cloudant_KEY = 'iseedgencedgencelivested';
var cloudant_PASSWORD = 'd42e3613059f8cea113b1c002bb1ddc8b42e482c';

var cloudant_URL = "https://rkkmistry.cloudant.com/feedme";

//Respond with the main view
app.get("/", function(req, res) {
  res.render('index.html');
});

//app.get("/user/:user", function(req, res) {
//  res.render('index.html', {page: 'othermap'});
//});

//Data serving via path parameter
//app.get("/:user", function(req,res){
//  console.log(req.params);
//  var theUserID = req.params.userID;
//  res.send(theUserID);
//});

//Data serving via query parameter
//app.get("/user", function(req,res){
//  console.log(req.query);
//  var theUserID = req.query.userID || "not sure";
//  res.send("The user id is: " + theUserID);
//});

//Respond with data
app.get("/data", function(req, res) {
  console.log('Making a db request for all entries');
	//Use the Request lib to GET the data in the CouchDB on Cloudant
	Request.get({
		url: cloudant_URL+"/_all_docs?include_docs=true",
		auth: {
			user: cloudant_KEY,
			pass: cloudant_PASSWORD
		},
		json: true
	},
	function (error, response, body){
        var theRows = body.rows;
    
		//Send the data
		console.log(theRows); 
		res.json(theRows);
	});
});

app.get("/data/:user", function(req,res){
	var user = req.params.user;
	console.log('Getting' + user + "'s Places");
	// Use the Request lib to GET the data in the CouchDB on Cloudant
	Request.get({
		url: cloudant_URL+"/_all_docs?include_docs=true",
		auth: {
			user: cloudant_KEY,
			pass: cloudant_PASSWORD
		},
		json: true
	},
	function (error, response, body){
		var theRows = body.rows;
		// Filter the results to match the current word
		var filteredRows = theRows.filter(function (d) {
			return d.doc.name == "Masala";
		});
		res.json(filteredRows);
	});
});

//SAVE an object to the db
app.post("/save", function(req,res){
	console.log("A POST!!!!");
	//Get the data from the body
	var data = req.body;
	console.log(data);
	//Send the data to the db
	Request.post({
		url: cloudant_URL,
		auth: {
			user: cloudant_KEY,
			pass: cloudant_PASSWORD
		},
		json: true,
		body: data
	},
	function (error, response, body){
		if (response.statusCode == 201){
			console.log("Saved!");
			res.json(body);
		}
		else{
			console.log("Uh oh...");
			console.log("Error: " + res.statusCode);
			res.send("Something went wrong...");
		}
	});
});

//DELETE
app.post("/delete", function(req,res){
	console.log("Deleting an object");
	var theObj = req.body;
	//The URL must include the obj ID and the obj REV values
	var theURL = cloudant_URL + '/' + theObj._id + '?rev=' + theObj._rev;
	//Need to make a DELETE Request
	Request.del({
		url: theURL,
		auth: {
			user: cloudant_KEY,
			pass: cloudant_PASSWORD
		},
		json: true
	},
	function (error, response, body){
		console.log(body);
		res.json(body);
	});
});

app.listen(3000);
console.log('Express started on port 3000');