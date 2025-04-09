require('dotenv').config();

module.exports = {
  NITTER_URL: 'https://orange-xylophone-vq5765w674wfx657-8080.app.github.dev',
  // 改为用户数组配置
  TARGET_USERS: process.env.TARGET_USERS ? 
    process.env.TARGET_USERS.split(',') : 
    ['qinbafrank', 'CryptoHayes', 'Guilin_Chen_', 'Trader_S18', 'rickawsb', 'BTCBruce1', 'Imlaomao', 
      'CryptoPainter_X', 'Paris13Jeanne', 'TJ_Research01', 'magicube121', 'Qzzonebit', 'dotyyds1234', 
      'trading__horse', 'JoshuaDeuk', '0xENAS'],
  PROXY: { /* 保持不变 */ },
  MAX_PAGES: 1,
  REQUEST_DELAY_MS: 2000,
  // 新增用户间请求间隔、请求deepseek分析有等待时间，可忽略
  // USER_INTERVAL_MS: 5000,
  DK_KEY: 'sk-4a133d8ccd304e15ab0cebb8dc835f5e'
};