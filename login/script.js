import * as UTILS from "../src/utils.js";

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

    // Main User Display:

    let element = document.createElement("div");
    element.classList.add("main-welcome");

    let userAvatar = document.createElement("div");
    userAvatar.classList.add("main-user-avatar");

    let img = document.createElement("img");
    img.style.width = "100%";
    img.style.height = "100%";
    img.src = UTILS.returnAvatarFormat(data.id, data.avatar);
    img.onerror = function() {
        this.onerror = null;
        this.src = UTILS.returnAvatarFormat();
    };

    userAvatar.appendChild(img);

    let name = document.createElement("div");
    name.classList.add("main-name-display");
    name.innerHTML = `
    <div style="color: rgb(202, 202, 0);">Hello!</div>
    <div style="margin-top: -5px;">${data.username}</div>`;
    
    element.appendChild(userAvatar);
    element.appendChild(name);

    document.getElementById("main-body").appendChild(element);

    // Access Token:
    if (data.notAUser) {
        let input = document.createElement("input");
        input.type = "text";
        input.classList.add("access-input");
        input.placeholder = "Access Token";
        input.style.width = `${element.clientWidth + 12.13}`;

        document.addEventListener("keydown", (event) => {
            if (event.key == "Enter" && input.value) {
                fetch("/login/access-token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        accessToken: input.value,
                        username: data.username,
                        id: data.id,
                        avatar: data.avatar
                    })
                }).then(e => e.json()).then(e => {
                    if (e.msg == "Access granted") {
                        localStorage.cached = "";

                        location.href = location.href;
                    }
                });

                input.value = "";
            }
        });

        document.getElementById("main-body").appendChild(input);
    }

    // Not you button:
    let notYou = document.createElement("div");
    notYou.style = "font-size: 12px; font-weight: 900; color: rgb(158, 158, 0); cursor: pointer;";
    notYou.innerHTML = "Not you?";

    notYou.onclick = () => {
        localStorage.cached = "";

        location.href = location.href;
    };

    document.getElementById("main-body").appendChild(notYou);
} else {
    location.href = "/login/todo";
}

document.getElementById("home").onclick = () => {
    location.href = "/";
};