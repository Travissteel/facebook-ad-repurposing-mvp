const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/clients', require('./routes/clients'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/variations', require('./routes/variations'));
app.use('/api/scraper', require('./routes/scraper'));
app.use('/api/nano-banana', require('./routes/nano-banana'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize PowerAdSpy service
const powerAdSpyService = require('./services/powerAdSpyService');

// Start server
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);

  // Check PowerAdSpy service status
  const serviceStatus = powerAdSpyService.getStatus();
  console.log(`🔧 PowerAdSpy service initialized in ${serviceStatus.mockMode ? 'mock' : 'live'} mode`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📡 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server shut down');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('📡 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server shut down');
    process.exit(0);
  });
});

module.exports = app;