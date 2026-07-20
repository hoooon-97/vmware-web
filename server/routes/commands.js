const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');

const router = express.Router();
const commandsDir = path.join(__dirname, '..', '..', 'vmware_core', 'commands');

router.get('/', auth, (req, res) => {
  try {
    if (!fs.existsSync(commandsDir)) {
      return res.json({ categories: [] });
    }
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.json'));
    const categories = files.map(f => JSON.parse(fs.readFileSync(path.join(commandsDir, f), 'utf-8')));
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
