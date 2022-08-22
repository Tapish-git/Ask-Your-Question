const ExpressError = require('./utils/ExpressError');
const query = require('./models/query');
const ans = require('./models/ans');
const {querySchema,answerSchema}=require('./schemaJoi');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;  
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateQuery = (req, res, next) => {
    const { error } = querySchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
module.exports.validateAns = (req, res, next) => {
    const { error } = answerSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isQuestionAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const question = await query.findById(id);  
    if(!question.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isAnswerAuthor = async(req,res,next)=>{
    const {id,ansId} = req.params;
    const answer = await ans.findById(ansId);  
    if(!answer.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}