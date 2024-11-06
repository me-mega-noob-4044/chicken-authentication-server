const axios = require("axios");
const permanentUsers = require("./permanent-users");
const CLIENT_ID = process.env.clientID;
const CLIENT_SECRET = process.env.clientSecret;
const REDIRECT_URI = "http://localhost:3030/login/callback";

module.exports = async (req) => {
    try {
        const { code } = req.query;
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
            grant_type: "authorization_code",
            redirect_uri: REDIRECT_URI,
            scope: "identify guilds",
        });
        const headers = { "Content-Type": "application/x-www-form-urlencoded", "Accept-Encoding": "application/x-www-form-urlencoded" };
        const tokenResponse = await axios.post("https://discord.com/api/oauth2/token", params, { headers });
        const accessToken = tokenResponse.data.access_token;
        const userResponse = await axios.get("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${accessToken}` } });
        const { username, avatar, id } = userResponse.data;

        console.log(username, avatar, id);

        if (!permanentUsers.includes(username)) {
            return { username, avatar, id };
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
};