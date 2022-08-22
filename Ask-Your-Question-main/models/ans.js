const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./users')

const ImageSchema = new Schema({
    url: String,
    filename: String
});

const ansSchema = new Schema({
    answer:{
        type:String,
        required:true
    },
    dateOfAnswer:{
        type:String,
        required:true
    },
    author:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    images: [ImageSchema]
});

module.exports = mongoose.model('Answer', ansSchema);