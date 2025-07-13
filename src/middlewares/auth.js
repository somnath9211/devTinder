const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');


const userAuth = async (req, res, next) => {
    try {
        // Middleware to check if the user is authenticated
        const token = req.cookies.token; // Get token from cookies
        if (!token) {
            return res.status(401).json({ message: "Unauthorized access" });
        };

        const decodedToken = jwt.verify(token, "Somnath9211@"); // Verify the token

        const userId = decodedToken.userId; // Extract user ID from token


        const user = await UserModel.findById(userId);


        if (!user) {
            return res.status(401).json({ message: "Unauthorized access" });
        };
        // If user exists, attach user to request object
        req.user = user; // Attach user to request object


        next(); // If user exists, proceed to the next middleware or route handler
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Unauthorized access" });

    };
}

module.exports = userAuth; // Export the middleware for use in other files  