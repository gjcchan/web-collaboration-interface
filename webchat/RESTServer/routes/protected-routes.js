var express = require('express');
var jwt     = require('express-jwt');
var jwt2     = require('jsonwebtoken');
var config  = require('../config');

var mongoose = require('mongoose');  
var ChatRoom = require('../models/chatRoom');
var ChatRoomUser = require('../models/chatRoomUser');
var ChatRoomLog = require('../models/chatRoomLog');
var ToDo = require('../models/toDo');
var Memo = require('../models/memo');
var Files = require('../models/files');

var app = module.exports = express.Router();

var jwtCheck = jwt({
  secret: config.secret
});

app.use('/api/protected', jwtCheck);



app.post('/api/protected/chatRoom', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		var decode = decoded
		if (err){
			res.status(401).send(err);
		}
		else{
			if(req.body.password.length <= 4){
				res.status(400).send("password must be greater than 5 characters");
			}
			else{
				
				ChatRoom.find({name: new RegExp('^'+req.body.name+'$', "i")}, function(err, rooms) {
				  if (err){
					  res.status(400).send(err);
				  }
				  else if(!rooms|| 0===rooms.length){
					    room = new ChatRoom({owner: decoded.username, password:req.body.password, name:req.body.name});
				
						room.save(function(err) {
							if (err) {
								res.status(400).send("Chat Room name already taken");
							}
							else{
								room2 = new ChatRoomUser({user: decoded.username, name:req.body.name});
								room2.save(function(err) {
									if (err) {
										res.status(400).send(err);
									}
									else{
										res.status(201).send({});
									}
								});
							}
						});
				  }
				  else{
						
						res.status(400).send("room already exists");
					}
				});
					
				
				
			}
		}
	});
});

app.get('/api/protected/chatRoom', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			ChatRoom.find({owner: new RegExp('^'+decoded.username+'$', "i")}, function(err, rooms) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else{
				  res.status(200).json(rooms);
			  }

			});
		}
	});
});

app.delete('/api/protected/chatRoom', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(400).send(err);
		}
		else{
			ChatRoom.findOneAndRemove({owner: new RegExp('^'+decoded.username+'$', "i"),name:new RegExp('^'+req.body.name+'$', "i")}, function(err) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else{
				   ChatRoomUser.remove({name: new RegExp('^'+req.body.name+'$', "i")}, function(err) {
					  if (err){
						  res.status(400).send(err);
					  }
					  else{
						 ToDo.remove({room: new RegExp('^'+req.body.name+'$', "i")}, function(err) {
							  if (err){
								  res.status(400).send(err);
							  }
							  else{
								 Memo.remove({room: new RegExp('^'+req.body.name+'$', "i")}, function(err) {
									  if (err){
										  res.status(400).send(err);
									  }
									  else{
										 Files.remove({room: new RegExp('^'+req.body.name+'$', "i")}, function(err) {
											  if (err){
												  res.status(400).send(err);
											  }
											  else{
												 res.status(204).send({});
											  }

										});
									  }

								});
							  }

						});
					  }

					});
			  }
			});
		}

	});
});


app.post('/api/protected/chatRoomUser', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			ChatRoom.find({name: new RegExp('^'+req.body.name+'$', "i"),password: new RegExp('^'+req.body.password+'$', "i")}, function(err, rooms) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else if(!rooms|| 0===rooms.length){
				  res.status(400).send("username and password don't match");
			  }
			  else{
					
					ChatRoomUser.find({name: new RegExp('^'+req.body.name+'$', "i"),user: new RegExp('^'+decoded.username+'$', "i")}, function(err, rooms2) {
						if (err){
							res.status(400).send(err);
						}
						else if(!rooms2|| 0===rooms2.length){
							room = new ChatRoomUser({user: decoded.username, name:req.body.name});
							room.save(function(err) {
								if (err) {
									res.status(400).send(err);
								}
								else{
									res.status(201).send({});
								}
							});
						}
						else{
							res.status(400).send("you are already in the room");
						}
						
					});
				}
			});
		}
	});
	
});

app.get('/api/protected/chatRoomUser', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			  ChatRoomUser.find({user: new RegExp('^'+decoded.username+'$', "i")}, function(err, rooms) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else{
				  res.status(200).json(rooms);
			  }

			});
		}
		

	});
});

app.delete('/api/protected/chatRoomUser', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			ChatRoomUser.findOneAndRemove({user: new RegExp('^'+decoded.username+'$', "i"),name:new RegExp('^'+req.body.name+'$', "i")}, function(err) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else{
				  res.status(204).send({});
			  }

			});
		}
		

	});
});


