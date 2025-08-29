const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ['interested', 'accepted', 'rejected', 'ignored'],
            message: 'Status must be one of the following: pending, accepted, rejected, ignored'
        },
        default: 'pending', // <-- Move default inside status field
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

},
    {
        timestamps: true
    }
);

const ConnectionRequestModel = new mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequestModel;