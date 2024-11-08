const { Schema, model } = require("mongoose");

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
    accessExpireDate: {
        type: Number
    },
    personalAccessToken: {
        type: String
    },
    userData: {
        type: [Number],
        default: [0, 0, 0] /* kills, deaths, time played */
    },
    lastOnline: {
        type: Date,
        default: new Date()
    }
}, { timestamps: true });

module.exports = model("userprofiles", userSchemaProfile);