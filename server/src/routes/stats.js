const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const requireAuth = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/stats/overview
router.get('/overview', requireAuth, async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear  = new Date(now.getFullYear(), 0, 1);

  const [totalAll, totalMonth, totalYear, byDirection, byPractice, byPlace] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { generatedAt: { gte: startOfMonth } } }),
    prisma.application.count({ where: { generatedAt: { gte: startOfYear } } }),

    // By direction
    prisma.application.groupBy({
      by: ['directionId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),

    // By practice type
    prisma.application.groupBy({
      by: ['practiceTypeId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),

    // By place
    prisma.application.groupBy({
      by: ['place'],
      _count: { id: true },
    }),
  ]);

  // Resolve direction names
  const directions = await prisma.direction.findMany({ select: { id: true, shortName: true } });
  const dirMap = Object.fromEntries(directions.map(d => [d.id, d.shortName]));

  const practiceTypes = await prisma.practiceType.findMany({ select: { id: true, name: true } });
  const ptMap = Object.fromEntries(practiceTypes.map(p => [p.id, p.name]));

  res.json({
    totals: { all: totalAll, month: totalMonth, year: totalYear },
    byDirection: byDirection.map(r => ({
      name: dirMap[r.directionId] || 'Удалено',
      count: r._count.id,
    })),
    byPractice: byPractice.map(r => ({
      name: ptMap[r.practiceTypeId] || 'Удалено',
      count: r._count.id,
    })),
    byPlace: byPlace.map(r => ({ name: r.place, count: r._count.id })),
  });
});

// GET /api/stats/funnel
router.get('/funnel', requireAuth, async (req, res) => {
  // Count unique sessions that reached each step
  const steps = [1, 2, 3, 4, 5, 6];
  const stepNames = ['Направление', 'Вид практики', 'Место', 'Даты', 'Студент', 'Формат ФИО'];

  const counts = await Promise.all(
    steps.map(step =>
      prisma.funnelEvent.groupBy({
        by: ['sessionId'],
        where: { step: { gte: step } },
      }).then(r => r.length)
    )
  );

  // "Generated" = actual applications created
  const generated = await prisma.application.count();

  const funnelData = steps.map((_, i) => ({
    step: i + 1,
    name: stepNames[i],
    count: counts[i],
    pct: counts[0] > 0 ? Math.round((counts[i] / counts[0]) * 100) : 0,
  }));

  funnelData.push({
    step: 6,
    name: 'Сгенерировано',
    count: generated,
    pct: counts[0] > 0 ? Math.round((generated / counts[0]) * 100) : 0,
  });

  res.json(funnelData);
});

// GET /api/stats/monthly?year=2025
router.get('/monthly', requireAuth, async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end   = new Date(year + 1, 0, 1);

  const apps = await prisma.application.findMany({
    where: { generatedAt: { gte: start, lt: end } },
    select: { generatedAt: true },
  });

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: new Date(year, i, 1).toLocaleString('ru-RU', { month: 'short' }),
    count: 0,
  }));

  for (const app of apps) {
    const m = new Date(app.generatedAt).getMonth();
    monthly[m].count++;
  }

  res.json(monthly);
});

module.exports = router;
