const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const prisma = require('./lib/prisma');
const { notFound, errorHandler } = require('./middlewares/error');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check: kiểm tra cả app lẫn kết nối database
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      database: 'up',
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(503).json({ status: 'error', database: 'down' });
  }
});

app.use('/api', require('./routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
