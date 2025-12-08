require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════════╗
    ║                                           ║
    ║   🚀 Fashion E-commerce API Server       ║
    ║                                           ║
    ║   📍 Port: ${PORT}                        ║
    ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}        ║
    ║   📅 Started: ${new Date().toLocaleString()}    ║
    ║                                           ║
    ╚═══════════════════════════════════════════╝
  `);
  console.log(`\n✨ Server is ready at http://localhost:${PORT}/api/v1`);
  console.log(`📚 Health check: http://localhost:${PORT}/api/v1/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});