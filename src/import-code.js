const axios = require("axios");
const repo = process.env.githubReponame;
const token = process.env.githubToken;

module.exports = async (req, res, pathToFile = "", callback) => {
    const url = `https://api.github.com/repos/me-mega-noob-4044/${repo}/contents/${pathToFile}?ref=main`;
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = response.data;
    let code = Buffer.from(data.content, "base64").toString("utf-8");

    if (typeof callback == "function") {
        callback(code);
        return;
    }

    res.send(code);
};