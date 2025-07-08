const express = require("express");
const app = express();
const connectDB = require("./config/database");
const UserModel = require("./models/user");

app.use(express.json()); // Middleware to parse JSON bodies
app.post("/signup", async (req, res) => {

    console.log(req.body);

    // Creating a new user instance
    const user = new UserModel(req.body);
    await user.save()
        .then(() => {
            res.status(201).json({ message: "User created successfully" });
        })
        .catch((error) => {
            console.error("Error creating user:", error);
            res.status(500).json({ message: "Internal server error" });
        });

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