const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    signupIP: String,
    lastLoginIP: String,
    phoneNumber: String,
    searchHistory: [
        {
            query: String,
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
