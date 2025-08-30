const express = require('express');
const userAuth = require("../middlewares/auth.js");
const ConnectionRequestModel = require('../models/connectionRequest.js');
const UserModel = require('../models/user.js');

const requestRouter = express.Router();

// Send a connection request - Interested or Not Ignored

requestRouter.post(
    '/sendConnectionRequest/send/:senderId',
    userAuth,
    async (req, res) => {
        try {
            const senderId = req.params.senderId;
            const receiverId = req.user._id;


            // Prevent self-connection
            if (senderId === receiverId.toString()) {
                return res.status(400).json({ message: "Sender and receiver cannot be the same user" });
            }

            // Check sender & receiver exist
            const [senderExists, receiverExists] = await Promise.all([
                UserModel.findById(senderId),
                UserModel.findById(receiverId)
            ]);
            if (!senderExists) return res.status(404).json({ message: "Sender not found" });
            if (!receiverExists) return res.status(404).json({ message: "Receiver not found" });

            // Check if request already exists
            const existingRequest = await ConnectionRequestModel.findOne({
                $or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            });

            if (existingRequest) {
                return res.status(400).json({ message: "A connection request already exists between these users" });
            }

            // Always start as pending
            const newConnectionRequest = new ConnectionRequestModel({
                senderId,
                receiverId,
                status: "interested"
            });

            const data = await newConnectionRequest.save();
            res.status(201).json({ message: "Connection request sent successfully", data });

        } catch (error) {
            console.error("Error in sendConnectionRequest:", error);
            res.status(500).json({ message: "Something went wrong", error: error.message });
        }
    }
);

// Accept or Reject a connection request
requestRouter.post(
    '/respondToConnectionRequest/respond/:status/:requestId',
    userAuth, async (req, res) => {
        try {
            const loggedInUserId = req.user;
            const { status, requestId } = req.params;
            const validStatuses = ["accepted", "rejected"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'rejected'" });
            };

            // Find the connection request in the database
            const connectionRequest = await ConnectionRequestModel.findOne({
                _id: requestId,
                receiverId: loggedInUserId._id,
                status: "interested"
            });
            if (!connectionRequest) {
                return res.status(404).json({ message: "Connection request not found or already responded to" });
            };
            // Update the status of the connection request
            connectionRequest.status = status;
            await connectionRequest.save();

            res.status(200).json({ message: `Connection request ${status} successfully`, data: connectionRequest });
        } catch (error) {
            console.error("Error in respondToConnectionRequest:", error);
            res.status(500).json({ message: "Something went wrong", error: error.message });
        }
    });


module.exports = requestRouter;