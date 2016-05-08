/*---------------
//REQUIREMENTS
----------------*/

var express = require("express");
var Request = require('request');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var _ = require('underscore');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var Cloudant = require('cloudant');
var env2 = require('env2')('config.env');

/*---------------
//DATABASE CONFIG
----------------*/

var me = process.env.cloudant_USERNAME;
var password = process.env.cloudant_USERPASS;
var cloudant = Cloudant({account:me, password:password});

//Production Details
//var cloudant_KEY = process.env.PROD_KEY;
//var cloudant_PASSWORD = process.env.PROD_PASSWORD;
//var db = cloudant.db.use(process.env.PROD_DB);

//Development Details
var cloudant_KEY = process.env.DEV_KEY;
var cloudant_PASSWORD = process.env.DEV_PASSWORD;
var db = cloudant.db.use(process.env.DEV_DB);

/*---------------
APP SETUP 
----------------*/

//Create an 'express' object
var app = express();

//Set up the views directory
app.set("views", __dirname + '/views');
//Set EJS as templating language WITH html as an extension
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
//Add connection to the public folder for css & js files
app.use(express.static(__dirname + '/public'));

//passport.serializeUser(function(user, done) {
//  done(null, user);
//});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.list({include_docs: true}, function(err, body) {
      body.rows.forEach(function(user){
        if(id == user.doc.id) {
          console.log("USER: ", user);
          done(err, user.doc);
        }
      });
  });
});

// Enable json body parsing of application/json
app.use(cookieParser()); 
app.use(session({ 
	secret: 'cookie_secret',
	name:   'kaas',
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
    clientID: process.env.client_ID,
    clientSecret: process.env.client_SECRET,
    callbackURL: process.env.DEV_URL + "/auth/google/callback", 
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
          
      db.list({include_docs: true}, function(err, body) {
        if (!err) {
          if(body.rows.every(checkUser)) {
            console.log("Saving a New User!");
            saveUser(userDataObj);
          } else {
            console.log("Already a User!");
            return done(null, profile);
          }
        } else {
          console.log("Something went wrong getting docs...", err);
        }
      });
    });
  
    function saveUser(userObj, callback){
      db.insert(userObj, function(err, body) {
          if (!err) {
            console.log("New User Saved!");
            return done(null, profile);
          } else {
            res.send("Something went wrong saving new user...");
            console.log(err);
          }     
        });
      }

    function checkUser(elem) {
      return elem.doc.id !== profile.id && elem.doc.type == "user";
    }
}));

/*---------------
//ROUTES
----------------*/

//HOME
app.get("/", function(req, res) {
  res.render('index.html', {page: 'homePage', user: req.user});
});

//LOGIN
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login'] 
  }
));

//LOGIN CALLBACK
app.get('/auth/google/callback', 
  passport.authenticate( 'google', { 
    successRedirect: '/edit',
    failureRedirect: '/'
  }
));

//LOGOOUT
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//EDIT
app.get("/edit", ensureAuthenticated, function(req, res) {
  res.render('index.html', {page: 'homePage', user: req.user});
});

//GET DATA
app.get("/data", function(req, res) {
  console.log('Get all db entries');
  db.list({include_docs: true}, function(err, body) {
    if (!err) {
      console.log('Got all entries');
      res.json(body.rows);
    } else {
      console.log("Something went wrong getting docs...", err);
    }
  });
});

//SAVE
app.post("/save", function(req,res){
  console.log("Trying to save...");
  db.insert(req.body, function(err, body) {
    if (!err) {
      console.log("New Thing Saved!");
      res.json(body);
    } else {
      res.send("Something went wrong saving the thing...");
      console.log(err);
    }     
  });
});

//UPDATE
app.post("/update", function(req,res){
  console.log("Updating something!");
  db.insert(req.body, function(err, body) {
    if (!err) {
      console.log("Thing Updated!");
      res.json(body);
    } else {
      res.send("Something went wrong updating the thing...");
      console.log(err);
    }     
  });
});

//DELETE
app.post("/delete", function(req,res){
  console.log("Deleting an object!");
  db.destroy(req.body, function(err, body) {
    if (!err) {
      console.log("Object deleted!");
      console.log(body);  
    } else {
      console.log("Something went wrong deleting...", error);
    }
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/google');
}

app.listen(process.env.PORT || 3000);
console.log('Express started on port 3000');