App = Ember.Application.create();

App.Router.map(function() {
  // put your routes here
   this.route('index', { path: '/' });
   this.route('login', { path: '/login' });
   this.route('signup', { path: '/signup' });
   this.route('create', { path: '/create' });
   this.route('join', { path: '/join' });
   this.route("share", { path: "/share/:name/:password"});
   this.route('chatroom',{path:"/chatroom/:name"},function() {
	   this.route('todo');
	   this.route('memo');
	   this.route('download');
   });
   this.route("rooms",{ path: '/rooms' });
   this.route("chat",{ path: '/chat' });
   this.route("api",{ path: '/api' });
});

App.LoginRoute = Ember.Route.extend({
  beforeModel: function() {
     $(".logged-in").hide();
	 $(".logged-out").show();
	 localStorage.removeItem("token");
	 
  },
  
  setupController: function(controller, context) {
    controller.reset();
  }
});
App.SignupRoute = Ember.Route.extend({
  setupController: function(controller, context) {
    controller.reset();
  }
});

App.AuthenticatedRoute = Ember.Route.extend({

  beforeModel: function(transition) {
    if (!this.controllerFor('login').get('token')) {
      this.redirectToLogin(transition);
	  
    }
	$(".logged-in").show();
	$(".logged-out").hide();
	
  },
  redirectToLogin: function(transition) {
    var loginController = this.controllerFor('login');
    loginController.set('attemptedTransition', transition);
    this.transitionTo('login');
  },

  getJSONWithToken: function(url) {
    var token = this.controllerFor('login').get('token');
    return $.getJSON(url, { token: token });
  },

  actions: {
    error: function(reason) {
      if (reason.status === 401) {
		localStorage.removeItem("token");
        this.transitionTo('login');
      } 
	  else if(xhr.status == 403){
		this.transitionTo('index');
	  }
	  else {
        alert('Something went wrong');
      }
    },
  }
});


App.Item = Ember.Object.extend();

App.IndexRoute = App.AuthenticatedRoute.extend({
  model: function() {
	  var promise = new Ember.RSVP.Promise(function(resolve, reject){
			  var items = [];
			  $.ajax({
							url: 'http://localhost:3000/api/protected/chatRoomUser',
							jsonp: "callback",
							type: 'GET',
							beforeSend: function (request)
							{
								request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
								request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
							},
							contentType: 'application/json;charset=utf-8',
							dataType: 'json',
							success: function( response ) {
								 
		 
								  response.forEach( function (item) {
								  
								  items.push( App.Item.create(item) );
								});
								resolve(items);
							},
							error: function(xhr, textStatus, errorThrown){
									reject(xhr);
							}
				});
		});
	return promise;	

  },
            actions: {
               invalidateModel: function() {
                  //display message in the console of your browser
                  Ember.Logger.log('Route is now refreshing...');
                 //refresh the model
                  this.refresh();
               }
            }
});

App.CreateRoute = App.AuthenticatedRoute.extend({
  setupController: function(controller, context) {
    controller.reset();
  }
});
App.JoinRoute = App.AuthenticatedRoute.extend({
  setupController: function(controller, context) {
    controller.reset();
  }
});


App.ShareRoute = App.AuthenticatedRoute.extend({
  beforeModel: function(transition) {
    if (!this.controllerFor('login').get('token')) {
      this.redirectToLogin(transition);
    }
  },
  setupController: function(controller, context) {
    controller.reset();
  }
});



App.RoomsRoute = App.AuthenticatedRoute.extend({
  model: function() {
	  var promise = new Ember.RSVP.Promise(function(resolve, reject){
		  var items = [];
		  $.ajax({
						url: 'http://localhost:3000/api/protected/chatRoom',
						jsonp: "callback",
						type: 'GET',
						beforeSend: function (request)
						{
							request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
							request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
						},
						contentType: 'application/json;charset=utf-8',
						dataType: 'json',
						success: function( response ) {
	 
							response.forEach( function (item) {
							  
							  items.push( App.Item.create(item) );
							});

							resolve(items);
						},
						error: function(xhr, textStatus, errorThrown){
								 reject(xhr);
						}
			});	  
	});
	
	return promise;	

  },
            actions: {
               invalidateModel: function() {
                  //display message in the console of your browser
                  Ember.Logger.log('Route is now refreshing...');
                 //refresh the model
                  this.refresh();
               }
            }
});
  

  

