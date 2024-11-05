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
    isOwner: {
        type: Boolean
    },
    accessDate: {
        type: Object
    },
    userRank: {
        type: Number,
        default: 0
    },
    personalAccessToken: {
        type: String
    },
    isOnline: {
        type: Boolean
    },
    chickenUserStats: {
      type: [Number],
      default: [0, 0, 0]
    }
}, { timestamps: true });

module.exports = model("userprofiles", userSchemaProfile);