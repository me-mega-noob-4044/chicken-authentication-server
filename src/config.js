export const devauleURL = (search) => {
    let searchParams = new URLSearchParams(search);
    let modifiedParams = {};
    searchParams.forEach((value, key) => {
        modifiedParams[key] = value;
    });

    return modifiedParams;
};