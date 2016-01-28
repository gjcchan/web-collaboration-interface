var mongoose = require('mongoose');  
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');


var UserSchema = new Schema({  
    username: {type:String, unque:true},
    password: String,
	extra: String
});

UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', UserSchema); 