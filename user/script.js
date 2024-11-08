import * as UTILS from "../src/utils.js";
import powerToRole from "../src/power-to-role.js";

(function () {
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

    var user;
    var data = {};

    if (localStorage.cached) {
        data = JSON.parse(localStorage.cached);
    }

    var name = document.getElementById("name");
    var nameHolder = document.getElementById("name-holder");
    var statsHolder = document.getElementById("stats-holder");
    var uselessData = document.getElementById("useless-data");
    var accessControls = document.getElementById("access-controls");
    var admenControls = document.getElementById("admen-controls");
    var accessData = document.getElementById("access-data");
    var pfpTitle = document.getElementById("pfp-title");
    var usernameControls = document.getElementById("username-controls");
    var generateAccessToken = document.getElementById("generate-access-token");

    var pfp = document.getElementById("pfp");
    pfp.onerror = function () {
        if (this.src.includes(".gif")) {
            this.src = this.src.split(".gif")[0] + ".png";
        } else {
            this.src = UTILS.returnAvatarFormat();
        }
    };

    function formatTime(diff) {
        diff *= 1e3;

        let months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
        let days = Math.floor(diff / (1000 * 60 * 60 * 24)) % 30;
        let hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        let minutes = Math.floor((diff / 1000 / 60) % 60);
        let seconds = Math.floor((diff / 1000) % 60);

        return `${months}m ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    function formatDate(string) {
        let date = new Date(string);

        let options = {
            month: "short",
            day: "numeric",
            year: "numeric",
        };

        let datePart = date.toLocaleDateString("en-US", options);
        let timePart = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });

        return `${datePart} (${timePart})`;
    }

    var darkFadeTransition = document.getElementById("darkFadeTransition");
    var tokenGeneration = document.getElementById("token-generation");

    function doDarkModeTransition() {
        darkFadeTransition.style.display = "block";
        setTimeout(() => {
            darkFadeTransition.style.opacity = 0;
            setTimeout(() => {
                darkFadeTransition.style.display = "none";
                darkFadeTransition.style.opacity = 1;
            }, 400);
        }, 50);
    }

    var havePowerOver = false;

    function stringToMS(timeString) {
        let times = {
            "s": 1e3,
            "m": 2.628e9,
            "m_min": 6e4,
            "h": 3.6e6,
            "d": 8.64e7
        };
    
        let array = timeString.split(" ");
        let total = 0;
        let found = false;
    
        for (let i of array) {
            let value = parseFloat(i);
            let unit = i.match(/[a-zA-Z]+/)[0];
    
            if (unit == "m" && !found) {
                total += value * times["m"];
                found = true;
            } else if (unit == "m") {
                total += value * times["m_min"];
            } else if (times[unit]) {
                total += value * times[unit];
            }
        }
    
        return total;
    }

    function generateToken() {
        tokenGeneration.style.display = "flex";

        let element = document.createElement("div");
        element.style = `
        width: 450px;
        height: 193.5px;
        border: solid;
        border-width: 8px;
        border-color: rgb(117, 141, 139);
        border-radius: 12px;background-color: rgb(143, 172, 169);
        box-shadow: 0px -5px 10px rgba(0, 0, 0, 0.2), -5px 0px 10px rgba(0, 0, 0, 0.2), 0px 5px 10px rgba(0, 0, 0, 0.2), 5px 0px 10px rgba(0, 0, 0, 0.2);
        `;

        let title = document.createElement("div");
        title.style = `
        padding-top: 5px;
        padding-bottom: 5px;
        text-align: center;
        font-weight: 900;
        font-size: 32px;
        width: 100%;
        background-color: rgb(117, 141, 139);
        `;
        title.innerHTML = "Access Token Generation";

        let tokenLastTime = document.createElement("input");
        tokenLastTime.type = "text";
        tokenLastTime.style = `
        border: none;
        outline: none;
        width: 100%;
        height: 40px;
        font-weight: 900;
        font-size: 20px;
        `;
        tokenLastTime.placeholder = "Token Lifespan (4d 2s format)";

        let grantAccessTime = document.createElement("input");
        grantAccessTime.type = "text";
        grantAccessTime.style = `
        border: none;
        outline: none;
        width: 100%;
        height: 40px;
        font-weight: 900;
        font-size: 20px;
        margin-top: 10px;
        `;
        grantAccessTime.placeholder = "Access Duration (4d 2s format)";

        let doneButton = document.createElement("button");
        doneButton.style = `
        outline: none;
        border: none;
        width: 100%;
        margin-top: 10px;
        height: 40px;
        background-color: rgb(117, 141, 139);
        font-weight: 900;
        font-size: 20px;
        cursor: pointer;
        `;
        doneButton.innerHTML = "Generate";

        doneButton.onclick = () => {
            if (tokenLastTime.value) {
                let accessTime = stringToMS(grantAccessTime.value || "0s");
                let lifespan = stringToMS(tokenLastTime.value);

                if (!isNaN(lifespan) && typeof lifespan == "number") {
                    fetch("/generate-token", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            lifespan: lifespan,
                            accessTime: (accessTime || 0),
                            token: user.sessionToken
                        })
                    }).then(e => e.json()).then(e => {
                        console.log(e);
                    });
                }
            }
        };

        element.appendChild(title);
        element.appendChild(tokenLastTime);
        element.appendChild(grantAccessTime);
        element.appendChild(doneButton);
        tokenGeneration.appendChild(element);
    }

    function drawProfile() {
        name.innerText = user.userName;

        if (user.userRank >= 3) {
            pfpTitle.innerText = "🥇";
        } else if (user.userRank == 2) {
            pfpTitle.innerText = "🥈";
        } else if (user.userRank == 1) {
            pfpTitle.innerText = "🥉";
        }

        pfpTitle.innerText += powerToRole[user.userRank];

        pfp.src = UTILS.returnAvatarFormat(user.userId, user.userAvatar);

        let nameHolderWidth = Math.max(734.81, nameHolder.clientWidth - 16.19);

        statsHolder.style.width = (nameHolderWidth + 36) + "px";
        uselessData.style.width = (nameHolderWidth + 36) + "px";
        accessControls.style.width = (nameHolderWidth + 36) + "px";
        accessData.style.width = (nameHolderWidth + 36) + "px";
        usernameControls.style.width = (nameHolderWidth + 36) + "px";
        generateAccessToken.style.width = (nameHolderWidth + 36) + "px";

        if (data.username == user.userName && user.userRank > 0) {
            generateAccessToken.style.display = "block";
            generateAccessToken.style.top = "430px";

            generateAccessToken.onclick = () => {
                doDarkModeTransition();
                generateToken();
            };
        }

        if (!user.accessExpireDate) {
            accessData.style.display = "none";
            accessControls.style.top = "430px";
            usernameControls.style.top = "540px";
        }

        document.getElementById("kills").innerText = user.userData[0];
        document.getElementById("deaths").innerText = user.userData[1];
        document.getElementById("time-played").innerText = formatTime(user.userData[2]);

        document.getElementById("access-granted-date").innerText = formatDate(user.createdAt);
        document.getElementById("last-online-date").innerText = formatDate(user.lastOnline);

        if (havePowerOver) {
            admenControls.style.display = "block";
        }
    }

    document.getElementById("home").onclick = () => {
        location.href = "/";
    };

    (async () => {
        let username = location.href.split("/user/")[1];

        document.title = document.title.replace("User", `${username}'s`);

        fetch("/get-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                token: data.sessionToken || ""
            })
        }).then(e => e.json()).then(e => {
            if (e.msg) {
                user = e.msg;
                havePowerOver = e.powerOver;

                drawProfile();
            }
        });
    })();
})();