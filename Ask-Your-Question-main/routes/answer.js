const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ans = require('../models/ans');
const query = require('../models/query');
const {isLoggedIn,isAnswerAuthor,validateAns} = require('../middleware');
const multer  = require('multer');
const {storage} = require('../cloudinary/index');
const upload = multer({storage});


// render form for answering the question 
router.get('/question/:id/ans',isLoggedIn,catchAsync(async(req,res)=>{
    const {id} = req.params;
    const question = await query.findById(id);
    res.render('question/answerQuestion',{question})
}));

// answering a particular question
router.post('/question/:id/ans',isLoggedIn,upload.array('image'),validateAns,catchAsync(async(req,res)=>{
    // console.log(req.body);
    const{id} = req.params;
    const question = await query.findById(id);
    const answer = new ans(req.body.ans);
    var today = new Date();
    var date = today.getDate()+'/'+(today.getMonth()+1)+'/'+today.getFullYear();
    answer.dateOfAnswer=date;
    answer.author = req.user._id;
    answer.images = req.files.map(f=>({url:f.path,filename:f.filename}));
    question.answer.push(answer);
    await answer.save();
    await question.save();
    req.flash('success','Answer has been posted successfully');
    res.redirect(`/question/${id}`);
    // console.log(question);
}));



//deleting the answer
router.delete('/question/:id/ans/:ansId',isLoggedIn,isAnswerAuthor,catchAsync(async(req,res)=>{
    const{id,ansId}=req.params;
    await query.findByIdAndUpdate(id,{$pull:{answer:ansId}});
    await ans.findByIdAndDelete(ansId);
    req.flash('success','Answer has been deleted successfully');
    res.redirect(`/question/${id}`)
}));

module.exports = router;