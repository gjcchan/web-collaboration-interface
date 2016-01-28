var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var http = require('http');

//init http server
app.listen(8088);
function handler (req, res) {
  fs.readFile('/home/vagrant/project/chat-exp/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
	  console.log(err);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

console.log('Server running at http://127.0.0.1:8088/');

var usernames = {};
var chatrooms = ['main','subtopic one'];
var usertokens = {};
//init ws listener
io.on('connection', function (socket) {

  socket.on('init', function (token) {
    http.request(callExpress('getname',token,''), function(response) {
      var returnVal = '';
      response.setEncoding('utf8');

      response.on('data', function (chunk) {
        returnVal += chunk;
        console.log(returnVal);
      }).on('error', function(e) {
        returnVal = 'error on callback';
        socket.emit('init','auth error');
        socket.disconnect();
      });

      response.on('end', function () {              
        returnVal = JSON.parse(returnVal);
        if(returnVal['name'] == '') {
          socket.emit('init','auth failed');
          socket.disconnect();
        } else {
          socket.emit('init','auth success: ' + returnVal['name'] );
          socket.uname = returnVal['name'];
          socket.token = token;          
        }
      });

    }).end();
  });



  socket.on('listrequest', function (data) {

  });

  socket.on('join', function (chatroomname) {

    http.request(callExpress('roomaccess',socket.token,chatroomname), function(response) {
      var returnVal = '';
      response.setEncoding('utf8');

      response.on('data', function (chunk) {
        returnVal += chunk;
        console.log(returnVal);
      }).on('error', function(e) {
        returnVal = 'error on callback';
        socket.emit('roomaccess','auth error');
        socket.disconnect();
      });

      response.on('end', function () {              
        returnVal = JSON.parse(returnVal);
        if(returnVal['status'] == 'approved') {
          socket.emit('join', socket.uname );
          //need to auth here
          socket.broadcast.to(socket.chatroom).emit('exit', socket.uname + ' has disconnected');
          socket.leave(socket.chatroom);

          socket.chatroom = chatroomname;
          socket.join(chatroomname);
          socket.broadcast.to(socket.chatroom).emit('join', socket.uname);
        } else {
          socket.emit('join','auth failed');
          socket.disconnect();   
        }

      });

    }).end();
  });


  socket.on('whosonline', function(data) {
    var clients_in_the_room = io.sockets.adapter.rooms[socket.chatroom]; 
    var onlineUsers = [];
    for (var clientId in clients_in_the_room ) {
      onlineUsers.push(io.sockets.connected[clientId].uname);
    }   
    socket.emit('whosonline',onlineUsers);
  });

socket.on("getlogs", function(data) {

      http.request(callExpress('getlogs',socket.token,'{"chatroom" : "'+ socket.chatroom + '"}'), function(response) {
      var returnVal = '';
      response.setEncoding('utf8');

      response.on('data', function (chunk) {
        returnVal += chunk;
        socket.emit('getlogs',returnVal);
      }).on('error', function(e) {
        returnVal = 'error on callback';
        socket.emit('init','auth error');
        socket.disconnect();
      });

      response.on('end', function () {              

      });

    }).end();
});
  socket.on('send', function (msg) {
     http.request(callExpress('chatlog',socket.token,'{"chatroom" : "'+ socket.chatroom + '", "msg" : "' + msg +'"}'), function(response) {
      var returnVal = '';
      response.setEncoding('utf8');

      response.on('data', function (chunk) {
        returnVal += chunk;
        console.log(returnVal);
      }).on('error', function(e) {
        returnVal = 'error on callback';
        socket.emit('init','auth error');
        socket.disconnect();
      });

      response.on('end', function () {              
      });

    }).end();
    

    var object = {};
    object['uname'] = socket.uname;
    object['msg'] = msg;
	  io.sockets.in(socket.chatroom).emit('msg', object);
  });

	socket.on('disconnect', function(){
		delete usernames[socket.uname];
		socket.broadcast.to(socket.chatroom).emit('exit', socket.uname + ' has disconnected');
		socket.leave(socket.chatroom);
	});

});

function callExpress(path, token, param) {
  //var req;
  //var returnVal;
  var options = {
    host: 'localhost',
    path: '/api/protected/' + path,
    port: '3000',
    method: 'POST',
    headers: { "Content-Type": "application/json;charset=utf-8",
      "Accept" : "application/json, text/javascript, */*; q=0.01",
      "Accept-Encoding": "gzip, deflate, sdch",
      "Accept-Language": "en-US,en;q=0.8",
      "x-access-token" : token,
      "Authorization" : "Bearer " + token,
      "Data" : param
    }
  }; 
  return options;
}

