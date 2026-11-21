const express = require('express');
const path = require('path');
const cors = require('cors');
const phoneRoutes = require('./routes/phoneRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and utility middleware
app.use(cors());
app.use(express.json({ limit: '10kb' })); // parse application/json and limit payload
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets from public/ directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
app.use('/api', phoneRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback for unmatched routes
app.use((req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected internal server error occurred.'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Phone Number Validator running on http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
