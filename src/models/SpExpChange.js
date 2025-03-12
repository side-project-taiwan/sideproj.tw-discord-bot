const { Schema, model } = require('mongoose');

const SpExpChangeSchema = new Schema({
    userId:{
        type: String,
        required: true,
    },
    guildId:{
        type: String,
        required: true,
    },
    expChange: {
        type: Number,
        default: 0,
        required: true,
    },
    updatedExp: {
        type: Number,
        default: false,
    },
    reason:{
        type: String,
    },
    timestamp:{
        type: Date,
        default: Date.now,
    },
    signinId:{
        type: String,
    },
});

module.exports = model('SpExpChange', SpExpChangeSchema);