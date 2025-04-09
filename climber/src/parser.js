const cheerio = require('cheerio');

// 解析推文列表
function parseTweets(html) {
  const $ = cheerio.load(html);
  const tweets = [];

  $('.timeline-item').each((_, element) => {
    const tweet = {
      id: $(element).attr('data-tweet-id'),
      content: $(element).find('.tweet-content').text().trim(),
      timestamp: $(element).find('.tweet-date a').attr('title'),
      likes: parseInt($(element).find('.icon-heart').parent().text().trim()) || 0,
      retweets: parseInt($(element).find('.icon-retweet').parent().text().trim()) || 0,
      replies: parseInt($(element).find('.icon-comment').parent().text().trim()) || 0
    };
    tweets.push(tweet);
  });

  return tweets;
}

module.exports = { parseTweets };