const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    year:{
        type:String,
        required:true,
    },       
    div:{
        type:String,
        required:true,
    },
    dob:{
        type:Date,
        required:true,
    },
    // resume: {
    //     type: String, // Assuming you store the file path or URL of the uploaded resume
    //     required: true
    // },
    // profilePicture: String, // Field for storing profile picture URL or file path
    // },
    // {
    // timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
