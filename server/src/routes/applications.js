const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const requireAuth = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/applications — admin list with filters
router.get('/', requireAuth, async (req, res) => {
  const { directionId, from, to, page = 1, limit = 50 } = req.query;

  const where = {};
  if (directionId) where.directionId = parseInt(directionId);
  if (from || to) {
    where.generatedAt = {};
    if (from) where.generatedAt.gte = new Date(from);
    if (to)   where.generatedAt.lte = new Date(to + 'T23:59:59');
  }

  const [total, items] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      include: {
        direction:    { select: { shortName: true } },
        practiceType: { select: { name: true } },
      },
      orderBy: { generatedAt: 'desc' },
      skip:  (parseInt(page) - 1) * parseInt(limit),
      take:  parseInt(limit),
    }),
  ]);

  res.json({ total, page: parseInt(page), items });
});

module.exports = router;
