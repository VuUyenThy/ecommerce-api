const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const { authenticate } = require('../middlewares/auth');

router.post('/register', async (req, res) => {
  const { username, fullname, password } = req.body;
  if (!username || !fullname || !password || password.length < 6) {
    return res.status(400).json({
      message: 'Cần username, fullname và password (>= 6 ký tự)',
    });
  }
  if (await prisma.user.findUnique({ where: { username } })) {
    return res.status(409).json({ message: 'Username đã tồn tại' });
  }

  const role = await prisma.role.findUnique({ where: { rolename: 'USER' } });
  const lowest = await prisma.membership.findFirst({ orderBy: { score: 'asc' } });

  const user = await prisma.user.create({
    data: {
      username,
      fullname,
      password: await bcrypt.hash(password, 10),
      roleid: role.roleid,
      mid: lowest ? lowest.mid : null,
    },
    select: { uid: true, username: true, fullname: true },
  });
  res.status(201).json(user);
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { username: username || '' },
    include: { role: true },
  });

  // Cùng một thông báo cho cả hai trường hợp, tránh lộ username nào tồn tại
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
  }

  const token = jwt.sign(
    { uid: user.uid, role: user.role.rolename },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
  res.json({ token });
});

router.get('/me', authenticate, async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { uid: req.user.uid },
    select: {
      uid: true,
      username: true,
      fullname: true,
      role: true,
      membership: true,
    },
  });
  res.json(me);
});

module.exports = router;
