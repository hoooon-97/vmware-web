const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const authRoutes = require('./routes/auth');
const connectionRoutes = require('./routes/connections');
const commandRoutes = require('./routes/commands');
const executionRoutes = require('./routes/execution');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/commands', commandRoutes);
app.use('/api/execute', executionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend in production
const clientBuild = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuild));

// Catch-all route for SPA - use regex instead of wildcard
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VMware Core Web running on port ${PORT}`);
});
