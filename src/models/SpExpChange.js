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
    }, // exp變化量
    updatedExp: {
        type: Number,
        default: false,
    }, // 更新後的exp 
    reason:{
        type: String,
    }, // 變化原因
    timestamp:{
        type: Date,
        default: Date.now,
    }, // 變化時間
    signinId:{
        type: String,
    }, // 打卡紀錄id
});

module.exports = model('SpExpChange', SpExpChangeSchema);