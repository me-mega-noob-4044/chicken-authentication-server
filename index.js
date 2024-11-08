require("dotenv").config();
const express = require("express");
const { mongoose } = require("mongoose");
const UserProfile = require("./schema/UserProfile");
const AccessToken = require("./schema/AccessToken");
const path = require("path");

const host = "localhost";

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

function validateSessionToken(req, token) {
    if (token == undefined) return false;

    let clientIp = "";

    if (!host.includes("localhost")) {
        let xForwardedFor = req.headers["x-forwarded-for"];

        if (xForwardedFor) {
            clientIp = xForwardedFor.split(",")[0];
        }

        if (!clientIp) clientIp = req.ip;
    }

    let decoded = decoder(token);
    
    if (decoded == undefined) {
        return false;
    }
    
    decoded = decoded[0].split(":");

    if (decoded.length == 3) {
        // Verify Token IP: prevents session token sharing between 2+ parties
        if (clientIp != decoded[2]) {
            return false;
        }
    }

    // Checks if the token is expired
    if (Date.now() > decoded[1]) {
        return false;
    }

    return true;
}

// Checks if access isn't expired. Returns true if access is good
function validateUserAccess(user) {
    if (!user) return false;
    if (!user.accessExpireDate) return true;
    if (Date.now() > user.accessExpireDate) return false;

    return true;
}

async function getUsers(req, sessionToken) {
    let users = await UserProfile.find({});

    let user = await UserProfile.findOne({
        sessionToken: sessionToken
    });

    if (!user || !validateUserAccess(user) || !validateSessionToken(req, sessionToken) || user.userRank < 2) { // password != process.env.personalTokenPassword
        users.forEach(user => {
            user.personalAccessToken = "";
            user.sessionToken = "";
        });
    }
    
    return users;
}

app.get("/userData*", async (req, res) => {
    let { sessionToken } = req.query;

    let users = await getUsers(req, sessionToken);

    res.send(users);
});

function generateSessionToken(req) {
    let clientIp = "";

    if (!host.includes("localhost")) {
        let xForwardedFor = req.headers["x-forwarded-for"];

        if (xForwardedFor) {
            clientIp = xForwardedFor.split(",")[0];
        }

        if (!clientIp) clientIp = req.ip;
    }

    let letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
    let result = "";

    for (let i = 0; i < 8; i++) {
        let indx = Math.floor(Math.random() * letters.length);

        result += letters[indx];

        result += ((indx + 1) * 2) >> 2;
    }

    result = result + ":" + (Date.now() + (7 * 24 * 60 * 60e3)); // The session token lasts for 7 days

    if (clientIp) {
        result = result + ":" + clientIp;
    }

    return encoder(result);
}

function generateTokenString() {
    let letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
    let result = "";

    for (let i = 0; i < 8; i++) {
        let indx = Math.floor(Math.random() * letters.length);

        result += letters[indx];

        result += ((indx + 1) * 2) >> 2;
        result += ((indx + 1) * 2) << 2;
    }

    result = result + ":" + Date.now();

    return encoder(result);
}

app.set("trust proxy", true);
app.use(express.json());

app.post("/delete-user", async (req, res) => {
    let { username, token } = req.body;

    let user = await UserProfile.findOne({
        sessionToken: token
    });

    let victim = UserProfile.findOne({
        userName: username
    });

    if (user && validateUserAccess(user) && validateSessionToken(req, token) && user.userRank > victim.userRank) {
        await UserProfile.deleteOne({
            userName: username
        });

        res.json({ msg: "valid" });
    } else {
        res.json({ msg: "Failed" });
    }
});

app.post("/generate-token", async (req, res) => {
    let { lifespan, token, accessTime } = req.body;

    let user = UserProfile.findOne({
        sessionToken: token
    });

    if (user && validateUserAccess(user) && validateSessionToken(req, token) && lifespan) {
        let id = generateTokenString();
        let token = new AccessToken({
            accessId: id,
            expireDate: Date.now() + lifespan,
            accessGrantTime: accessTime ? Date.now() + accessTime : 0
        });

        await token.save();

        res.json({ msg: "Success!", id: id });
    } else {
        res.json({ msg: "Failed" });
    }
});

app.post("/login/validate-access", async (req, res) => {
    let { username } = req.body;

    let userProfile = await UserProfile.findOne({
        userName: username
    });

    res.json({ valid: !!userProfile });
});

function validateToken(token) {
    if (!token) return false;

    return Date.now() - token.expireDate <= 0;
}

app.post("/login/access-token", async (req, res) => {
    let { accessToken, username, id, avatar } = req.body;

    let token = await AccessToken.findOne({
        accessId: accessToken
    });

    // tmp access token for development purposes
    if (token && validateToken(token)) {
        let userProfile = await UserProfile.findOne({
            userName: username
        });

        if (userProfile) {
            res.json({ msg: "You already have access buddy" });
            return;
        } else {
            userProfile = new UserProfile({
                userName: username,
                userId: id,
                userAvatar: avatar,
                accessExpireDate: token.accessGrantTime ? (Date.now() + token.accessGrantTime) : 0
            });

            userProfile.sessionToken = generateSessionToken(req);

            await userProfile.save();
            await AccessToken.deleteOne({
                accessId: accessToken
            });

            res.json({ valid: true, msg: "You have entered a valid access token! The page will refresh, and you'll re-authenticate with Discord to finish the process of gaining access." });
        }
    } else {
        res.json({ msg: `Attention: The access token '${accessToken.slice(0, 15)}${accessToken.length > 15 ? "..." : ""}' is invalid` });
    }
});

app.post("/get-user", async (req, res) => {
    let { username, token } = req.body;

    let user = await UserProfile.findOne({
        sessionToken: token
    });

    let users = await getUsers(req, token);
    let victim = users.find(e => e.userName == username);

    res.json({ msg: victim, powerOver: user?.userRank > victim?.userRank });
});

app.get("/login/todo", (req, res) => {
    res.redirect("https://discord.com/oauth2/authorize?client_id=1178799009599598642&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3030%2Flogin%2Fcallback&scope=identify");
});

app.get("/login/callback*", async (req, res) => {
    let data = await verification(req, (result) => {
        if (typeof result == "object") {
            // This will be used for quick authentication when the user tries to deploy chicken files into moomoo.io
            result.sessionToken = generateSessionToken(req);

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

app.get("/users", (req, res) => {
    let { url } = req;

    res.sendFile(path.join(`${__dirname}/users/index.html`));
});

app.get("/users*", (req, res) => {
    let { url } = req;

    res.sendFile(path.join(`${__dirname}${url}`));
});

app.get("/user*", (req, res) => {
    let { url } = req;

    if (url.includes("style.css") || url.includes("script.js") || url.includes("favicon")) {
        if (url.includes("favicon")) {
            res.sendFile(path.join(`${__dirname}/homepage/favicon.ico`));
        } else {
            res.sendFile(path.join(`${__dirname}${url}`));
        }

        return;
    }

    url = url.split("/user/")[1];

    let userProfile = UserProfile.findOne({
        userName: url
    });

    if (userProfile) {
        res.sendFile(path.join(`${__dirname}/user/index.html`));
    } else {
        res.send(`'${url}' is not a user`);
    }
});

app.get("/privacy", (req, res) => {
    res.sendFile(path.join(`${__dirname}/privacy/index.html`));
});

app.get("/privacy*", (req, res) => {
    let { url } = req;

    res.sendFile(path.join(`${__dirname}${url}`));
});

app.get("*", (req, res) => {
    let { url } = req;

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