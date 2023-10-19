const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const nodemailer = require('nodemailer'); 
const axios = require('axios');
const app = express();
const port = 3000;

mongoose.connect('mongodb+srv://softwerelogin:idiot@data.jvvxbi0.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'alfiesystems@gmail.com',
        pass: '11202007'
    }
});

function sendWelcomeEmail(email, username) {
    const mailOptions = {
        from: 'alfiesystems@gmail.com',
        to: email,
        subject: 'Welcome to Our Service',
        text: `Hello, ${username}! Welcome to our service.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Welcome email sent:', info.response);
        }
    });
}

app.use((req, res, next) => {
    req.signupIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    next();
});

app.use((req, res, next) => {
    req.loginIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    next();
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}


app.get('/', (req, res) => {
 });

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/proxy',
    failureRedirect: '/login'
}), (req, res) => {
    User.findOne({ username: req.user.username }, (err, user) => {
        if (err) {
            console.error(err);
        } else {
            user.lastLoginIP = req.loginIP;
            user.save();
        }
    });
});

app.post('/signup', async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;

    const newUser = new User({
        username,
        email,
        signupIP: req.signupIP,
        phoneNumber
    });

    await User.register(newUser, password, (err, user) => {
        if (err) {
            console.error(err);
            res.redirect('/signup');
        } else {
            sendWelcomeEmail(email, username);
            passport.authenticate('local')(req, res, () => {
                res.redirect('/proxy');
            });
        }
    });
});

app.get('/proxy', isLoggedIn, (req, res) => {
    res.render('proxy', { user: req.user });
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.post('/search', isLoggedIn, async (req, res) => {
    const { query } = req.body;
    const user = req.user;

    try {
        const response = await axios.get(`https://www.google.com/search?q=${query}`);
        const results = response.data;

        user.searchHistory.push({ query });
        await user.save();

        res.render('proxy', { user, results });
    } catch (error) {
        console.error(error);
        res.redirect('/proxy');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});















//let Alfie._.thedev = true;
//if(Alfie._.thedev){
  //  console.log("Lets Code!")
//} else {
  //  console.log("No code?")
//}











