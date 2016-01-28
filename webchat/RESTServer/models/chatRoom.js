var mongoose = require('mongoose');  
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');


var ChatRoomSchema = new Schema({  
    name: {type:String, unque:true},
    password: String,
	owner: String
});

ChatRoomSchema.plugin(uniqueValidator);

module.exports = mongoose.model('ChatRoom', ChatRoomSchema); 