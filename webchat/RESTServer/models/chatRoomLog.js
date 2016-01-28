var mongoose = require('mongoose');  
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');


var ChatRoomLogSchema = new Schema({  
    name: String,
    text: String,
	room: String
});


module.exports = mongoose.model('ChatRoomLog', ChatRoomLogSchema); 