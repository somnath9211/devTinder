const express = require('express');
const userAuth = require("../middlewares/auth.js");
const ConnectionRequestModel = require('../models/connectionRequest');
const UserModel = require('../models/user.js');
const userRouter = express.Router();

// Get all connection requests for the logged-in user
userRouter.get('/user/requests/received', userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user;
        const connectionRequests = await ConnectionRequestModel.findOne({
            receiverId: loggedInUserId._id,
            status: "interested"
        }).populate('senderId', ['firstName', 'lastName', 'photoUrl', 'bio', 'skills', 'gender']);
        console.log(connectionRequests);
        if (!connectionRequests || connectionRequests.length === 0) {
            return res.status(404).json({ message: "No connection requests found" });
        };
        res.status(200).json(connectionRequests);
    } catch (error) {
        console.error("Error fetching connection requests:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
});

// Get all connection that user have accepted

userRouter.get('/user/conncetions', userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user;
        const connections = await ConnectionRequestModel.find({
            $or: [
                { senderId: loggedInUserId._id, status: "accepted" },
                { receiverId: loggedInUserId._id, status: "accepted" }
            ]
        }).populate('senderId receiverId', ['firstName', 'lastName', 'photoUrl', 'bio', 'skills']);
        if (!connections || connections.length === 0) {
            return res.status(404).json({ message: "No connections found" });
        };
        const data = connections.map(conn => {
            if (conn.senderId._id.toString() === loggedInUserId._id.toString()) {
                return conn.receiverId;
            } else {
                return conn.senderId;
            };
        });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
});

// feed of users

userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user;
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        let skip = (page - 1) * limit;

        const connections = await ConnectionRequestModel.find({
            $or: [
                { senderId: loggedInUserId._id },
                { receiverId: loggedInUserId._id }
            ]
        }).select('senderId receiverId status');

        // Hide the allredy send or recieved connection request
        const connectedUserIds = new Set();
        connections.forEach(conn => {
            connectedUserIds.add(conn.senderId.toString());
            connectedUserIds.add(conn.receiverId.toString());
        });

        console.log(connectedUserIds);

        // Exclude all the connected users and send requests users

        const allUsers = await UserModel.find({ _id: { $ne: loggedInUserId._id } }).select('firstName lastName photoUrl bio skills');
        const filteredUsers = allUsers.filter(user => !connectedUserIds.has(user._id.toString()))
        console.log(filteredUsers);


        res.status(200).json(filteredUsers);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
})

module.exports = userRouter;