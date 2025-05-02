const { env } = require("../env");
const mongoose = require("mongoose");
const MileageShopItem = require("../models/MileageShopItem"); // 確保這個路徑正確

const items = [
  // 升級道具
  {
    key: "job_scroll",
    name: "轉職捲軸",
    description: "蘊含改變自身能力的神秘力量的捲軸",
    mileageCost: 20000,
    rewardType: "custom",
  },
  {
    key: "wisdom_crystal",
    name: "知識結晶",
    description: "紀錄著古老魔法師們的智慧",
    mileageCost: 15000,
    rewardType: "custom",
  },
  {
    key: "qigu_egg",
    name: "企鵝蛋",
    description: "經歷風霜磨練的企鵝們的產物",
    mileageCost: 12000,
    rewardType: "custom",
  },
  // 碎片
  {
    key: "yellow_duck",
    name: "黃色小鴨",
    description: "工程師寫 code 好夥伴",
    mileageCost: 5000,
    rewardType: "custom",
  },
  {
    key: "melon_badge",
    name: "吃瓜標章",
    description: "道理可以不懂，瓜不能不吃",
    mileageCost: 5000,
    rewardType: "custom",
  },
  {
    key: "memory_chip",
    name: "記憶碎片",
    description: "儲存著某人的片段記憶",
    mileageCost: 6000,
    rewardType: "custom",
  },
  {
    key: "sheep_hair",
    name: "神奇羊毛",
    description: "據說是會寫程式的羊身上的毛",
    mileageCost: 7000,
    rewardType: "custom",
  },
  {
    key: "secret_scroll",
    name: "祕籍散頁",
    description: "似乎是屬於祕笈的一部分",
    mileageCost: 8000,
    rewardType: "custom",
  },
  {
    key: "wisdom_seed",
    name: "智慧芽芽",
    description: "充滿生命力且蘊含知識的種子，會成長成大樹",
    mileageCost: 9000,
    rewardType: "custom",
  },
];

async function seed() {
  try {
    mongoose.set("strictQuery", false);
    const result = await mongoose.connect(env.MONGO_URI);
    await MileageShopItem.deleteMany({});
    await MileageShopItem.insertMany(items);
    console.log("✅ 商品已成功匯入！");
  } catch (err) {
    console.error("❌ 匯入失敗：", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
