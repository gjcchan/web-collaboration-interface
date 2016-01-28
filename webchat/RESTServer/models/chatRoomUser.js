var mongoose = require('mongoose');  
var Schema = mongoose.Schema;


var ChatRoomUserSchema = new Schema({  
    name: String,
    user: String
});

module.exports = mongoose.model('ChatRoomUser', ChatRoomUserSchema); 