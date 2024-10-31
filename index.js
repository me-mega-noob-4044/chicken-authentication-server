const express = require("express");

const app = express();

app.get("*", (req, res) => {
    res.send("HI :)");
})

app.listen(3030, () => {
    console.log("Connected to localhost:3000");
});