app.post('/api/protected/todo', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			ChatRoomUser.find({user: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+req.body.room+'$', "i")}, function(err, rooms) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else if(!rooms|| 0===rooms.length){
				  ChatRoom.find({owner: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+req.body.room+'$', "i")}, function(err, rooms2) {
					   if (err){
						  res.status(400).send(err);
					  }
					  else if(!rooms2|| 0===rooms2.length){
						res.status(403).send("you don't have permission");  
					  }
					  else{
						ToDo.find({room: new RegExp('^'+req.body.room+'$', "i"), todo:new RegExp('^'+req.body.todo+'$', "i")}, function(err, todo) {
							  if (err){
								  res.status(400).send(err);
							  }
							  else if(!todo|| 0===todo.length){
								todo2 = new ToDo({todo:req.body.todo, room:req.body.room});
								todo2.save(function(err) {
									if (err) {
										res.status(400).send(err);
									}
									else{
										res.status(201).send({});
									}
								});
							  }
							  else{
								res.status(400).send('todo already exists');
							  }
							}); 
					  }
				  });
				  
			  }
			  else{
				ToDo.find({room: new RegExp('^'+req.body.room+'$', "i"), todo:new RegExp('^'+req.body.todo+'$', "i")}, function(err, todo) {
				  if (err){
					  res.status(400).send(err);
				  }
				  else if(!todo|| 0===todo.length){
					todo2 = new ToDo({todo:req.body.todo, room:req.body.room});
					todo2.save(function(err) {
						if (err) {
							res.status(400).send(err);
						}
						else{
							res.status(201).send({});
						}
					});
				  }
				  else{
					res.status(400).send('todo already exists');
				  }
				});
			  }

			});
		}
	});
});

app.get('/api/protected/todo', function(req, res) {
	var room = req.headers['room'];
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			ChatRoomUser.find({user: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+room+'$', "i")}, function(err, rooms) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else if(!rooms|| 0===rooms.length){
				   ChatRoom.find({owner: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+room+'$', "i")}, function(err, rooms2) {
					   if (err){
						  res.status(400).send(err);
					  }
					  else if(!rooms2|| 0===rooms2.length){
						res.status(403).send("you don't have permission");  
					  }
					  else{
						 ToDo.find({room: new RegExp('^'+room+'$', "i")}, function(err, todo) {
						  if (err){
							  res.status(400).send(err);
						  }
						  else{
							res.status(200).json(todo);
						  }
						 });
					  }
			       });
			  }
			  else{
				  ToDo.find({room: new RegExp('^'+room+'$', "i")}, function(err, todo) {
				  if (err){
					  res.status(400).send(err);
				  }
				  else{
					res.status(200).json(todo);
				  }

				});
			  }

			});
		}
	});
});

app.delete('/api/protected/todo', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			ChatRoomUser.find({user: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+req.body.room+'$', "i")}, function(err, rooms) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else if(!rooms|| 0===rooms.length){
				  ChatRoom.find({owner: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+req.body.room+'$', "i")}, function(err, rooms2) {
					   if (err){
						  res.status(400).send(err);
					  }
					  else if(!rooms2|| 0===rooms2.length){
						res.status(403).send("you don't have permission");  
					  }
					  else{
						 ToDo.remove({room: new RegExp('^'+req.body.room+'$', "i"), todo:new RegExp('^'+req.body.todo+'$', "i")}, function(err, todo) {
						  if (err){
							  res.status(400).send(err);
						  }
						  else{
							res.status(204).send({});
						  }
						 });
					  }
			       });
			  }
			  else{
				  ToDo.remove({room: new RegExp('^'+req.body.room+'$', "i"), todo:new RegExp('^'+req.body.todo+'$', "i")}, function(err, todo) {

				  if (err){
					  res.status(400).send(err);
				  }
				  else{
					  res.status(204).json(rooms);
				  }

				});
			  }
			});
		}

		
	});
});




