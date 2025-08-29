const express = require('express');
const app = express();
const UserModel = require("../models/user");
const { validateUserInput } = require('../utils/userValidation');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const authRouter = express.Router();
app.use(cookieParser()); // Middleware to parse cookies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(express.json()); // Middleware to parse JSON bodies


// Signup API - POST /signup - Create a new user
authRouter.post("/signup", async (req, res) => {
    try {
        const validation = validateUserInput(req.body, false);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }
        const { firstName, lastName, emailId, password, age, gender, skills } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        // Check if user already exists
        const existingUser = await UserModel.findOne({ emailId });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Creating a new user instance
        const user = new UserModel({
            firstName: firstName.trim(),
            lastName: lastName ? lastName.trim() : "",
            emailId: emailId.trim().toLowerCase(),
            password: passwordHash,
            age: age,
            gender: gender,
            skills: skills
        });
        await user.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
});

// Login API - POST /login - Authenticate a user
authRouter.post("/login", async (req, res) => {
    const { emailId, password } = req.body;

    // Basic input validation
    if (!emailId || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Find user by email
        const user = await UserModel.findOne({ emailId: emailId.trim().toLowerCase() }).select('+password');
        if (!user) {
            return res.status(404).json({ message: "Invalid email or password" });
        }

        // Compare password with hashed password
        const isMatch = await user.validatePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        } else {
            const token = await user.getJWT();
            // Set token in cookie
            res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
        }

        // Remove password from response
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({ message: "Login successful", user: userObj });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// Logout API - POST /logout
authRouter.post("/logout", (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'Strict' });
    res.status(200).json({ message: "Logout successful" });
});


module.exports = authRouter;