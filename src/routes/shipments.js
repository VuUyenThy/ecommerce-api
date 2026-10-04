const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middlewares/auth');

const STATUSES = ['PENDING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

router.use(authenticate);

// Xem một shipment: ADMIN hoặc chủ đơn hàng
router.get('/:id', async (req, res) => {
  const s = await prisma.shipment.findUnique({
    where: { shipid: Number(req.params.id) },
    include: { order: true },
  });
  if (!s || (req.user.role !== 'ADMIN' && s.order.uid !== req.user.uid)) {
    return res.status(404).json({ message: 'Không tìm thấy shipment' });
  }
  res.json(s);
});

// Cập nhật trạng thái: chỉ ADMIN
router.patch('/:id', authorize('ADMIN'), async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ message: `status phải thuộc: ${STATUSES.join(', ')}` });
  }
  try {
    const s = await prisma.shipment.update({
      where: { shipid: Number(req.params.id) },
      data: { status },
    });
    res.json(s);
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ message: 'Không tìm thấy shipment' });
    }
    throw e;
  }
});

module.exports = router;
