const axios = require('axios');
const OpenAI = require('openai');
const pLimit = require('p-limit').default;
const { parseTweets } = require('./parser');
const { delay, getRandomUserAgent } = require('./utils');
const config = require('../config/config');

const limit = pLimit(8);

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: config.DK_KEY
});

async function analyzeCrypto(tweet) {
  try {
    // 并行发起所有请求
    const promises = tweet.map((item) => 
      limit(() => {
        return openai.chat.completions.create({
          messages: [{
            role: "system",
            content: "你是一个加密市场情绪分析专家，请严格按以下规则响应：\n" +
              "1. 判断以下加密推文的情绪是看涨、看跌还是中性，只返回一个单词：bullish（看涨）、bearish（看跌）或 neutral（中性）\n" +
              "2. 分析推文中的市场情绪，考虑关键词、语气和行业术语\n" +
              "3. 忽略个人观点，只基于内容客观判断"
          }, {
            role: 'user',
            content: item.content
          }],
          model: "deepseek-chat",
        }).then(tag => ({ ...item, tag: tag.choices[0].message.content }));
      })
    );

    // 等待所有请求完成（保留顺序）
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.log('error', error);
    return []; // 任一请求失败则整体失败（根据需求可改用 Promise.allSettled）
  }
}



class NitterCrawler {
  // 改为接收用户参数
  constructor(username) {
    this.username = username;
    this.baseUrl = `${config.NITTER_URL}/${username}`;
  }

  // 爬取用户推文（支持分页）
  async scrapeUserTweets() {
    let tweets = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= config.MAX_PAGES) {
      try {
        const url = page === 1 ? this.baseUrl : `${this.baseUrl}/page/${page}`;
        const html = await this.fetchPage(url);
        const pageTweets = parseTweets(html);
        console.log('pageTweets', pageTweets.length);
        const judgedTweets = await analyzeCrypto(pageTweets.slice(0,8));
        if (pageTweets.length === 0) {
          hasMore = false;
          break;
        }

        tweets = [...tweets, ...judgedTweets];
        console.log(`Page ${page} 完成，累计推文数: ${judgedTweets.length}`);
        page++;
      } catch (error) {
        console.error(`爬取第 ${page} 页失败:`, error.message);
        break;
      }
    }

