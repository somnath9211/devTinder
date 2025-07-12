const express = require("express");
const app = express();
const connectDB = require("./config/database");
const UserModel = require("./models/user");

app.use(express.json()); // Middleware to parse JSON bodies
// Signup API - POST /signup - Create a new user
app.post("/signup", async (req, res) => {
    const {
        firstName,
        lastName,
        emailId,
        password,
        age,
        gender,
        photoUrl,
        bio,
        skills
    } = req.body;

    // Required fields check
    if (!firstName || !emailId || !password || !age || !gender) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Field-specific validations
    if (typeof firstName !== "string" || firstName.trim().length < 2 || firstName.trim().length > 50) {
        return res.status(400).json({ message: "First name must be 2-50 characters" });
    }

    if (lastName && (typeof lastName !== "string" || lastName.trim().length > 50)) {
        return res.status(400).json({ message: "Last name must be up to 50 characters" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailId)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    if (typeof age !== "number" || age < 18 || age > 120) {
        return res.status(400).json({ message: "Age must be between 18 and 120" });
    }

    if (!['male', 'female', 'other'].includes(gender)) {
        return res.status(400).json({ message: "Gender must be 'male', 'female', or 'other'" });
    }

    if (skills) {
        if (!Array.isArray(skills)) {
            return res.status(400).json({ message: "Skills must be an array" });
        }
        if (skills.length > 20) {
            return res.status(400).json({ message: "Maximum 20 skills allowed" });
        }
    }

    if (bio && (typeof bio !== "string" || bio.length > 500)) {
        return res.status(400).json({ message: "Bio must be up to 500 characters" });
    }

    if (photoUrl && typeof photoUrl !== "string") {
        return res.status(400).json({ message: "Photo URL must be a string" });
    }

    // Prevent extra/unexpected fields
    const allowedFields = ['firstName', 'lastName', 'emailId', 'password', 'age', 'gender', 'photoUrl', 'bio', 'skills'];
    const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
    if (extraFields.length > 0) {
        return res.status(400).json({ message: `Unexpected fields: ${extraFields.join(', ')}` });
    }

    try {
        // Creating a new user instance
        const user = new UserModel(req.body);
        await user.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
});

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

    // Allowed fields for update
    const allowedUpdates = ['firstName', 'lastName', 'emailId', 'password', 'age', 'skills', 'bio', 'photoUrl', 'gender'];
    const updateFields = Object.keys(updateData).filter(key => key !== 'userId');

    // Check for invalid fields
    const isValidUpdate = updateFields.every((key) => allowedUpdates.includes(key));
    if (!isValidUpdate) {
        return res.status(400).json({ message: "Invalid update fields" });
    }

    // Field-specific validations
    if (updateData.skills) {
        if (!Array.isArray(updateData.skills)) {
            return res.status(400).json({ message: "Skills must be an array" });
        }
        if (updateData.skills.length > 20) {
            return res.status(400).json({ message: "Maximum 20 skills allowed" });
        }
    }

    if (updateData.emailId) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(updateData.emailId)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
    }

    if (updateData.password && updateData.password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    if (updateData.age && (updateData.age < 18 || updateData.age > 120)) {
        return res.status(400).json({ message: "Age must be between 18 and 120" });
    }

    if (updateData.gender && !['male', 'female', 'other'].includes(updateData.gender)) {
        return res.status(400).json({ message: "Gender must be 'male', 'female', or 'other'" });
    }

    try {
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