App.LoginController = Ember.Controller.extend({
  reset: function() {
		this.setProperties({
		  identification: "",
		  password: "",
		  errorMessage: ""
		});
	  },
  token: localStorage.token,
  tokenChanged: function() {
		localStorage.token = this.get('token');
	}.observes('token'),
  actions:{
	  login: function() {
		  
		var message='';

		// Clear out any error messages.
		this.set('errorMessage', null);
		
		var self = this;
		var credentials = this.getProperties('identification', 'password');
			$.ajax({
					
					url: 'http://localhost:3000/sessions/create',
					jsonp: "callback",
					type: 'POST',
					data: JSON.stringify({
						username: credentials.identification,
						password: credentials.password
					}),
					contentType: 'application/json;charset=utf-8',
					dataType: 'json',
					success: function( response ) {
						$(".logged-in").show();
						$(".logged-out").hide();
						self.set('token', response.id_token);
						self.transitionToRoute('index');
					},
					error: function(xhr, textStatus, errorThrown){
						 if(xhr.status == 401){
						 }
						else{
							 self.set('errorMessage',xhr.responseText);
						 }
					}
				});
				
	  }
	 
  }
});

App.SignupController = Ember.Controller.extend({
	 reset: function() {
		this.setProperties({
		  identification: "",
		  password: "",
		  password2: "",
		  errorMessage: ""
		});
	  },
	actions:{
	  create: function() {
		var self = this;
		// Clear out any error messages.
		this.set('errorMessage', null);
		
		var credentials = this.getProperties('identification', 'password','password2');
		
		if(credentials.identification.length == 0){
			self.set('errorMessage',"must enter username");
		}
		else if(credentials.password.length <= 4){
			self.set('errorMessage',"password must be greater than 5 characters");
		}
		else if(credentials.password != credentials.password2){
			self.set('errorMessage',"passwords don't match");
		}
		else{
			$.ajax({
					
					url: 'http://localhost:3000/users',
					jsonp: "callback",
					type: 'POST',
					data: JSON.stringify({
						username: credentials.identification,
						password: credentials.password,
						extra:"yay"
					}),
					contentType: 'application/json;charset=utf-8',
					dataType: 'json',
					success: function( response ) {
						 alert('success');
						 self.transitionToRoute('login');
					},
					error: function(xhr, textStatus, errorThrown){
						if(xhr.status == 401){
						 }
						 else if(xhr.status == 400){
							 self.set('errorMessage', 'user already exists');
						 }
						 else{
							 self.set('errorMessage',xhr.responseText);
						 }
					}
				});

				
		}
	  }
	  
	 
  }
});


App.CreateController = Ember.Controller.extend({
	 reset: function() {
		this.setProperties({
		  identification: "",
		  password: "",
		  password2: "",
		  errorMessage: ""
		});
	  },
	actions:{
	  create: function() {

		// Clear out any error messages.
		this.set('errorMessage', null);
		var self = this;
		var credentials = this.getProperties('identification', 'password','password2');
		if(credentials.identification.length == 0){
			self.set('errorMessage',"must enter username");
		}
		else if(credentials.password.length <= 4){
			self.set('errorMessage',"password must be greater than 5 characters");
		}
		else if(credentials.password != credentials.password2){
			self.set('errorMessage',"passwords don't match");
		}
		else{
			$.ajax({
					
					url: 'http://localhost:3000/api/protected/chatRoom',
					jsonp: "callback",
					type: 'POST',
					beforeSend: function (request)
					{
						request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
						request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
					},
					data: JSON.stringify({
						name: credentials.identification,
						password: credentials.password
					}),
					contentType: 'application/json;charset=utf-8',
					dataType: 'json',
					success: function( response ) {		
						self.transitionToRoute('rooms');
					},
					error: function(xhr, textStatus, errorThrown){
						if(xhr.status == 401){
							 localStorage.removeItem("token");
							 self.transitionToRoute('login');
						 }
						 else if(xhr.status == 400){
							 self.set('errorMessage',"room already exists");
						 } 
						 else if(xhr.status == 403){
								 self.set('errorMessage','you are not allowed to create chatroom here');
						}
						 else{
							 self.set('errorMessage',xhr.responseText);
						 }
						
					}
				});
	
		}

	  }
	  
	 
  }
});

