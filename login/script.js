import * as UTILS from "../src/utils.js";

var devauled = UTILS.devauleURL(location.search)?.data;

if (typeof devauled == "string") {
    devauled = JSON.parse(devauled);
} else {
    devauled = undefined;
}

window.history.replaceState({}, "", "login");

function announce(text) {
    document.getElementById("announcement-header").style.display = "flex";
    document.getElementById("announcement-text").innerHTML = text;

    document.getElementById("announcement-close").onclick = () => {
        document.getElementById("announcement-header").style.display = "none";
    };
}

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
    img.onerror = function () {
        this.onerror = null;
        this.src = UTILS.returnAvatarFormat();
    };

    userAvatar.appendChild(img);

    let name = document.createElement("div");
    name.classList.add("main-name-display");
    name.innerHTML = `
    <div style="color: rgb(143, 172, 169);">Hello!</div>
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
                    announce(e.msg);

                    if (e.valid) {
                        setTimeout(() => {
                            localStorage.cached = "";

                            location.href = location.href;
                        }, 5e3);
                    }
                });

                input.value = "";
            }
        });

        document.getElementById("main-body").appendChild(input);
    } else {
        // Checks if user has cached stuff, if so validate if they still have access
        fetch("/login/validate-access", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: data.username
            })
        }).then(e => e.json()).then(e => {
            if (!e.valid) {
                localStorage.cached = "";

                location.href = location.href;
            }
        });
    }

    // Not you button:
    let notYou = document.createElement("div");
    notYou.style = "font-size: 12px; font-weight: 900; color: rgb(143, 172, 169); cursor: pointer;";
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

var images = ["../assets/bg-image-1.png", "../assets/bg-image-2.png", "../assets/bg-image-3.png", "../assets/bg-image-4.png"];
var bgImage = document.getElementById("bg-image");

var indx = 0;
function changeBG() {
    bgImage.classList.add("blink");

    setTimeout(() => {
        bgImage.style.backgroundImage = `url("${images[indx]}")`;
        indx++;

        if (indx >= images.length) {
            indx = 0;
        }
    }, 350);

    setTimeout(() => {
        bgImage.classList.remove("blink");
    }, 800);
}

setInterval(changeBG, 10e3);