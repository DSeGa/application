const fs = require('fs');
const path = require('path');

module.exports = async () => {
  for (const ext of ['', '-wal', '-shm']) {
    const p = path.join(__dirname, `../../test.db${ext}`);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
};
