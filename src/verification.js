const axios = require("axios");
const permanentUsers = require("./permanent-users");
const UserProfile = require("../schema/UserProfile");
const CLIENT_ID = process.env.clientID;
const CLIENT_SECRET = process.env.clientSecret;
const REDIRECT_URI = "http://localhost:3030/login/callback";

module.exports = async (req, callback) => {
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
        var data = {
            username: userResponse.data.username,
            avatar: userResponse.data.avatar,
            id: userResponse.data.id
        };

        let userProfile = await UserProfile.findOne({
            userName: data.username
        });

        // permanentUsers.includes(data.username) || 

        if (userProfile) {
            if (typeof callback == "function") data = callback(data);

            if (!userProfile && permanentUsers.includes(data.username)) {
                userProfile = new UserProfile({
                    userAvatar: data.avatar,
                    userId: data.id,
                    userName: data.username
                });
            }

            if (userProfile) { // Everytime user "re-auths" or "re-logins" it resets the user's session token
                userProfile.userAvatar = data.avatar;
                userProfile.sessionToken = data.sessionToken;

                await userProfile.save();
            }

            return data;
        } else {
            data.notAUser = true;

            return data;
        }
    } catch (e) {
        return false;
    }
};