import * as UTILS from "../src/config.js";

const loginRedirect = "https://discord.com/oauth2/authorize?client_id=1178799009599598642&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3030%2Flogin%2Fcallback&scope=identify";

var devauled = UTILS.devauleURL(location.search)?.data;

if (typeof devauled == "string") {
    devauled = JSON.parse(devauled);
} else {
    devauled = undefined;
}

window.history.replaceState({}, "", "login");

if (localStorage.cached || devauled) {
    let data = (devauled || JSON.parse(localStorage.cached));

    console.log(data);
} else {
    location.href = loginRedirect;
}

document.getElementById("home").onclick = () => {
    location.href = "/";
};