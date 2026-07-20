const express = require('express');
const { Client } = require('ssh2');
const db = require('../utils/db');
const auth = require('../middleware/auth');

const router = express.Router();

function checkLicense(userId) {
  const user = db.prepare('SELECT license_key, trial_ends_at FROM users WHERE id = ?').get(userId);
  if (user.license_key) return { allowed: true };
  if (new Date(user.trial_ends_at) > new Date()) return { allowed: true, trial: true };
  return { allowed: false, error: '체험 기간이 만료되었습니다. 라이선스를 구매해주세요.' };
}

router.post('/ssh', auth, (req, res) => {
  const license = checkLicense(req.userId);
  if (!license.allowed) return res.status(403).json({ error: license.error });

  const { host, port, username, password, command } = req.body;
  if (!host || !command) return res.status(400).json({ error: '호스트와 명령어가 필요합니다' });

  const startTime = Date.now();
  const conn = new Client();

  conn.on('ready', () => {
    conn.exec(command, (err, stream) => {
      if (err) {
        conn.end();
        return res.status(500).json({ error: err.message });
      }

      let stdout = '';
      let stderr = '';

      stream.on('data', (data) => { stdout += data.toString(); });
      stream.stderr.on('data', (data) => { stderr += data.toString(); });

      stream.on('close', (code) => {
        conn.end();
        const duration = Date.now() - startTime;

        db.prepare(
          'INSERT INTO execution_history (user_id, category, command_name, command_text, result, status, duration_ms) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(req.userId, 'ssh', command.substring(0, 50), command, stdout || stderr, code === 0 ? 'success' : 'error', duration);

        res.json({ stdout, stderr, exitCode: code, duration });
      });
    });
  });

  conn.on('error', (err) => {
    res.status(500).json({ error: `SSH 연결 실패: ${err.message}` });
  });

  conn.connect({ host, port: port || 22, username, password, readyTimeout: 10000 });
});

router.get('/history', auth, (req, res) => {
  const history = db.prepare('SELECT * FROM execution_history WHERE user_id = ? ORDER BY executed_at DESC LIMIT 100').all(req.userId);
  res.json({ history });
});

module.exports = router;
