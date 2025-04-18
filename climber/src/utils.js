// 随机 User-Agent
function getRandomUserAgent() {
    const agents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36'
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }
  
  // 延迟函数
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  module.exports = { getRandomUserAgent, delay };