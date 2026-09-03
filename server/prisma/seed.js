// server/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const INITIAL_DATA = [
  {
    code: '38.03.03',
    shortName: 'Управление персоналом',
    kafName: 'Менеджмента',
    headTitle: 'Зав. кафедрой',
    headNameFull: 'Афонасова Маргарита Александровна',
    kafAddress: 'г. Томск, ул. Красноармейская, 146',
    practiceTypes: [
      { name: 'Учебная практика: ознакомительная практика',                           correctForm: 'учебной практики: ознакомительной практики',                           supervisorName: 'Аксёнова Ж. Н.',     sortOrder: 1 },
      { name: 'Производственная практика: проектно-технологическая практика',         correctForm: 'производственной практики: проектно-технологической практики',         supervisorName: 'Гайдук Е. А.',       sortOrder: 2 },
      { name: 'Производственная практика: преддипломная практика',                    correctForm: 'производственной практики: преддипломной практики',                    supervisorName: 'Афонасова М. А.',    sortOrder: 3 },
    ],
  },
  {
    code: '38.03.02',
    shortName: 'Управление проектами',
    kafName: 'Менеджмента',
    headTitle: 'Зав. кафедрой',
    headNameFull: 'Афонасова Маргарита Александровна',
    kafAddress: 'г. Томск, ул. Красноармейская, 146',
    practiceTypes: [
      { name: 'Учебная практика: ознакомительная практика',                           correctForm: 'учебной практики: ознакомительной практики',                           supervisorName: 'Цап Н. Г.',          sortOrder: 1 },
      { name: 'Производственная практика: проектно-технологическая практика',         correctForm: 'производственной практики: проектно-технологической практики',         supervisorName: 'Цап Н. Г.',          sortOrder: 2 },
      { name: 'Производственная практика: преддипломная практика',                    correctForm: 'производственной практики: преддипломной практики',                    supervisorName: 'Цап Н. Г.',          sortOrder: 3 },
    ],
  },
  {
    code: '09.03.04',
    shortName: 'АОИ',
    kafName: 'Автоматизации обработки данных (АОИ)',
    headTitle: 'Зав. кафедрой',
    headNameFull: 'Сидоров Александр Александрович',
    kafAddress: 'г. Томск, ул. Вершинина, 74',
    practiceTypes: [
      { name: 'Учебная практика: ознакомительная практика',                                              correctForm: 'учебной практики: ознакомительной практики',                                              supervisorName: 'Пермякова Н. В.',    sortOrder: 1 },
      { name: 'Производственная практика: профессиональная практика по профилю деятельности',            correctForm: 'производственной практики: профессиональной практики по профилю деятельности',            supervisorName: 'Салмина Н. Ю.',      sortOrder: 2 },
      { name: 'Производственная практика: технологическая практика',                                     correctForm: 'производственной практики: технологической практики',                                     supervisorName: 'Салмина Н. Ю.',      sortOrder: 3 },
      { name: 'Производственная практика: преддипломная практика',                                       correctForm: 'производственной практики: преддипломной практики',                                       supervisorName: 'Салмина Н. Ю.',      sortOrder: 4 },
    ],
  },
  {
    code: '11.03.04',
    shortName: 'ПрЭ',
    kafName: 'Промышленной Электроники (ПрЭ)',
    headTitle: 'И. о. зав. кафедрой',
    headNameFull: 'Харитонов Александр Сергеевич',
    kafAddress: 'г. Томск, ул. Вершинина, 74',
    practiceTypes: [
      { name: 'Учебная практика: ознакомительная практика',                           correctForm: 'учебной практики: ознакомительной практики',                           supervisorName: 'Апасов В. И.',       sortOrder: 1 },
      { name: 'Производственная практика: проектно-технологическая практика',         correctForm: 'производственной практики: проектно-технологической практики',         supervisorName: 'Топор А. В.',        sortOrder: 2 },
      { name: 'Производственная практика: преддипломная практика',                    correctForm: 'производственной практики: преддипломной практики',                    supervisorName: 'Топор А. В.',        sortOrder: 3 },
    ],
  },
  {
    code: '27.03.04',
    shortName: 'КСУП (Тех)',
    kafName: 'Компьютерных систем в управлении и проектировании (КСУП)',
    headTitle: 'Зав. кафедрой',
    headNameFull: 'Шурыгин Юрий Александрович',
    kafAddress: 'г. Томск, ул. Вершинина, 74',
    practiceTypes: [
      { name: 'Учебная практика: получение первичных навыков научно-исследовательской работы', correctForm: 'учебной практики: получение первичных навыков научно-исследовательской работы', supervisorName: 'Коцубинский В. П.', sortOrder: 1 },
      { name: 'Производственная практика: проектно-технологическая практика',                  correctForm: 'производственной практики: проектно-технологической практики',                  supervisorName: 'Коцубинский В. П.', sortOrder: 2 },
      { name: 'Производственная практика: преддипломная практика',                             correctForm: 'производственной практики: преддипломной практики',                             supervisorName: 'Хабибулина Н. Ю.', sortOrder: 3 },
    ],
  },
  {
    code: '38.03.04',
    shortName: 'ГМУ',
    kafName: 'Автоматизации обработки данных (АОИ)',
    headTitle: 'Зав. кафедрой',
    headNameFull: 'Сидоров Александр Александрович',
    kafAddress: 'г. Томск',
    practiceTypes: [
      { name: 'Учебная практика: ознакомительная практика',                              correctForm: 'учебной практики: ознакомительной практики',                              supervisorName: 'Малаховская Е. К.',  sortOrder: 1 },
      { name: 'Производственная практика: организационно-управленческая практика',       correctForm: 'производственной практики: организационно-управленческой практики',       supervisorName: 'Малаховская Е. К.',  sortOrder: 2 },
      { name: 'Производственная практика: преддипломная практика',                       correctForm: 'производственной практики: преддипломной практики',                       supervisorName: 'Малаховская Е. К.',  sortOrder: 3 },
    ],
  },
  {
    code: '38.03.01 (БУ)',
    shortName: 'БухУчет',
    kafName: 'Экономики',
    headTitle: 'Зав. кафедрой',
    headNameFull: 'Цибульникова Вера Юрьевна',
    kafAddress: 'г. Томск, ул. Красноармейская, 146',
    practiceTypes: [
      { name: 'Учебная практика: ознакомительная практика',              correctForm: 'учебной практики: ознакомительной практики',              supervisorName: 'Цибульникова В. Ю.',   sortOrder: 1 },
      { name: 'Производственная практика: технологическая практика',     correctForm: 'производственной практики: технологической практики',     supervisorName: 'Васильковская Н. Б.', sortOrder: 2 },
      { name: 'Производственная практика: преддипломная практика',       correctForm: 'производственной практики: преддипломной практики',       supervisorName: 'Коновалов В. В.',     sortOrder: 3 },
    ],
  },
  {
    code: '38.03.01 (ФиКР)',
    shortName: 'Финансы и кредит',
    kafName: 'Экономики',
    headTitle: 'Зав. кафедрой',
    headNameFull: 'Цибульникова Вера Юрьевна',
    kafAddress: 'г. Томск, ул. Красноармейская, 146',
    practiceTypes: [
      { name: 'Учебная практика: ознакомительная практика',              correctForm: 'учебной практики: ознакомительной практики',              supervisorName: 'Цибульникова В. Ю.',   sortOrder: 1 },
      { name: 'Производственная практика: технологическая практика',     correctForm: 'производственной практики: технологической практики',     supervisorName: 'Васильковская Н. Б.', sortOrder: 2 },
      { name: 'Производственная практика: преддипломная практика',       correctForm: 'производственной практики: преддипломной практики',       supervisorName: 'Коновалов В. В.',     sortOrder: 3 },
    ],
  },
  {
    code: '11.03.01',
    shortName: 'РСС',
    kafName: 'Радиоэлектроники и систем связи (РСС)',
    headTitle: 'Зав. кафедрой',
    headNameFull: 'Фатеев Александр Васильевич',
    kafAddress: 'г. Томск',
    practiceTypes: [
      { name: 'Учебная практика: ознакомительная практика',                           correctForm: 'учебной практики: ознакомительной практики',                           supervisorName: 'Рябцунов С. Ю.',   sortOrder: 1 },
      { name: 'Производственная практика: проектно-технологическая практика',         correctForm: 'производственной практики: проектно-технологической практики',         supervisorName: 'Карлова Г. Ф.',    sortOrder: 2 },
      { name: 'Производственная практика: технологическая практика',                  correctForm: 'производственной практики: технологической практики',                  supervisorName: 'Карлова Г. Ф.',    sortOrder: 3 },
      { name: 'Производственная практика: преддипломная практика',                    correctForm: 'производственной практики: преддипломной практики',                    supervisorName: 'Карлова Г. Ф.',    sortOrder: 4 },
    ],
  },
  {
    code: '11.03.02',
    shortName: 'ТОР',
    kafName: 'Телекоммуникаций и основ радиотехники (ТОР)',
    headTitle: 'Зав. кафедрой',
    headNameFull: 'Рогожников Евгений Владимирович',
    kafAddress: 'г. Томск',
    practiceTypes: [
      { name: 'Учебная практика: ознакомительная практика',                           correctForm: 'учебной практики: ознакомительной практики',                           supervisorName: 'Ким А. Ю.',        sortOrder: 1 },
      { name: 'Производственная практика: проектно-технологическая практика',         correctForm: 'производственной практики: проектно-технологической практики',         supervisorName: 'Пуговкин А. В.',   sortOrder: 2 },
      { name: 'Производственная практика: технологическая практика',                  correctForm: 'производственной практики: технологической практики',                  supervisorName: 'Пуговкин А. В.',   sortOrder: 3 },
      { name: 'Производственная практика: преддипломная практика',                    correctForm: 'производственной практики: преддипломной практики',                    supervisorName: 'Пуговкин А. В.',   sortOrder: 4 },
    ],
  },
  {
    code: '09.03.01 (Пр)',
    shortName: 'КСУП (Пр)',
    kafName: 'Компьютерных систем в управлении и проектировании (КСУП)',
    headTitle: 'Зав. кафедрой',
    headNameFull: 'Шурыгин Юрий Александрович',
    kafAddress: 'г. Томск',
    practiceTypes: [
      { name: 'Учебная практика: ознакомительная практика',                           correctForm: 'учебной практики: ознакомительной практики',                           supervisorName: 'Коцубинский В. П.', sortOrder: 1 },
      { name: 'Производственная практика: научно-исследовательская работа',           correctForm: 'производственной практики: научно-исследовательской работы',           supervisorName: 'Коцубинский В. П.', sortOrder: 2 },
      { name: 'Производственная практика: проектно-технологическая практика',         correctForm: 'производственной практики: проектно-технологической практики',         supervisorName: 'Коцубинский В. П.', sortOrder: 3 },
      { name: 'Производственная практика: преддипломная практика',                    correctForm: 'производственной практики: преддипломной практики',                    supervisorName: 'Черкашин М. В.',    sortOrder: 4 },
    ],
  },
  {
    code: '09.03.03',
    shortName: 'АСУ (09.03.03)',
    kafName: 'Автоматизированных систем управления (АСУ)',
    headTitle: 'Заведующему кафедрой',
    headNameFull: 'Романенко Виктор Владимирович',
    kafAddress: '634045, г. Томск, ул. Вершинина, д. 74, кафедра АСУ',
    practiceTypes: [
      { name: 'Учебная практика: ознакомительная практика',                           correctForm: 'учебной практики: ознакомительной практики',                           supervisorName: 'Григорьева М. В.',  sortOrder: 1 },
      { name: 'Производственная практика: научно-исследовательская работа',           correctForm: 'производственной практики: научно-исследовательской работы',           supervisorName: 'Григорьева М. В.',  sortOrder: 2 },
      { name: 'Производственная практика: преддипломная практика',                    correctForm: 'производственной практики: преддипломной практики',                    supervisorName: 'Григорьева М. В.',  sortOrder: 3 },
    ],
  },
  {
    code: '09.03.01',
    shortName: 'АСУ (09.03.01)',
    kafName: 'Автоматизированных систем управления (АСУ)',
    headTitle: 'Заведующему кафедрой',
    headNameFull: 'Романенко Виктор Владимирович',
    kafAddress: '634045, г. Томск, ул. Вершинина, д. 74, кафедра АСУ',
    practiceTypes: [
      { name: 'Учебная практика: получение первичных навыков научно-исследовательской работы', correctForm: 'учебной практики "Получение первичных навыков научно-исследовательской работы"', supervisorName: 'Романенко В. В.', sortOrder: 1 },
      { name: 'Производственная практика: научно-исследовательская работа',                   correctForm: 'производственной практики "Научно-исследовательская работа"',                   supervisorName: 'Романенко В. В.', sortOrder: 2 },
      { name: 'Производственная практика: преддипломная практика',                            correctForm: 'производственной практики "Преддипломная практика"',                            supervisorName: 'Романенко В. В.', sortOrder: 3 },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Очистка перед заполнением
  await prisma.funnelEvent.deleteMany();
  await prisma.application.deleteMany();
  await prisma.practiceType.deleteMany();
  await prisma.direction.deleteMany();
  await prisma.admin.deleteMany();
  console.log('🗑️  Tables cleared');

  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { username: process.env.ADMIN_USERNAME || 'admin' },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME || 'admin',
      passwordHash,
    },
  });
  console.log('✅ Admin created');

  for (const dir of INITIAL_DATA) {
    const { practiceTypes, ...dirData } = dir;
    let direction = await prisma.direction.findFirst({
      where: { shortName: dirData.shortName },
    });
    if (direction) {
      direction = await prisma.direction.update({
        where: { id: direction.id },
        data: dirData,
      });
    } else {
      direction = await prisma.direction.create({ data: dirData });
    }

    for (const pt of practiceTypes) {
      const existing = await prisma.practiceType.findFirst({
        where: { directionId: direction.id, name: pt.name },
      });
      if (!existing) {
        await prisma.practiceType.create({
          data: { ...pt, directionId: direction.id },
        });
      }
    }
    console.log(`✅ Direction "${dirData.shortName}" seeded`);
  }

  await seedTestData();
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

