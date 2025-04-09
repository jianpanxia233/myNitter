const { runForAllUsers } = require('./crawler');
const { saveAllUsers } = require('./storage');

(async () => {
  try {
    const results = await runForAllUsers();
    
    // 统计报告
    Object.keys(results).forEach(el => {
      console.log(el, results[el].join(','));
    })
  } catch (error) {
    console.error('全局错误:', error.message);
    process.exit(1);
  }
})();