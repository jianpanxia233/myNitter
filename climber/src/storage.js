const fs = require('fs-extra');
const path = require('path');

// 按用户保存文件
async function saveUserData(username, data) {
  const dir = path.join(__dirname, '../data');
  await fs.ensureDir(dir);
  const filename = `${username}_tweets.json`;
  const filePath = path.join(dir, filename);
//   await fs.writeJson(filePath, data, { spaces: 2 });
  return filePath;
}

// 批量保存
async function saveAllUsers(results) {
  const savedFiles = [];
  for (const [username, tweets] of Object.entries(results)) {
    if (tweets.length > 0) {
      const path = await saveUserData(username, tweets);
      savedFiles.push(path);
    }
  }
  return savedFiles;
}

module.exports = { saveUserData, saveAllUsers };