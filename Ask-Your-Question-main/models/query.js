const mongoose = require('mongoose');
const User = require('./users')
const Answer = require('./ans')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

const querySchema = new Schema({
    question:{
        type:String,
        required:true
    },
    dateOfAsking:{
        type:String,
        required:true
    },
    author:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    answer: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Answer'
        }
    ],
    images: [ImageSchema]
});

querySchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Answer.deleteMany({
            _id: {
                $in: doc.answer
            }
        })
    }
})

module.exports = mongoose.model('Query', querySchema);