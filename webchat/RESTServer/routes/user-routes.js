var express = require('express'),
    _       = require('lodash'),
    config  = require('../config'),
    jwt     = require('jsonwebtoken');
var bcrypt = require('bcrypt');	
var mongoose = require('mongoose');  
var User = require('../models/user');


var app = module.exports = express.Router();

// XXX: This should be a database of users :).
var users = [{
  id: 1,
  username: 'gonto',
  password: 'gonto'
}];

function createToken(user) {
return jwt.sign({username: user.username, extra: Math.random()}, config.secret, { expiresInMinutes: 60*5 });
}

function getUserScheme(req) {
  
  var username;
  var type;
  var userSearch = {};

  // The POST contains a username and not an email
  if(req.body.username) {
    username = req.body.username;
    type = 'username';
    userSearch = { username: username };
  }
  // The POST contains an email and not an username
  else if(req.body.email) {
    username = req.body.email;
    type = 'email';
    userSearch = { email: username };
  }

  return {
    username: username,
    type: type,
    userSearch: userSearch
  }
}

app.post('/users', function(req, res) {
  
  var userScheme = getUserScheme(req);  

  if (!userScheme.username || !req.body.password) {
    res.status(400).send("You must send the username and the password");
  }
  else if(req.body.password.length <= 4){
	res.status(400).send("password must be greater than 5 characters");
  }
  else{
    var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(req.body.password, salt);
	req.body.password = hash;
    var user = new User(req.body);
	
	User.findOne({username: new RegExp('^'+userScheme.username+'$', "i")}, function(err, user2) {
	  if (err){
		  res.status(400).send(err);
	  }
	  else if(!user2 || user2.length === 0){
		  user.save(function(err) {
				if (err) {
					res.status(400).send("Username already taken");
				}
				else{
					res.status(201).send({
						id_token: createToken(user)
					  });
				}
			});
	  }
	  else{
		  res.status(400).send("user already exists");
		}
	});
    
  }
});

app.post('/sessions/create', function(req, res) {

  var userScheme = getUserScheme(req);

  if (!userScheme.username || !req.body.password) {
    return res.status(400).send("You must send the username and the password");
  }
  
User.findOne({username: new RegExp('^'+userScheme.username+'$', "i")}, function(err, user) {
  if (err){
	  res.status(400).send(err);
  }
  else if(!user || user.length ===0){
	  res.status(400).send("passwords do not match");
  }
  else if(!(bcrypt.compareSync(req.body.password, user.password))){
	  res.status(400).send("passwords do not match");
  }
  else{
	  res.status(201).send({
				id_token: createToken(user)
	  });
  }

});
  
});