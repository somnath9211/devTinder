const express = require("express");
const app = express();
const connectDB = require("./config/database");
const UserModel = require("./models/user");
const cookieParser = require('cookie-parser');

app.use(cookieParser()); // Middleware to parse cookies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(express.json()); // Middleware to parse JSON bodies


const authRouter = require("./routes/auth");
const requestRouter = require("./routes/request");
const profileRouter = require("./routes/profile");
const userRouter = require("./routes/user");

app.use("/", authRouter); // Mount auth routes
app.use("/", requestRouter); // Mount request routes
app.use("/", profileRouter); // Mount profile routes
app.use("/", userRouter); // Mount user routes






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






connectDB().then(() => {
    app.listen(7777, (req, res) => {
        console.log("Server is running on port 7777");
    });
}
).catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // Exit the process with failure
});