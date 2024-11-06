import * as UTILS from "../src/config.js";

const loginRedirect = "https://discord.com/oauth2/authorize?client_id=1178799009599598642&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3030%2Flogin%2Fcallback&scope=identify";

const devauled = JSON.parse(UTILS.devauleURL(location.search)?.data);
window.history.replaceState({}, "", "login");
console.log(devauled);
/*
if (localStorage.cached) {
    let data = JSON.parse(localStorage.cached);
} else {
    location.href = loginRedirect;
}
*/