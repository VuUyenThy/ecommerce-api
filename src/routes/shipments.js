const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middlewares/auth');

const STATUSES = ['PENDING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

router.patch('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
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
