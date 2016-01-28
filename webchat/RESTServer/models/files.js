var mongoose = require('mongoose');  
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');


var FilesSchema = new Schema({  
    name: String,
    type: String,
	room: String,
	data: String
});

FilesSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Files', FilesSchema);