require("dotenv").config();
const express = require("express");
const { mongoose } = require("mongoose");
const UserProfile = require("./schema/UserProfile");
const path = require("path");

const app = express();

const verification = require("./src/verification");

async function getUsers(password) {
    let users = await UserProfile.find({});

    if (password != process.env.personalTokenPassword) {
        users.forEach(user => {
            user.personalAccessToken = "";
        });
    }
    
    return users;
}

app.get("/users*", async (req, res) => {
    let { password } = req.query;

    let users = await getUsers(password);

    res.send(users);
});

app.get("/login/callback*", async (req, res) => {
    let data = await verification(req);

    res.redirect(`/login?data=${JSON.stringify(data)}`);
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(`${__dirname}/login/index.html`));
});

app.get("/login*", (req, res) => {
    let { url } = req;

    if (url && !url.includes("/login?data=")) {
        res.sendFile(path.join(`${__dirname}${url}`));
    } else {
        res.sendFile(path.join(`${__dirname}/login/index.html`));
    }
});

app.get("*", (req, res) => {
    const { url } = req;

    if (url.includes("favicon.ico")) {
        res.sendFile(path.join(`${__dirname}/homepage/favicon.ico`));
    } else if (url.includes("assets")) {
        res.sendFile(path.join(`${__dirname}${url}`));
    } else if (url.includes("src")) {
        res.sendFile(path.join(`${__dirname}${url}`));
    } else {
        if (url) {
            res.sendFile(path.join(`${__dirname}/homepage/${url}`));
        } else {
            res.sendFile(path.join(`${__dirname}/homepage/index.html`));
        }
    }
});

(async () => {
    await mongoose.connect(process.env.database_password);
    console.log("Connected to database");

    app.listen(3030, () => {
        console.log("Connected to localhost:3000");
    });
})();