export const devauleURL = (search) => {
    let searchParams = new URLSearchParams(search);
    let modifiedParams = {};
    searchParams.forEach((value, key) => {
        modifiedParams[key] = value;
    });

    return modifiedParams;
};

const chickenServerIcon = "https://cdn.discordapp.com/icons/747885288004648971/e1ebfb6b658acf67955c72e9aebb16ac.png";

export const returnAvatarFormat = (id, avatar) => {
    if (!avatar || !id) {
        return chickenServerIcon;
    }
    return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
}