    return tweets;
  }

  // 获取页面 HTML
  async fetchPage(url) {
    const headers = {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "zh-CN,zh;q=0.9",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
      "sec-ch-ua": getRandomUserAgent(),
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "referer": "https://orange-xylophone-vq5765w674wfx657.github.dev/",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "cookie": "tunnel_phishing_protection=puzzled-hill-3r45fmc.usw3; .Tunnels.Relay.WebForwarding.Cookies=CfDJ8Cs4yarcs6pKkdu0hlKHsZsAfeUKJ6o2uciRgXevOsqdDGRMiH_OgXIg8mEUX2fgYqsM2U5C0d9B8idPiV91BA4sSHuJS5CJ7ULw8e7DFhYCQvqkqQqBs1g7gvdqCcaZsmXnCKQGsAfrJvwoDmiTu0KqM1Vbu5mO5k6dnxL-LlKwB-e5B4VTk3RpHRvylNLpJGI8A4MgFyTtVFz0N7nWXoTe3exKCQ-xmhqTZiYjySQiKIoMR-VZT4bKNMal4IjXpqzVuhZzf1BNnQJki_cYoSHeddEuxnAzCPM919mCuX_j10DxL12jMSW9xz7Qivh69mBaWQ9i1Ilp55U42aXo42ukUU6wgKI3Ed1IpovolT3YabtR4HpVKkUE7m6M5xuC3vKlM2tga3YDdH4wi7oBRNRT6rZaICW78989Aj4ZoJ4C0-yXOpLhO7_TyBwm5U155FiboaKr1cvnkBhNJie5_3CsRRZbIT2Z9Xdu9FWk4e49LBKFjF9K28vz2gtAv7-R7pkSSQMqrPBM3WC_7NnvDvsvb7YsU0HbUjSnwiL4rmCFevcus0Y1fMVzNp3fqsfRZJ9YW5mjVU0_lvJMEJrrLiyCTllpIDkDsx_ol8I59KNwrzitUoPOawDZIteCeWrNAG0opds1jmMvqAiO08Gq5VWlYRzWcbyQJvyX-ctxgA-okHeWM2lNpwpJA8KqGGJR5xCLPXXKZid2Nuoh_n3E9GT5KgoJYXclkguCxjmZpF5zH7-6g5uDUeEoNL0CJYke3YAySxWYKlj9IKff9hOqiWVQMkVqnLH4D5rn3QM0EAiA5FBDDBCUosicyvo6fQcgfcCRdinGlZA14dXv4_PL6MS9EBfYKRsYoVAWzgYL55FxMacmARIrevL_u68KoCfDpu9QAcT0cJyrQJ6dHl-hibFggz9KFfnpq3wVVFKhr-7bqknuR5PyiGM5EgjYw17bwmgtqVhwjW08mxrQqu6fLb4ohNlmcSis3LhnbaCvw6dZPtSvbU-IiBdLg2CBqI3ZhwTCUo8o1kkiOnDyqE7X_dmbp1wq8sDchGx9_bPRAmu4dOXTf82twCcxDAisIMs05Dab8nmhwenT2FTxzWhwM3YoDw6SoJU0h9lDCwBkK-K9ryZ7QIySuZRpWehIS16at-qaGSdmhBYeTrr0r7TSeiaMzAm8n2Iwrm7S4zjf0WlLmdn0BXUZ5mVkgXvY09sP_ge8S9Tb2c_pgTixLjas9z88nGCiq_vcMPAQMEYjyPYoWceQTqNsOkXd_SYTFkppOlXZEfoI0evTY6_dSAo8ZS2l6_KWVwyJ2lm3NCfDhn5LcdEq2UX1rHZ_464ZWcKQ7btb8zPiQ-lX-br1d5Sj5eOx_UHxoAxh7FW_fx_x4CaqJ3NnC156BP8s6U4F0OMSOcfpCQHwvefnFbcqZAjAccKu7NIL8D56VZ5qFH8A3Lfv2xgMB6MLzUTol7EGiMHvxI7PUgLgbnpuvpIhTXuHKRKOcpGpuzTLjLQiIZdDF6i_IxKTnM1XmuyvE4svDIxRzwVPIK0TWfjU_J8zWila1SHsjMjzCeH8MUiNNNtLCV0fWUM5Ym7Z99mZN-qu-L7C3i4x6qyGMDyGzxgNgd4ZPfk"
    };

    const options = {
      headers
    };

    const response = await axios.get(url, options);
    return response.data;
  }
}

// 新增批量执行方法
async function runForAllUsers() {
  const results = {
    '看涨': [],
    '看跌': [],
    '中性': [],
  };
  
  for (const user of config.TARGET_USERS) {
    try {
      console.log(`开始爬取用户: ${user}`);
      const crawler = new NitterCrawler(user);
      const tweets = await crawler.scrapeUserTweets();
      const bullishCount = tweets.filter(el => el.tag === 'bullish').length;
      const bearishCount = tweets.filter(el => el.tag === 'bearish').length;
      const attitude = bullishCount > bearishCount ? '看涨' : bullishCount === bearishCount ? '中性' : '看跌';
      console.log(`${user}:${attitude}`);
      results[attitude].push(user);
  
      // 用户间间隔
      await delay(config.USER_INTERVAL_MS);
    } catch (error) {
      console.error(`用户 ${user} 爬取失败:`, error.message);
    }
  }
  
  return results;
}

module.exports = { NitterCrawler, runForAllUsers };