App.JoinController = Ember.Controller.extend({
	 reset: function() {
		this.setProperties({
		  identification: "",
		  password: "",
		  errorMessage: ""
		});
	  },
	actions:{
	  create: function() {
		var self = this;
		// Clear out any error messages.
		this.set('errorMessage', null);
		var credentials = this.getProperties('identification', 'password');
			$.ajax({
					
					url: 'http://localhost:3000/api/protected/chatRoomUser',
					jsonp: "callback",
					type: 'POST',
					beforeSend: function (request)
					{
						request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
						request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
					},
					data: JSON.stringify({
						name: credentials.identification,
						password: credentials.password
					}),
					contentType: 'application/json;charset=utf-8',
					dataType: 'json',
					success: function( response ) {
						self.transitionToRoute('index');
					},
					error: function(xhr, textStatus, errorThrown){
						if(xhr.status == 401){
							 localStorage.removeItem("token");
							 self.transitionToRoute('login');
						 }
						 else if(xhr.status == 404){
							  self.set('errorMessage',"password and room do not match");
							 
						 }
						 else if(xhr.status == 400){
							self.set('errorMessage',"password and room do not match");
						 }
						 else if(xhr.status == 403){
								 self.set('errorMessage','you are not allowed to join a room here');
						}
						 else{
							 self.set('errorMessage',xhr.responseText);
						 }
					}
				});
		
	  }
	  
	 
  }
});
App.RoomsController = Ember.Controller.extend({
	actions:{
	  remove(item) {
		var self = this;
		$.ajax({
					
					url: 'http://localhost:3000/api/protected/chatRoom',
					jsonp: "callback",
					type: 'DELETE',
					beforeSend: function (request)
					{
						request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
						request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
					},
					data: JSON.stringify({
						name: item.get('name')
					}),
					contentType: 'application/json;charset=utf-8',
					dataType: 'json',
					success: function( response ) {		
						self.send('invalidateModel');
					},
					error: function(xhr, textStatus, errorThrown){
						if(xhr.status == 401){
							 localStorage.removeItem("token");
							 self.transitionToRoute('login');
						 }
						 else if(xhr.status == 400){
							 alert("room already exists");
						 }
						 else if(xhr.status == 403){
							 self.transitionToRoute('index');
						 }
						 else{
							 alert(xhr.responseText);
						 }
					}
		});
	  }
	}
});

App.IndexController = Ember.Controller.extend({
	actions:{
	  remove(item) {
		var self = this;
		$.ajax({
					
					url: 'http://localhost:3000/api/protected/chatRoomUser',
					jsonp: "callback",
					type: 'DELETE',
					beforeSend: function (request)
					{
						request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
						request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
					},
					data: JSON.stringify({
						name: item.get('name')
					}),
					contentType: 'application/json;charset=utf-8',
					dataType: 'json',
					success: function( response ) {		
						self.send('invalidateModel');
					},
					error: function(xhr, textStatus, errorThrown){
						if(xhr.status == 401){
							 localStorage.removeItem("token");
							 self.transitionToRoute('login');
						 }
						 else if(xhr.status == 400){
							 alert("room already exists");
						 }
						 else if(xhr.status == 403){
							 self.transitionToRoute('login');
						 }
						 else{
							 alert(xhr.responseText);
						 }
					}
		});
	  }
	}
});

