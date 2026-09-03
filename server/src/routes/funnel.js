const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const VALID_STEPS = {
  1: 'direction',
  2: 'practice',
  3: 'place',
  4: 'dates',
  5: 'student',
  6: 'fioFormat',
};

// POST /api/funnel/event — log a step completion (public)
router.post('/event', async (req, res) => {
  const { sessionId, step, directionId } = req.body;
  if (!sessionId || !step || !VALID_STEPS[step]) {
    return res.status(400).json({ error: 'Неверные данные' });
  }
  try {
    await prisma.funnelEvent.create({
      data: {
        sessionId,
        step: parseInt(step),
        stepName: VALID_STEPS[step],
        directionId: directionId ? parseInt(directionId) : null,
      },
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
