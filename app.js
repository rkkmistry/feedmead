//Set up requirements
var express = require("express");
var Request = require('request');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var _ = require('underscore');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var nano = require('nano')('https://rkkmistry.cloudant.com/');
var db = nano.use('feedme-dev');


//nano.db.get('feedme-dev', function(err, body) {
//  if (!err) {
//    console.log(body);
//  }
//});

db.get('rabbit', { revs_info: true }, function(err, body) {
  if (!err){
    console.log(body);
  }
  else{
    console.log(err);
  }
  });


//Create an 'express' object
var app = express();

//Set up the views directory
app.set("views", __dirname + '/views');
//Set EJS as templating language WITH html as an extension
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
//Add connection to the public folder for css & js files
app.use(express.static(__dirname + '/public'));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Enable json body parsing of application/json
app.use(cookieParser()); 
app.use(session({ 
	secret: 'cookie_secret',
	name:   'kaas',
//	store:  new RedisStore({
//		host: '127.0.0.1',
//		port: 6379
//	}),
	proxy:  true,
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

/*---------------
//AUTH CONFIG
----------------*/

passport.use(new GoogleStrategy({  
    clientID: "310950737477-acoudi08epsnul7vp0qnejt95ria91i4.apps.googleusercontent.com",
    clientSecret: "UPkyLSMsA0AD9_Q3pD8j1sj9",
    callbackURL: "http://localhost:3000/auth/google/callback", 
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log("*********************");
    console.log(profile)
    console.log("*********************");      

    process.nextTick(function () {
      
      userDataObj = {
        type: "user",
        id: profile.id,
        name: profile.displayName
      }
      
      //get all users
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
        theRows = theRows.filter(function (d) {
          if (d.doc.type == "user") {
            return d.doc;
          }
        });
        
        
        if(theRows.every(function(elem){return elem.doc.id !== profile.id})) {
          saveTheUser(userDataObj);
        } else {
          console.log("Already a user!")
          return done(null, profile);
        }
        
//        var stupidBoolean = true;
//        
//        theRows.forEach(function(elem){
//          if (elem.doc.id == profile.id) {
//            console.log("Already a user!")
//            stupidBoolean = false;
//            return done(null, profile);
//          }
//        });
//        
//        if(stupidBoolean) {
//           //if person is not a user then make new profile
//            Request.post({
//              url: cloudant_URL,
//              auth: {
//                  user: cloudant_KEY,
//                  pass: cloudant_PASSWORD
//              },
//              json: true,
//              body: userDataObj
//            },
//            function (error, response, body) {
//              if (response.statusCode == 201) {
//                console.log("Saved new user");
//                return done(null, profile);
//              } else {
//                console.log("Error: " + res.statusCode);
//                res.send("Something went wrong...");
//              }
//            });
//        }
 
      });
      
    });
  }
));


function saveTheUser(userObj, callback){
    Request.post({
        url: cloudant_URL,
        auth: {
            user: cloudant_KEY,
            pass: cloudant_PASSWORD
        },
        json: true,
        body: userObj
      },
      function (error, response, body) {
        if (response.statusCode == 201) {
          console.log("Saved new user");
          return done(null, profile);
        } else {
          console.log("Error: " + res.statusCode);
          res.send("Something went wrong...");
        }
      });
}




/*---------------
//DATABASE CONFIG
----------------*/
var cloudant_USER = 'rkkmistry';

//production version
//var cloudant_DB = 'feedme';
//var cloudant_KEY = 'iseedgencedgencelivested';
//var cloudant_PASSWORD = 'd42e3613059f8cea113b1c002bb1ddc8b42e482c';

//development version
var cloudant_DB = 'feedme-dev';
var cloudant_KEY = 'stryoustromedispentillet';
var cloudant_PASSWORD = 'c13f6c01943b3de8484e6d93d6ed63b84c2f2b3c';

var cloudant_URL = "https://rkkmistry.cloudant.com/" + cloudant_DB;

/*---------------
//ROUTES
----------------*/


//Respond with the main view
app.get("/", function(req, res) {
  console.log("--------------------");
  console.log(req.url);
  console.log(req.headers);
  console.log(req.ip);
  console.log("--------------------");
  res.render('index.html', {page: 'homePage', user: req.user});
});

//for login
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login'] 
  }
));

app.get('/auth/google/callback', 
  passport.authenticate( 'google', { 
    successRedirect: '/edit',
    failureRedirect: '/'
  }
));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//Respond with the main view
app.get("/edit", ensureAuthenticated, function(req, res) {
  res.render('index.html', {page: 'homePage', user: req.user});
});

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
      //Send the data
      //console.log(body.rows); 
      res.json(body.rows);
	});
});

//app.get("/data/:user", function(req,res){
//	var user = req.params.user;
//	console.log('Places for ' + user);
//	
//  // Use the Request lib to GET the data in the CouchDB on Cloudant
//	Request.get({
//		url: cloudant_URL+"/_all_docs?include_docs=true",
//		auth: {
//			user: cloudant_KEY,
//			pass: cloudant_PASSWORD
//		},
//		json: true
//	},
//	function (error, response, body){
//		var theRows = body.rows;
//		// Filter the results to match the current word
//		var filteredRows = theRows.filter(function (d) {
//          if (d.doc.user == user) {
//            console.log(d.doc);
//            return d.doc;
//          }
//		});
//		res.json(filteredRows);
//	});
//});

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

//UPDATE
app.post("/update", function(req,res){
	console.log("Updating an object");
	var theObj = req.body;
	//Send the data to the db
	Request.post({
		url: cloudant_URL,
		auth: {
			user: cloudant_KEY,
			pass: cloudant_PASSWORD
		},
		json: true,
		body: theObj
	},
	function (error, response, body){
		if (response.statusCode == 201){
			console.log("Updated!");
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

//do i even need this?
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/google');
}

app.listen(process.env.PORT || 3000);
console.log('Express started on port 3000');