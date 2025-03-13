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