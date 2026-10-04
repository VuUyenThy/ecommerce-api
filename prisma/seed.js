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
    where: { rolename: 'normal' },
    update: {},
    create: { rolename: 'normal' },
  });

  if ((await prisma.membership.count()) === 0) {
    await prisma.membership.create({ data: { mname: 'normal', score: 10 } });
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

  console.log('Seed xong');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
