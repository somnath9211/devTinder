const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Store emails in lowercase
        trim: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Please fill a valid email address'
        ]
    },
    password: {
        type: String,
        required: true,
        minlength: 8, // Enforce minimum password length
        select: false // Do not return password by default in queries
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 120 // Optional: set a reasonable upper limit
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other'], // Restrict to allowed values
        lowercase: true // Store
    },
    photoUrl: {
        type: String,
        default: 'https://example.com/default-profile.png',
        trim: true
    },
    bio: {
        type: String,
        default: '',
        maxlength: 500
    },
    skills: {
        type: [String],
        default: [],
        validate: [arr => arr.length <= 20, 'Maximum 20 skills allowed'] // Optional: limit number of skills
    }
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;