if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const query = require('./models/query');
const methodOverride = require('method-override');
const ans = require('./models/ans');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const {querySchema,answerSchema}=require('./schemaJoi');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const User = require('./models/users');

const userRoutes = require('./routes/user');
const ansRoutes = require('./routes/answer');
const queryRoutes = require('./routes/question');

mongoose.connect('mongodb://localhost:27017/Quora',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:false
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open", () =>{
    console.log("database connected");
})

const app = express();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.engine('ejs',ejsMate);
app.use(express.urlencoded({ extended:true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public'))); 

const sessionConfig = {
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,  
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));

app.use((req,res,next)=>{
    
    res.locals.success = req.flash('success');     
    res.locals.error = req.flash('error');
    res.locals.currentuser = req.user; 
    next();
})



passport.serializeUser(User.serializeUser());   
passport.deserializeUser(User.deserializeUser()); 



app.use('/',userRoutes);
app.use('/',ansRoutes);
app.use('/',queryRoutes);

// render to the main show page
app.get('/',catchAsync(async(req,res)=>{
    const quest = await query.find({}).populate({
        path:'answer',
        populate:{
            path:'author'
        }
    }).populate('author');
    // console.log(quest); 
    res.render('mainPage3',{quest})
}))

// app.get('/mainpage3',(req,res)=>{
//     res.render('mainpage3.ejs')
// })





app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


app.listen(3000,()=>{
    console.log("App listening on port 3000");
})