app.post('/api/protected/memo', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			ChatRoomUser.find({user: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+req.body.room+'$', "i")}, function(err, rooms) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else if(!rooms|| 0===rooms.length){
				  ChatRoom.find({owner: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+req.body.room+'$', "i")}, function(err, rooms2) {
					   if (err){
						  res.status(400).send(err);
					  }
					  else if(!rooms2|| 0===rooms2.length){
						res.status(403).send("you don't have permission");  
					  }
					  else{
						Memo.find({room: new RegExp('^'+req.body.room+'$', "i"), memo:new RegExp('^'+req.body.memo+'$', "i")}, function(err, memo) {
							  if (err){
								  res.status(400).send(err);
							  }
							  else if(!memo|| 0===memo.length){
								memo2 = new Memo({memo:req.body.memo, room:req.body.room, user:decoded.username});
								memo2.save(function(err) {
									if (err) {
										res.status(400).send(err);
									}
									else{
										res.status(201).send({});
									}
								});
							  }
							  else{
								res.status(400).send('memo already exists');
							  }
							}); 
					  }
				  });
				  
			  }
			  else{
				Memo.find({room: new RegExp('^'+req.body.room+'$', "i"), memo:new RegExp('^'+req.body.memo+'$', "i")}, function(err, memo) {
				  if (err){
					  res.status(400).send(err);
				  }
				  else if(!memo|| 0===memo.length){
					memo2 = new Memo({memo:req.body.memo, room:req.body.room, user:decoded.username});
					memo2.save(function(err) {
						if (err) {
							res.status(400).send(err);
						}
						else{
							res.status(201).send({});
						}
					});
				  }
				  else{
					res.status(400).send('memo already exists');
				  }
				});
			  }

			});
		}
	});
});

app.get('/api/protected/memo', function(req, res) {
	var room = req.headers['room'];
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			ChatRoomUser.find({user: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+room+'$', "i")}, function(err, rooms) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else if(!rooms|| 0===rooms.length){
				   ChatRoom.find({owner: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+room+'$', "i")}, function(err, rooms2) {
					   if (err){
						  res.status(400).send(err);
					  }
					  else if(!rooms2|| 0===rooms2.length){
						res.status(403).send("you don't have permission");  
					  }
					  else{
						 Memo.find({room: new RegExp('^'+room+'$', "i")}, function(err, memo) {
						  if (err){
							  res.status(400).send(err);
						  }
						  else{
							res.status(200).json(memo);
						  }
						 });
					  }
			       });
			  }
			  else{
				  Memo.find({room: new RegExp('^'+room+'$', "i")}, function(err, memo) {
				  if (err){
					  res.status(400).send(err);
				  }
				  else{
					res.status(200).json(memo);
				  }

				});
			  }

			});
		}
	});
});
app.post('/api/protected/files', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			ChatRoomUser.find({user: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+req.body.room+'$', "i")}, function(err, rooms) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else if(!rooms|| 0===rooms.length){
				  ChatRoom.find({owner: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+req.body.room+'$', "i")}, function(err, rooms2) {
					   if (err){
						  res.status(400).send(err);
					  }
					  else if(!rooms2|| 0===rooms2.length){
						res.status(403).send("you don't have permission");  
					  }
					  else{
						Files.find({room: new RegExp('^'+req.body.room+'$', "i"), name:new RegExp('^'+req.body.name+'$', "i")}, function(err, file) {
							  if (err){
								  res.status(400).send(err);
							  }
							  else if(!file|| 0===file.length){
								file2 = new Files({name:req.body.name, room:req.body.room, type:req.body.name, data:req.body.data});
								file2.save(function(err) {
									if (err) {
										res.status(400).send(err);
									}
									else{
										res.status(201).send({});
									}
								});
							  }
							  else{
								res.status(400).send('file already exists');
							  }
							}); 
					  }
				  });
				  
			  }
			  else{
				Files.find({room: new RegExp('^'+req.body.room+'$', "i"), name:new RegExp('^'+req.body.name+'$', "i")}, function(err, file) {
				  if (err){
					  res.status(400).send(err);
				  }
				  else if(!file|| 0===file.length){
					file2 = new Files({name:req.body.name, room:req.body.room, type:req.body.name, data:req.body.data});
					file2.save(function(err) {
						if (err) {
							res.status(400).send(err);
						}
						else{
							res.status(201).send({});
						}
					});
				  }
				  else{
					res.status(400).send('file already exists');
				  }
				});
			  }
			});
		}
	});
});

