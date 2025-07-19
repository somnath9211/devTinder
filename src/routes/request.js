const express = require('express');
const userAuth = require("../middlewares/auth.js");

const requestRouter = express.Router();

requestRouter.post('/sendConnectionRequest', userAuth, async (req, res) => { });


module.exports = requestRouter;