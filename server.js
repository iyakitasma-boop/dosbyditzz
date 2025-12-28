const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Import DOS API
const dosHandler = require('./api/dos.js');

// Routes
app.post('/api/dos', (req, res) => dosHandler(req, res));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  
  // For Codespaces
  if (process.env.CODESPACE_NAME) {
    console.log(`🚀 Codespace URL: https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev`);
  }
});