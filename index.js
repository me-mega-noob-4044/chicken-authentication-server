require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();

app.get("*", (req, res) => {
    const { url } = req;
    if (url.includes("favicon.ico")) {
        res.sendFile(path.join(__dirname, "/homepage/favicon.ico"));
    } else {
        if (url) {
            res.sendFile(path.join(`${__dirname}/homepage/${url}`));
        } else {
            res.sendFile(path.join(__dirname + "/homepage/index.html"));
        }
    }
})

app.listen(3030, () => {
    console.log("Connected to localhost:3000");
});