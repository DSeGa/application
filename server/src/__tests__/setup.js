const { execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  process.env.DATABASE_URL = 'file:./test.db';
  process.env.JWT_SECRET = 'test-secret-do-not-use-in-production';

  execSync('npx prisma db push --force-reset', {
    cwd: path.join(__dirname, '../../'),
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'pipe',
  });

  const { PrismaClient } = require('@prisma/client');
  const bcrypt = require('bcryptjs');
  const prisma = new PrismaClient();

  try {
    await prisma.admin.create({
      data: {
        username: 'admin',
        passwordHash: await bcrypt.hash('testpassword', 10),
      },
    });

    const dir = await prisma.direction.create({
      data: {
        code: '11.03.01',
        shortName: 'РСС',
        kafName: 'Радиосвязи и систем связи',
        headTitle: 'Заведующему кафедрой РСС',
        headNameFull: 'Иванов Иван Иванович',
        kafAddress: 'г. Томск, ул. Ленина, 1',
      },
    });

    // Две практики — нужны для тестов выбора нескольких
    await prisma.practiceType.create({
      data: {
        directionId: dir.id,
        name: 'Учебная практика: ознакомительная практика',
        correctForm: 'учебной практики: ознакомительной практики',
        supervisorName: 'Петров Пётр Петрович',
        sortOrder: 1,
      },
    });

    await prisma.practiceType.create({
      data: {
        directionId: dir.id,
        name: 'Производственная практика: технологическая практика',
        correctForm: 'производственной практики: технологической практики',
        supervisorName: 'Сидоров Алексей Владимирович',
        sortOrder: 2,
      },
    });

    console.log('✅ Test DB seeded');
  } finally {
    await prisma.$disconnect();
  }
};
