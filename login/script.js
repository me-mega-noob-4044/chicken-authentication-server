import * as UTILS from "../src/config.js";

var devauled = UTILS.devauleURL(location.search)?.data;

if (typeof devauled == "string") {
    devauled = JSON.parse(devauled);
} else {
    devauled = undefined;
}

window.history.replaceState({}, "", "login");

if (localStorage.cached || devauled) {
    let data = (devauled || JSON.parse(localStorage.cached));

    localStorage.cached = JSON.stringify(data);

    
} else {
    location.href = "/login/todo";
}

document.getElementById("home").onclick = () => {
    location.href = "/";
};