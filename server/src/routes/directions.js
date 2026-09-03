const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const requireAuth = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/directions — public, used by the form
router.get('/', async (req, res) => {
  const directions = await prisma.direction.findMany({
    where: { isActive: true },
    include: {
      practiceTypes: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { id: 'asc' },
  });
  res.json(directions);
});

// GET /api/directions/all — admin, includes inactive
router.get('/all', requireAuth, async (req, res) => {
  const directions = await prisma.direction.findMany({
    include: {
      practiceTypes: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { applications: true } },
    },
    orderBy: { id: 'asc' },
  });
  res.json(directions);
});

// POST /api/directions — create
router.post('/', requireAuth, async (req, res) => {
  const { code, shortName, kafName, headTitle, headNameFull, kafAddress } = req.body;
  try {
    const direction = await prisma.direction.create({
      data: { code, shortName, kafName, headTitle, headNameFull, kafAddress: kafAddress || '' },
    });
    res.status(201).json(direction);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT /api/directions/:id
router.put('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { code, shortName, kafName, headTitle, headNameFull, kafAddress, isActive } = req.body;
  try {
    const direction = await prisma.direction.update({
      where: { id },
      data: { code, shortName, kafName, headTitle, headNameFull, kafAddress, isActive },
    });
    res.json(direction);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/directions/:id — soft delete
router.delete('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.direction.update({ where: { id }, data: { isActive: false } });
  res.json({ ok: true });
});

// ── Practice types ────────────────────────────────────────────────────────────

// POST /api/directions/:id/practice-types
router.post('/:id/practice-types', requireAuth, async (req, res) => {
  const directionId = parseInt(req.params.id);
  const { name, correctForm, supervisorName, sortOrder } = req.body;
  try {
    const pt = await prisma.practiceType.create({
      data: { directionId, name, correctForm: correctForm || '', supervisorName, sortOrder: sortOrder || 0 },
    });
    res.status(201).json(pt);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT /api/directions/practice-types/:ptId
router.put('/practice-types/:ptId', requireAuth, async (req, res) => {
  const id = parseInt(req.params.ptId);
  const { name, correctForm, supervisorName, sortOrder, isActive } = req.body;
  try {
    const pt = await prisma.practiceType.update({
      where: { id },
      data: { name, correctForm, supervisorName, sortOrder, isActive },
    });
    res.json(pt);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/directions/practice-types/:ptId
router.delete('/practice-types/:ptId', requireAuth, async (req, res) => {
  const id = parseInt(req.params.ptId);
  await prisma.practiceType.update({ where: { id }, data: { isActive: false } });
  res.json({ ok: true });
});

module.exports = router;
