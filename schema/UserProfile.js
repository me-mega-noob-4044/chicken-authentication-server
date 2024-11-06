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
    personalAccessToken: {
        type: String
    },
}, { timestamps: true });

module.exports = model("userprofiles", userSchemaProfile);