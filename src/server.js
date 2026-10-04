const { port } = require('./config/env');
const app = require('./app');
const prisma = require('./lib/prisma');

const server = app.listen(port, () => {
  console.log(`API chạy tại cổng ${port}`);
});

process.on('SIGTERM', () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