App.ShareController = Ember.Controller.extend({
	 reset: function() {
		this.setProperties({
		  identification: ""
		});
	  },
	actions:{
	  share: function(params) {
		var credentials = this.getProperties('identification');
		var room = window.location.hash.split('/')[2];
		var password = window.location.hash.split('/')[3];
		var subject = 'email room';
		var body_message ='Room Name: '+room+' Room Password: '+password;
		var email = credentials.identification;
		
		var mailto_link = 'mailto:' + email + '?subject=' + subject + '&body=' + body_message;

		win = window.open(mailto_link);
		if (win && win.open && !win.closed) win.close();
		 alert("success");

	  }
    }
});
App.ChatViewTwo = Ember.Component.extend({
  templateName: 'chatroom',
  didInsertElement: function() {
  	alert("hi");
  	$(document).ready(function() {
  		alert("hi2");

  	}).on('didInsertElement');

  }
});
App.ChatView = Ember.Component.extend({
  templateName: 'chat',
  didInsertElement: function() {
  	alert("hi");
  	$(document).ready(function() {
  		alert("hi");
	  	var genFrame = "<iframe src=\"http://localhost:8088/?uid=" + localStorage.getItem("token") + "\" style=\"width:500px;height:500px;\"></iframe>";
	  	$("#chatbox").html(genFrame);
  	}).on('didInsertElement');

  }
});



App.ChatroomTodoController = Ember.Controller.extend({
	actions:{
	  remove(item) {
		var self = this;
		var room = window.location.hash.split('/')[2];
		$.ajax({
					
					url: 'http://localhost:3000/api/protected/todo',
					jsonp: "callback",
					type: 'DELETE',
					beforeSend: function (request)
					{
						request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
						request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
					},
					data: JSON.stringify({
						todo: item.get('todo'),
						room: room
					}),
					contentType: 'application/json;charset=utf-8',
					dataType: 'json',
					success: function( response ) {		
						self.send('invalidateModel');
					},
					error: function(xhr, textStatus, errorThrown){
						if(xhr.status == 401){
							 localStorage.removeItem("token");
							 self.transitionToRoute('login');
						 }
						 else if(xhr.status == 400){
							 alert("room already exists");
						 }
						 else if(xhr.status == 403){
							 self.transitionToRoute('index');
						 }
						 else{
							 alert(xhr.responseText);
						 }
					}
		});
	  },
	  create: function() {
		var self = this;
		// Clear out any error messages.
		this.set('errorMessage', null);
		var room = window.location.hash.split('/')[2];
		var credentials = this.getProperties('todo');
			$.ajax({
					
					url: 'http://localhost:3000/api/protected/todo',
					jsonp: "callback",
					type: 'POST',
					beforeSend: function (request)
					{
						request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
						request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
					},
					data: JSON.stringify({
						todo: credentials.todo,
						room: room
					}),
					contentType: 'application/json;charset=utf-8',
					dataType: 'json',
					success: function( response ) {
						self.setProperties({
						  todo: ""
						});
						self.send('invalidateModel');
					},
					error: function(xhr, textStatus, errorThrown){
						if(xhr.status == 401){
							 localStorage.removeItem("token");
							 self.transitionToRoute('login');
						 }
						 else if(xhr.status == 400){
							self.set('errorMessage',"todo already exists");
						 }
						 else if(xhr.status == 403){
								 self.set('errorMessage','you are not allowed to create todo here');
						}
						 else{
							 self.set('errorMessage',xhr.responseText);
						 }
					}
				});
		
	  },
	  refresh:function(){
		  var self = this;
		  self.send('invalidateModel');
	  }
	}
});

