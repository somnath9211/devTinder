const express = require('express');
const UserModel = require("../models/user");
const { validateUserInput } = require('../utils/userValidation');
const userAuth = require("../middlewares/auth");

const profileRouter = express.Router();

// Profile API - GET /profile - Fetch user profile by ID
profileRouter.get("/profile/view", userAuth, async (req, res) => {

    try {
        // Fetch the user from the database using the ID from req.user
        const user = req.user; // The user is already attached to the request object by the userAuth middleware
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const userObj = user.toObject();
        delete userObj.password;
        res.status(200).json(userObj);

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete API - DELETE  - Delete a user by ID
profileRouter.delete("/profile/delete", userAuth, async (req, res) => {
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
profileRouter.put("/profile/edit", userAuth, async (req, res) => {
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

module.exports = profileRouter;