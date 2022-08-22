const Joi = require('joi');

module.exports.querySchema = Joi.object({
    query: Joi.object({
        question: Joi.string().required(),
        // dateOfAsking: Joi.date().less('now'),
        // image: Joi.string()
    }).required(),
    deleteImages: Joi.array()
}); 
module.exports.answerSchema = Joi.object({
    ans: Joi.object({
        answer: Joi.string().required(),
        // dateOfAnswer: Joi.date().less('now').required()
    }).required()
}); 