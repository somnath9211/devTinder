const express = require("express");

const app = express();


app.listen(7777, (req, res) => {
    console.log("Server is running on port 7777");
});