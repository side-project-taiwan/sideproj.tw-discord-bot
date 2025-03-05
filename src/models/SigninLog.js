const { Schema, model } = require('mongoose');

const SigninLogSchema = new Schema({
    userId:{
        type: String,
        required: true,
    },
    guildId:{
        type: String,
        required: true,
    },
    spExp: {
        type: Number,
        default: 0,
    },
    isRecalculated: {
        type: Boolean,
        default: false,
    },
    startTime:{
        type: Date,
        default: Date.now,
    },
    endTime:{
        type: Date,
        default: Date.now,
    },
});

module.exports = model('SigninLog', SigninLogSchema);