app.get('/api/protected/files', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	var room = req.headers['room'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			ChatRoomUser.find({user: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+room+'$', "i")}, function(err, rooms) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else if(!rooms|| 0===rooms.length){
				   ChatRoom.find({owner: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+room+'$', "i")}, function(err, rooms2) {
					   if (err){
						  res.status(400).send(err);
					  }
					  else if(!rooms2|| 0===rooms2.length){
						res.status(403).send("you don't have permission");  
					  }
					  else{
						  Files.find({room: new RegExp('^'+room+'$', "i")},{data:0}, function(err, files) {
						  if (err){
							  res.status(400).send(err);
						  }
						  else{
							res.status(201).json(files);
						  }
						 });
					  }
			       });
			  }
			  else{
				  Files.find({room: new RegExp('^'+room+'$', "i")}, {data:0}, function(err, files) {
				  if (err){
					  res.status(400).send(err);
				  }
				  else{
					res.status(201).json(files);
				  }

				});
			  }

			});
		}
	});
});
app.delete('/api/protected/files', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			ChatRoomUser.find({user: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+req.body.room+'$', "i")}, function(err, rooms) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else if(!rooms|| 0===rooms.length){
				  ChatRoom.find({owner: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+req.body.room+'$', "i")}, function(err, rooms2) {
					   if (err){
						  res.status(400).send(err);
					  }
					  else if(!rooms2|| 0===rooms2.length){
						res.status(403).send("you don't have permission");  
					  }
					  else{
						 Files.remove({room: new RegExp('^'+req.body.room+'$', "i"), name:new RegExp('^'+req.body.name+'$', "i")}, function(err, files) {
						  if (err){
							  res.status(400).send(err);
						  }
						  else{
							res.status(201).send({});
						  }
						 });
					  }
			       });
			  }
			  else{
				  Files.remove({room: new RegExp('^'+req.body.room+'$', "i"), name:new RegExp('^'+req.body.name+'$', "i")}, function(err, files) {
				  if (err){
					  res.status(400).send(err);
				  }
				  else{
					res.status(201).send({});
				  }

				});
			  }
			});
		}
	});
});
app.get('/api/protected/files/data', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	var room = req.headers['room'];
	var name = req.headers['name'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			ChatRoomUser.find({user: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+room+'$', "i")}, function(err, rooms) {
			  if (err){
				  res.status(400).send(err);
			  }
			  else if(!rooms|| 0===rooms.length){
				   ChatRoom.find({owner: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+room+'$', "i")}, function(err, rooms2) {
					   if (err){
						  res.status(400).send(err);
					  }
					  else if(!rooms2|| 0===rooms2.length){
						res.status(403).send("you don't have permission");  
					  }
					  else{
						  Files.findOne({room: new RegExp('^'+room+'$', "i"), name:new RegExp('^'+name+'$', "i")}, function(err, files) {
						  if (err){
							  res.status(400).send(err);
						  }
						  else{
							res.status(201).json(files);
						  }
						 });
					  }
			       });
			  }
			  else{
				  Files.findOne({room: new RegExp('^'+room+'$', "i"), name:new RegExp('^'+name+'$', "i")}, function(err, files) {
				  if (err){
					  res.status(400).send(err);
				  }
				  else{
					res.status(201).json(files);
				  }

				});
			  }

			});
		}
	});
});


//here is the server API
app.post('/api/protected/getname', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		if (err){
			res.status(401).send(err);
		}
		else{
			res.status(201).send({"name" : decoded.username});
		}

	});
});
		
app.post('/api/protected/chatlog', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		console.log(req.headers);
		var parameters = JSON.parse(req.headers['data']);
		var chatroom = parameters['chatroom'];
		var chattext = parameters['msg'];
		chatlog = new ChatRoomLog({name: decoded.username, text: chattext, room:chatroom});
		chatlog.save(function(err) {
			if(err) {
				res.status(401).send({"write":"failed"});
			}
		});
		if (err){
			res.status(401).send({"write":"failed"});
		}
		else{
			res.status(201).send({"write":"success"});
		}
	});
});

app.post('/api/protected/getlogs', function(req, res) {
	var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
	jwt2.verify(token2, config.secret, function (err, decoded) {
		
		var parameters = JSON.parse(req.headers['data']);
		var chatroom = parameters['chatroom'];

	   ChatRoomLog.find({room: new RegExp('^'+chatroom+'$', "i")}, function(err, log) {
		  if (err){
			  res.status(400).send(err);
		  }
		  else{
		  	for(i = 0; i < log.length; i++) {
		  		log[i]['_id'] = '';
		  		log[i]['room'] = '';
		  	}
			res.status(200).send(log); 
		  }
		  
       });
	});
});

app.post('/api/protected/roomaccess', function(req, res) {
		var token2 = req.body.token || req.query.token ||req.headers['x-access-token'];
		jwt2.verify(token2, config.secret, function (err, decoded) {
			var reqRoom = req.headers['Data'];
		    ChatRoomUser.find({user: new RegExp('^'+decoded.username+'$', "i"), name: new RegExp('^'+reqRoom+'$', "i")}, function(err, rooms) {
	  		if (err){
				res.status(401).send({"status" : "failed"});	
			}
			else{
	  			if(rooms.length < 1) {
	  				res.status(201).send({"status" : "approved"});					  				
	  			} else {
	  				res.status(401).send({"status" : "failed"});	
	  			}
			}

		});
	});
});


