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

    var havePowerOver = false;

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