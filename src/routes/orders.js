const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// Tạo đơn. Body: { "items": [ { "pid": 1, "qty": 2 } ] }
router.post('/', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items phải là mảng không rỗng' });
  }
  const valid = items.every(
    (i) => Number.isInteger(i.pid) && Number.isInteger(i.qty) && i.qty > 0
  );
  const pids = items.map((i) => i.pid);
  if (!valid || new Set(pids).size !== pids.length) {
    return res
      .status(400)
      .json({ message: 'pid/qty không hợp lệ hoặc bị trùng sản phẩm' });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { pid: { in: pids } },
      });
      if (products.length !== pids.length) {
        throw Object.assign(new Error('Có sản phẩm không tồn tại'), {
          status: 404,
        });
      }
      const priceOf = new Map(products.map((p) => [p.pid, p.price]));

      for (const i of items) {
        // Trừ kho có điều kiện: tránh bán vượt tồn kho khi nhiều người mua cùng lúc
        const r = await tx.product.updateMany({
          where: { pid: i.pid, quantity: { gte: i.qty } },
          data: { quantity: { decrement: i.qty } },
        });
        if (r.count === 0) {
          throw Object.assign(
            new Error(`Sản phẩm ${i.pid} không đủ tồn kho`),
            { status: 409 }
          );
        }
      }

      return tx.order.create({
        data: {
          uid: req.user.uid,
          details: {
            create: items.map((i) => ({
              pid: i.pid,
              qty: i.qty,
              unitPrice: priceOf.get(i.pid),
            })),
          },
          shipments: { create: { status: 'PENDING' } },
        },
        include: { details: true, shipments: true },
      });
    });
    res.status(201).json(order);
  } catch (e) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    throw e;
  }
});

// User xem đơn của mình, ADMIN xem tất cả
router.get('/', async (req, res) => {
  const where = req.user.role === 'ADMIN' ? {} : { uid: req.user.uid };
  res.json(
    await prisma.order.findMany({
      where,
      include: { details: true, shipments: true },
      orderBy: { oid: 'desc' },
    })
  );
});

router.get('/:id', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { oid: Number(req.params.id) },
    include: { details: { include: { product: true } }, shipments: true },
  });
  // Trả 404 cả khi đơn của người khác, để không lộ sự tồn tại của đơn
  if (!order || (req.user.role !== 'ADMIN' && order.uid !== req.user.uid)) {
    return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  }
  res.json(order);
});

module.exports = router;
