const express = require('express');
const db = require('../utils/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, (req, res) => {
  const connections = db.prepare('SELECT * FROM connections WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json({ connections });
});

router.post('/', auth, (req, res) => {
  const { name, host, port, username, connection_type, group_name } = req.body;
  if (!name || !host) return res.status(400).json({ error: '이름과 호스트가 필요합니다' });

  const result = db.prepare(
    'INSERT INTO connections (user_id, name, host, port, username, connection_type, group_name) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(req.userId, name, host, port || 22, username, connection_type || 'ssh', group_name || 'Default');

  res.json({ id: result.lastInsertRowid, name, host, port: port || 22 });
});

router.delete('/:id', auth, (req, res) => {
  const conn = db.prepare('SELECT * FROM connections WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!conn) return res.status(404).json({ error: '연결을 찾을 수 없습니다' });

  db.prepare('DELETE FROM connections WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
