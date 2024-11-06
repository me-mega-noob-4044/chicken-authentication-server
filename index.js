require("dotenv").config();
const express = require("express");
const { mongoose } = require("mongoose");
const UserProfile = require("./schema/UserProfile");
const path = require("path");

const app = express();

const importCode = require("./src/import-code");
const verification = require("./src/verification");

var encoder;
var decoder;

(async () => {
    await importCode(undefined, undefined, "server-side/encoder-decoder/encoder.js", (result) => {
        encoder = new Function(result);
    });

    await importCode(undefined, undefined, "server-side/encoder-decoder/decoder.js", (result) => {
        decoder = new Function(result);
    });
})();

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

function generateSessionToken() {
    let letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
    let result = "";

    for (let i = 0; i < 8; i++) {
        let indx = Math.floor(Math.random() * letters.length);

        result += letters[indx];

        result += indx >> 2;
    }

    result = result + ":" + (Date.now() + (24 * 60 * 60e3));

    return encoder(result);
}

app.get("/login/todo", (req, res) => {
    res.redirect("https://discord.com/oauth2/authorize?client_id=1178799009599598642&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3030%2Flogin%2Fcallback&scope=identify");
});

app.get("/login/callback*", async (req, res) => {
    let data = await verification(req, (result) => {
        if (typeof result == "object") {
            // This will be used for quick authentication when the user tries to deploy chicken files into moomoo.io
            result.sessionToken = generateSessionToken();

            return result;
        }
    });

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