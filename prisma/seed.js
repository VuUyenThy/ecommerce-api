const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.role.upsert({
    where: { rolename: 'ADMIN' },
    update: {},
    create: { rolename: 'ADMIN' },
  });
  await prisma.role.upsert({
    where: { rolename: 'USER' },
    update: {},
    create: { rolename: 'USER' },
  });

  if ((await prisma.membership.count()) === 0) {
    await prisma.membership.createMany({
      data: [
        { mname: 'Bronze', score: 0 },
        { mname: 'Silver', score: 100 },
        { mname: 'Gold', score: 500 },
      ],
    });
  }

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      fullname: 'Administrator',
      password: await bcrypt.hash('admin123', 10),
      roleid: admin.roleid,
    },
  });

  if ((await prisma.product.count()) === 0) {
    await prisma.product.createMany({
      data: [
        { pname: 'Áo thun', price: 150000, quantity: 50 },
        { pname: 'Quần jean', price: 350000, quantity: 30 },
      ],
    });
  }

  console.log('Seed xong');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
