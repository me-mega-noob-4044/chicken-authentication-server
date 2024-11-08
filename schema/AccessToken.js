const { Schema, model } = require("mongoose");

const tokenSchemaProfile = new Schema({
    accessId: {
        type: String,
        required: true
    },
    expireDate: {
        type: Number
    },
    accessGrantTime: {
        type: Number
    }
}, { timestamps: true });

module.exports = model("accesstokens", tokenSchemaProfile);