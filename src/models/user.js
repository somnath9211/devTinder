const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
        validate: {
            validator: v => validator.isLength(v, { min: 2, max: 50 }),
            message: 'First name must be 2-50 characters'
        }
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 50,
        validate: {
            validator: v => !v || validator.isLength(v, { max: 50 }),
            message: 'Last name must be up to 50 characters'
        }
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: v => validator.isEmail(v),
            message: 'Please fill a valid email address'
        }
    },
    password: {
        type: String,
        required: true,
        select: false,
        validate: {
            validator: v => validator.isStrongPassword(v, {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            }),
            message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol'
        }
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 120,
        validate: {
            validator: v => validator.isInt(String(v), { min: 18, max: 120 }),
            message: 'Age must be between 18 and 120'
        }
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other'],
        lowercase: true
    },
    photoUrl: {
        type: String,
        default: 'https://example.com/default-profile.png',
        trim: true,
        validate: {
            validator: v => !v || validator.isURL(v),
            message: 'Photo URL must be a valid URL'
        }
    },
    bio: {
        type: String,
        default: '',
        maxlength: 500,
        validate: {
            validator: v => !v || validator.isLength(v, { max: 500 }),
            message: 'Bio must be up to 500 characters'
        }
    },
    skills: {
        type: [String],
        default: [],
        validate: [
            {
                validator: arr => arr.length <= 20,
                message: 'Maximum 20 skills allowed'
            },
            {
                validator: arr => arr.every(skill => typeof skill === 'string' && validator.isLength(skill, { min: 1, max: 50 })),
                message: 'Each skill must be a non-empty string up to 50 characters'
            }
        ]
    }
}, { timestamps: true });

userSchema.methods.getJWT = async function () {
    const user = this;
    if (!user._id) {
        throw new Error("User ID is required to generate JWT");
    }
    const token = jwt.sign({ userId: user._id }, "Somnath9211@", { expiresIn: '1h' });
    return token;
};

userSchema.methods.validatePassword = async function (password) {
    const user = this;
    if (!user.password) {
        throw new Error("Password is required for validation");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch;
};

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;