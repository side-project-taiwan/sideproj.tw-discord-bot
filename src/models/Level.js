const { Schema, model } = require('mongoose');

const levelSchema = new Schema({
    userId:{
        type: String,
        required: true,
    },
    guildId:{
        type: String,
        required: true,
    },
    xp:{
        type: Number,
        default: 0,
    },
    level:{
        type: Number,
        default: 0,
    },
    /**
     * 活躍值（Activity）
     * 用於衡量使用者在 Discord 中的互動活躍程度，可能來自發言、簽到等行為。
     */
    activity: {
        type: Number,
        default: 0,
    },
    /**
     * 里程（Mileage）
     * 可用於兌換商城中的虛擬商品，透過每日簽到、活動參與等方式累積。
     */
    mileage: {
        type: Number,
        default: 0,
    },
    spExp:{
        type: Number,
        default: 0,
    },
    spSigninCooldown:{
        type: Date,
        default: Date.now,
    },
});

module.exports = model('Level', levelSchema);