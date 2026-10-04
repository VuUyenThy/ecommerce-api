const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', async (req, res) => {
  res.json(await prisma.product.findMany({ orderBy: { pid: 'asc' } }));
});

router.get('/:id', async (req, res) => {
  const p = await prisma.product.findUnique({
    where: { pid: Number(req.params.id) },
  });
  if (!p) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  res.json(p);
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  const { pname, price, quantity } = req.body;
  if (!pname || price == null || Number(price) < 0) {
    return res.status(400).json({ message: 'Cần pname và price hợp lệ' });
  }
  const p = await prisma.product.create({
    data: { pname, price, quantity: Number(quantity) || 0 },
  });
  res.status(201).json(p);
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const { pname, price, quantity } = req.body;
  try {
    const p = await prisma.product.update({
      where: { pid: Number(req.params.id) },
      data: { pname, price, quantity },
    });
    res.json(p);
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    throw e;
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.product.delete({ where: { pid: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    if (e.code === 'P2003') {
      return res
        .status(409)
        .json({ message: 'Sản phẩm đã có trong đơn hàng, không thể xóa' });
    }
    throw e;
  }
});

module.exports = router;
