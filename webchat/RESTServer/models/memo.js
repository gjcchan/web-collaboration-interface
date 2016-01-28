var mongoose = require('mongoose');  
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');


var MemoSchema = new Schema({

	user: String,
    room: String,
    memo: String
});

MemoSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Memo', MemoSchema);