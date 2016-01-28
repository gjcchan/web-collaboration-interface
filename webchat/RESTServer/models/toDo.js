var mongoose = require('mongoose');  
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');


var ToDoSchema = new Schema({  
    room: String,
    todo: String
});

ToDoSchema.plugin(uniqueValidator);

module.exports = mongoose.model('ToDo', ToDoSchema);