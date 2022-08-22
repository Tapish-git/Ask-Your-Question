const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const query = require('../models/query');
const {validateQuery,isLoggedIn,isQuestionAuthor} = require('../middleware');
const multer  = require('multer');
const {storage} = require('../cloudinary/index');
const upload = multer({storage});


// render the form to add the question
router.get('/newQuestion',isLoggedIn,(req,res)=>{
    res.render('question/addQuestion')
});

// adding a new question and then rendering on the show page of that particular question
router.post('/newQuestion',isLoggedIn,upload.array('image'),validateQuery,catchAsync(async(req,res)=>{
    // console.log(req.body.query)
    const question = new query(req.body.query);
    var today = new Date();
    var date = today.getDate()+'/'+(today.getMonth()+1)+'/'+today.getFullYear();
    question.dateOfAsking=date;
    question.author = req.user._id;
    question.images = req.files.map(f=>({url:f.path,filename:f.filename}));
    await question.save();
    req.flash('success','Question has been posted successfully');
    res.redirect(`/question/${question._id}`)
}));

// show page for a particular question and its answer 
router.get('/question/:id',catchAsync(async(req,res)=>{
    const {id} = req.params;
    const question = await query.findById(id).populate({
        path:'answer',
        populate:{
            path:'author'
        }
    }).populate('author');
    // console.log(question);
    res.render('question/show2',{question});
}));

// rendering the edit form for a particular question
router.get('/question/:id/edit',isQuestionAuthor,catchAsync(async(req,res)=>{
    const {id} = req.params;
    const question = await query.findById(id);
    res.render('question/edit',{question});
}));

// //updating the question
// router.put('/question/:id',catchAsync(async(req,res)=>{
//     const {id} = req.params;
//     const question = await query.findByIdAndUpdate(id,{...req.body.query});
//     console.log(req.body);
    
//     const imgs = req.files.map(f=>({url:f.path,filename:f.filename}));
//     question.images.push(...imgs);
//     await question.save();
//     // if(req.body.deleteImages){
//     //     for(let filename of req.body.deleteImages)
//     //     {
//     //         await cloudinary.uploader.destroy(filename);
//     //     }
//     //     await question.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages } } } })  
//     // }
//     req.flash('success','successfully updated the question')
//     res.redirect(`/question/${question._id}`)
// }));

//deleting the question
router.delete('/question/:id',catchAsync(async(req,res)=>{
    const {id} = req.params;
    await query.findByIdAndDelete(id);
    // console.log(deletedQ);
    req.flash('success','Question has been deleted successfully');
    res.redirect('/');
}));

module.exports = router;