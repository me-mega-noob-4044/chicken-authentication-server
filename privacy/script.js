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

document.getElementById("home").onclick = () => {
    location.href = "/";
};