App.ChatroomTodoRoute = App.AuthenticatedRoute.extend({

  model: function() {
	  var room = window.location.hash.split('/')[2];
	  var promise = new Ember.RSVP.Promise(function(resolve, reject){
		  var items = [];
		  $.ajax({
						url: 'http://localhost:3000/api/protected/todo',
						jsonp: "callback",
						type: 'GET',
						beforeSend: function (request)
						{
							request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
							request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
							request.setRequestHeader("room", ""+room);
						},
						contentType: 'application/json;charset=utf-8',
						dataType: 'json',
						success: function( response ) {
	 
							response.forEach( function (item) {
							  
							  items.push( App.Item.create(item) );
							});

							resolve(items);
						},
						error: function(xhr, textStatus, errorThrown){
								 reject(xhr);
						}
			});	  
	});
	
	return promise;	

  },
            actions: {
               invalidateModel: function() {
                  //display message in the console of your browser
                  Ember.Logger.log('Route is now refreshing...');
                 //refresh the model
                  this.refresh();
               }
            }
});

App.ChatroomMemoController = Ember.Controller.extend({
	actions:{
	  create: function() {
		var self = this;
		// Clear out any error messages.
		this.set('errorMessage', null);
		var room = window.location.hash.split('/')[2];
		var credentials = this.getProperties('memo');
			$.ajax({
					
					url: 'http://localhost:3000/api/protected/memo',
					jsonp: "callback",
					type: 'POST',
					beforeSend: function (request)
					{
						request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
						request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
					},
					data: JSON.stringify({
						memo: credentials.memo,
						room: room
					}),
					contentType: 'application/json;charset=utf-8',
					dataType: 'json',
					success: function( response ) {
						self.setProperties({
						  todo: ""
						});
						self.send('invalidateModel');
					},
					error: function(xhr, textStatus, errorThrown){
						if(xhr.status == 401){
							 localStorage.removeItem("token");
							 self.transitionToRoute('login');
						 }
						 else if(xhr.status == 400){
							self.set('errorMessage',"memo already exists");
						 }
						 else if(xhr.status == 403){
								 self.set('errorMessage','you are not allowed to create memo here');
						}
						 else{
							 self.set('errorMessage',xhr.responseText);
						 }
					}
				});
		
	  },
	  refresh:function(){
		  var self = this;
		  self.send('invalidateModel');
	  }
	}
});

