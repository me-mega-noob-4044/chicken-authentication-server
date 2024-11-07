import powerToRole from "../src/power-to-role.js";
import * as UTILS from "../src/utils.js";

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

var users;
var main = document.getElementById("main");

function updateDisplay(indx) {
    main.innerHTML = "";

    let groups = [];

    for (let i in powerToRole) {
        groups.push([]);
    }

    for (let i = 0; i < groups.length; i++) {
        if (typeof indx == "number") {
            groups[i] = indx == i ? users.filter(e => e.userRank == parseInt(i)) : [];
        } else {
            groups[i] = users.filter(e => e.userRank == parseInt(i));
        }
    }

    let addOnTop = 20;

    for (let i = groups.length - 1; i >= 0; i--) {
        if (typeof indx == "number" && i != indx) continue;

        let element = document.createElement("div");
        element.classList.add("group-cell");
        element.style.top = `${addOnTop}px`;

        let title = document.createElement("div");
        title.classList.add("cell-title");
        title.innerHTML = powerToRole[i] + "(s)";
        element.appendChild(title);

        for (let t = 0; t < groups[i].length; t += 4) {
            let userHolder = document.createElement("div");
            userHolder.style = `position: relative; width: 100%; display: flex; justify-content: center; align-items: center;`;
            element.appendChild(userHolder);
        
            for (let tt = 0; tt < 3; tt++) {
                if (t + tt >= groups[i].length) break;
        
                let data = groups[i][t + tt];
        
                let user = document.createElement("div");
                user.classList.add("user-cell");
                if (tt == 1) user.style.marginLeft = "10px";
        
                let img = document.createElement("img");
                img.style = "height: 90px; border-radius: 100%; cursor: pointer; pointer-events: all;";
                img.src = UTILS.returnAvatarFormat(data.userId, data.userAvatar);
                img.onerror = function () {
                    if (this.src.includes(".gif")) {
                        this.src = this.src.split(".gif")[0] + ".png";
                    } else {
                        this.onerror = null;
                        this.src = UTILS.returnAvatarFormat();
                    }
                };
                img.onclick = function () {
                    location.href = `/user/${data.userName}`;
                };
                user.appendChild(img);
        
                userHolder.appendChild(user);
        
                let usernameText = document.createElement("div");
                usernameText.textContent = data.userName;
                user.appendChild(usernameText);
            }
        }
        

        /*

        let userHolder = document.createElement("div");
        userHolder.style = `position: relative; width: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column;`;
        element.appendChild(userHolder);

        for (let t = 0; t < groups[i].length; t++) {
            let data = groups[i][t];

            let user = document.createElement("div");
            user.classList.add("user-cell");

            let img = document.createElement("img");
            img.style = "height: 90px; border-radius: 100%; cursor: pointer;";
            img.src = UTILS.returnAvatarFormat(data.userId, data.userAvatar);
            img.onerror = function () {
                this.onerror = null;
                this.src = UTILS.returnAvatarFormat();
            };
            img.onclick = () => {};
            user.appendChild(img);

            userHolder.appendChild(user);

            user.innerHTML += data.userName;
        }
            */

        main.appendChild(element);

        if (i == 0) {
            element.style.marginBottom = "20px";
        }

        addOnTop += element.clientHeight + 40;
    }
}

(async () => {
    users = await fetch("/userData").then(e => e.json());

    users = users.sort((a, b) => b.userRank - a.userRank);

    updateDisplay();
})();

document.getElementById("home").onclick = () => {
    location.href = "/";
};

document.getElementById("indx0-btn").onclick = () => {
    updateDisplay();
};

document.getElementById("indx1-btn").onclick = () => {
    updateDisplay(4);
};

document.getElementById("indx2-btn").onclick = () => {
    updateDisplay(3);
};

document.getElementById("indx3-btn").onclick = () => {
    updateDisplay(2);
};

document.getElementById("indx4-btn").onclick = () => {
    updateDisplay(1);
};

document.getElementById("indx5-btn").onclick = () => {
    updateDisplay(0);
};