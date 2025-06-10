// utils/serverEnv.js

// 👉 請填入你實際使用的伺服器 ID
export const ENV_BY_ID = {
  "1205906503073140776": "production", // SPT
  "prod-server-2": "production",
  "1342185240487006268": "staging",
  "dev-server-1": "dev",
  "local-1": "dev",
};

/**
 * 取得指定 ID 對應的環境名稱
 * @param {string} id - 伺服器 ID
 * @returns {'production' | 'staging' | 'dev'} - 對應環境
 */
export const getEnv = (id) => ENV_BY_ID[id] ?? "dev";

/**
 * 判斷是否為 production 環境
 */
export const isProd = (id) => getEnv(id) === "production";

/**
 * 判斷是否為 staging 環境
 */
export const isStaging = (id) => getEnv(id) === "staging";

/**
 * 判斷是否為 dev（含 local）環境
 */
export const isDev = (id) => getEnv(id) === "dev";