App.ChatroomMemoRoute = App.AuthenticatedRoute.extend({
  model: function() {
	  var room = window.location.hash.split('/')[2];
	  var promise = new Ember.RSVP.Promise(function(resolve, reject){
		  var items = [];
		  $.ajax({
						url: 'http://localhost:3000/api/protected/memo',
						jsonp: "callback",
						type: 'GET',
						beforeSend: function (request)
						{
							request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
							request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
							request.setRequestHeader("room", ""+room);
						},
						contentType: 'application/json;charset=utf-8',
						dataType: 'json',
						success: function( response ) {
	 
							response.forEach( function (item) {
							  
							  items.push( App.Item.create(item) );
							});

							resolve(items);
						},
						error: function(xhr, textStatus, errorThrown){
								 reject(xhr);
						}
			});	  
	});
	
	return promise;	

  },
            actions: {
               invalidateModel: function() {
                  //display message in the console of your browser
                  Ember.Logger.log('Route is now refreshing...');
                 //refresh the model
                  this.refresh();
               }
            }
});
App.ChatroomDownloadController = Ember.Controller.extend({
	actions:{
	  upload: function() {
		var self = this;
		// Clear out any error messages.
		this.set('errorMessage', null);
		var room = window.location.hash.split('/')[2];
		var control = document.getElementById("file");
		var i = 0,
        files = control.files,
        len = files.length;

		for (; i < len; i++) {
			
			var file = files[i];
			var name =files[i].name;
			var type =files[i].type;
			var size = files[i].size;
			var reader = new FileReader();
			if (5000000 <= size){
				self.set('errorMessage','file file exceeds 5mb');
			}
			else{
				  reader.onload = function(e) {
				  var rawData = reader.result;
				  $.ajax({
						
						url: 'http://localhost:3000/api/protected/files',
						jsonp: "callback",
						type: 'POST',
						beforeSend: function (request)
						{
							request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
							request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
						},
						data: JSON.stringify({
							name: name,
							type: type,
							room: room,
							data: rawData
						}),
						contentType: 'application/json;charset=utf-8',
						dataType: 'json',
						success: function( response ) {
							self.send('invalidateModel');
						},
						error: function(xhr, textStatus, errorThrown){
							if(xhr.status == 401){
								 localStorage.removeItem("token");
								 self.transitionToRoute('login');
							 }
							 else if(xhr.status == 400){
								self.set('errorMessage','file already exists');
							 }
							 else if(xhr.status == 413){
								self.set('errorMessage','file file exceeds 5mb');
							 }
							else if(xhr.status == 403){
								 self.set('errorMessage','you are not allowed to upload files here');
							 }
							 else{
								 self.set('errorMessage',xhr.responseText);
							 }
						}
					});
				}

				reader. readAsDataURL(file)
			}
		}
			
		
	  },
	  remove(item) {
		var self = this;
		var room = window.location.hash.split('/')[2];
		$.ajax({
					
					url: 'http://localhost:3000/api/protected/files',
					jsonp: "callback",
					type: 'DELETE',
					beforeSend: function (request)
					{
						request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
						request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
					},
					data: JSON.stringify({
						name: item.get('name'),
						room: room
					}),
					contentType: 'application/json;charset=utf-8',
					dataType: 'json',
					success: function( response ) {		
						self.send('invalidateModel');
					},
					error: function(xhr, textStatus, errorThrown){
						if(xhr.status == 401){
							 localStorage.removeItem("token");
							 self.transitionToRoute('login');
						 }
						 else if(xhr.status == 403){
							 self.transitionToRoute('index');
						 }
						 else{
							 alert(xhr.responseText);
						 }
					}
		});
	  },
	   getFile(item) {
		var self = this;
		var room = window.location.hash.split('/')[2];
		$.ajax({
					
					url: 'http://localhost:3000/api/protected/files/data',
					jsonp: "callback",
					type: 'GET',
					beforeSend: function (request)
					{
						request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
						request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
						request.setRequestHeader("room", ""+room);
						request.setRequestHeader("name", ""+item.get('name'));
					},
					contentType: 'application/json;charset=utf-8',
					dataType: 'json',
					success: function( response ) {	
						download(response.data,response.name,"application/octet-stream");
					},
					error: function(xhr, textStatus, errorThrown){
						if(xhr.status == 401){
							 localStorage.removeItem("token");
							 self.transitionToRoute('login');
						 }
						 else if(xhr.status == 403){
							 self.transitionToRoute('index');
						 }
						 else{
							 alert(xhr.responseText);
						 }
					}
		});
	  },
	  refresh:function(){
		  var self = this;
		  self.send('invalidateModel');
	  }
	}
});

App.ChatroomDownloadRoute = App.AuthenticatedRoute.extend({
  model: function() {
	  var room = window.location.hash.split('/')[2];
	  var promise = new Ember.RSVP.Promise(function(resolve, reject){
		  var items = [];
		  $.ajax({
						url: 'http://localhost:3000/api/protected/files',
						jsonp: "callback",
						type: 'GET',
						beforeSend: function (request)
						{
							request.setRequestHeader("Authorization", "Bearer "+localStorage.getItem("token"));
							request.setRequestHeader("x-access-token", ""+localStorage.getItem("token"));
							request.setRequestHeader("room", ""+room);
						},
						contentType: 'application/json;charset=utf-8',
						dataType: 'json',
						success: function( response ) {
	 
							response.forEach( function (item) {
							  
							  items.push( App.Item.create(item) );
							});

							resolve(items);
						},
						error: function(xhr, textStatus, errorThrown){
								 reject(xhr);
						}
			});	  
	});
	
	return promise;	

  },
            actions: {
               invalidateModel: function() {
                  //display message in the console of your browser
                  Ember.Logger.log('Route is now refreshing...');
                 //refresh the model
                  this.refresh();
               }
            }
});
