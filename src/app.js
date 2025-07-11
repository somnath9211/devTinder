const express = require("express");
const app = express();
const connectDB = require("./config/database");
const UserModel = require("./models/user");
const { validateUserInput } = require('./utils/userValidation');
const bcrypt = require('bcrypt');

app.use(express.json()); // Middleware to parse JSON bodies
// Signup API - POST /signup - Create a new user
app.post("/signup", async (req, res) => {
    try {
        const validation = validateUserInput(req.body, false);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }
        const { firstName, lastName, emailId, password, age, gender } = req.body;

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
        });
        await user.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
});

// Login API - POST /login - Authenticate a user
app.post("/loging", async (req, res) => {
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
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
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

// Feed API - GET /feed - Fetch all users from the database
app.get("/feed", async (req, res) => {
    try {
        const users = await UserModel.find({});
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        } else {
            res.status(200).json(users);
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete API - DELETE  - Delete a user by ID
app.delete("/user", async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await UserModel.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// Update API - PUT  - Update a user by ID
app.put("/user", async (req, res) => {
    const userId = req.body.userId;
    const updateData = req.body;

    try {
        const validation = validateUserInput(req.body, true);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }
        const user = await UserModel.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


connectDB().then(() => {
    app.listen(7777, (req, res) => {
        console.log("Server is running on port 7777");
    });
}
).catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // Exit the process with failure
});