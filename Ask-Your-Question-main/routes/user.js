const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const User = require('../models/users');

router.get('/register',(req,res)=>{
    res.render('users/register');
})

router.post('/register',catchAsync(async(req,res)=>{
    try{
        const {email,username,password} = req.body;
        const user = new User({email,username});
        const registeredUser = await User.register(user,password);  
        req.login(registeredUser,err=>{
            if(err) return next(err); 
            req.flash('success','Welcome to Questionaire!!')
            res.redirect('/');
        })
    }catch(e){
        req.flash('error',e.message);   
        res.redirect('register')
    }
}));

router.get('/login',(req,res)=>{
    res.render('users/login');
});

router.post('/login',passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),(req,res)=>{
    req.flash('success','Welcome !!');
    const redirectUrl = req.session.returnTo || '/'  
    delete req.session.returnTo; 
    res.redirect(redirectUrl);
});

router.get('/logout',(req,res)=>{
    req.logout(); 
    req.flash('success','You have been logged out');
    res.redirect('/');
});

module.exports = router;