async function seedTestData() {
  console.log('🧪 Seeding test data...');

  // Получаем созданные направления и практики
  const directions = await prisma.direction.findMany({
    include: { practiceTypes: true },
  });

  if (directions.length === 0) {
    console.log('⚠️  No directions found, skipping test data');
    return;
  }

  const students = [
    { fio: 'Иванов Иван Иванович',     group: 'з-422П12-3' },
    { fio: 'Петрова Мария Сергеевна',  group: 'з-411П11-1' },
    { fio: 'Смирнов Алексей Андреевич',group: 'з-431П13-2' },
    { fio: 'Козлова Анна Дмитриевна',  group: 'з-422П12-1' },
    { fio: 'Новиков Дмитрий Олегович', group: 'з-411П11-2' },
    { fio: 'Соколова Екатерина Игоревна', group: 'з-431П13-1' },
    { fio: 'Морозов Сергей Павлович',  group: 'з-422П12-2' },
    { fio: 'Волкова Юлия Николаевна',  group: 'з-411П11-3' },
    { fio: 'Лебедев Артём Викторович', group: 'з-431П13-3' },
    { fio: 'Семёнова Ольга Романовна', group: 'з-422П12-4' },
    { fio: 'Егоров Никита Сергеевич',  group: 'з-411П11-4' },
    { fio: 'Фёдорова Дарья Алексеевна',group: 'з-431П13-4' },
  ];

  const places = ['кафедра', 'кафедра', 'кафедра', 'предприятие'];
  const enterprises = [
    { name: 'ООО "Томские технологии"',    address: 'г. Томск, ул. Ленина, 45' },
    { name: 'АО "СибирьСофт"',             address: 'г. Томск, ул. Нахимова, 12' },
    { name: 'ООО "ИТ-решения"',            address: 'г. Томск, пр. Кирова, 78' },
  ];

  // Генерируем даты за последние 6 месяцев
  function randomDate(monthsAgo) {
    const d = new Date();
    d.setMonth(d.getMonth() - monthsAgo);
    d.setDate(Math.floor(Math.random() * 20) + 1);
    return d;
  }

  function fmt(d) {
    return d.toISOString().slice(0, 10);
  }

  let appCount = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const dir = directions[i % directions.length];
    if (!dir.practiceTypes.length) continue;

    const pt = dir.practiceTypes[0];
    const place = places[i % places.length];
    const ent = enterprises[i % enterprises.length];
    const genDate = randomDate(Math.floor(i / 2));
    const startDate = new Date(genDate);
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 28);

    await prisma.application.create({
      data: {
        directionId:       dir.id,
        practiceTypeId:    pt.id,
        place,
        enterpriseName:    place === 'предприятие' ? ent.name    : '',
        enterpriseAddress: place === 'предприятие' ? ent.address : '',
        dateStart:         fmt(startDate),
        dateEnd:           fmt(endDate),
        studentGroup:      student.group,
        studentFio:        student.fio,
        generatedAt:       genDate,
      },
    });
    appCount++;

    // Некоторые студенты подают на 2 практики
    if (i % 3 === 0 && dir.practiceTypes.length > 1) {
      const pt2 = dir.practiceTypes[1];
      const start2 = new Date(endDate);
      start2.setDate(start2.getDate() + 7);
      const end2 = new Date(start2);
      end2.setDate(end2.getDate() + 28);

      await prisma.application.create({
        data: {
          directionId:       dir.id,
          practiceTypeId:    pt2.id,
          place,
          enterpriseName:    place === 'предприятие' ? ent.name    : '',
          enterpriseAddress: place === 'предприятие' ? ent.address : '',
          dateStart:         fmt(start2),
          dateEnd:           fmt(end2),
          studentGroup:      student.group,
          studentFio:        student.fio,
          generatedAt:       genDate,
        },
      });
      appCount++;
    }
  }

  console.log(`✅ Created ${appCount} test applications`);

  // Воронка: имитируем сессии с разной глубиной заполнения
  const sessions = [
    { steps: 6 }, { steps: 6 }, { steps: 6 }, { steps: 6 }, { steps: 6 },
    { steps: 6 }, { steps: 6 }, { steps: 6 }, { steps: 6 }, { steps: 6 },
    { steps: 5 }, { steps: 5 }, { steps: 5 }, { steps: 5 },
    { steps: 4 }, { steps: 4 }, { steps: 4 },
    { steps: 3 }, { steps: 3 },
    { steps: 2 },
    { steps: 1 }, { steps: 1 }, { steps: 1 },
  ];

  const stepNames = ['direction', 'practice', 'place', 'dates', 'student', 'fioFormat'];
  const dir0 = directions[0];

  for (const session of sessions) {
    const sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    for (let s = 1; s <= session.steps; s++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() - daysAgo);

      await prisma.funnelEvent.create({
        data: {
          sessionId,
          step:        s,
          stepName:    stepNames[s - 1],
          directionId: s >= 1 ? dir0.id : null,
          createdAt:   eventDate,
        },
      });
    }
  }

  console.log(`✅ Created ${sessions.length} funnel sessions`);
}