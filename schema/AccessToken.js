const { Schema, model } = require("mongoose");

const tokenSchemaProfile = new Schema({
    accessId: {
        type: String,
        required: true
    },
    expireDate: {
        type: Number,
        required: true
    },
    accessGrantTime: {
        type: Number
    }
});

module.exports = model("accesstokens", tokenSchemaProfile);