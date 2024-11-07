const { mongoose, Schema, model } = require("mongoose");

const userSchemaProfile = new Schema({
    userName: {
        type: String,
        required: true
    },
    userId: {
        type: String
    },
    userAvatar: {
        type: String
    },
    userRank: {
        type: Number,
        default: 0
    },
    sessionToken: {
        type: String
    },
    personalAccessToken: {
        type: String
    },
    userData: {
        type: [Number],
        default: [0, 0, 0] /* kills, deaths, time played */
    }
}, { timestamps: true });

module.exports = model("userprofiles", userSchemaProfile);