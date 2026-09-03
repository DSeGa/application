const request = require('supertest');
const app = require('./testApp');

let token = '';
let directionId = 0;
let practiceTypeId1 = 0;
let practiceTypeId2 = 0;

// ─── Auth ─────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  test('успешный вход возвращает токен', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'testpassword' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('неверный пароль — 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test('несуществующий пользователь — 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ghost', password: 'any' });
    expect(res.status).toBe(401);
  });

  test('пустые поля — 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

// ─── Directions (public) ──────────────────────────────────────────────────────
describe('GET /api/directions', () => {
  test('возвращает список активных направлений с практиками', async () => {
    const res = await request(app).get('/api/directions');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const dir = res.body[0];
    expect(dir).toHaveProperty('id');
    expect(dir).toHaveProperty('practiceTypes');
    expect(Array.isArray(dir.practiceTypes)).toBe(true);
    expect(dir.practiceTypes.length).toBeGreaterThanOrEqual(2);

    // Практики отсортированы по sortOrder
    const orders = dir.practiceTypes.map(p => p.sortOrder);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));

    directionId    = dir.id;
    practiceTypeId1 = dir.practiceTypes[0].id;
    practiceTypeId2 = dir.practiceTypes[1].id;
  });

  test('не содержит неактивных направлений', async () => {
    const res = await request(app).get('/api/directions');
    res.body.forEach(d => expect(d.isActive).toBe(true));
  });
});

// ─── Directions (admin CRUD) ──────────────────────────────────────────────────
describe('Admin: directions CRUD', () => {
  let newDirId;

  test('GET /api/directions/all — без токена — 401', async () => {
    const res = await request(app).get('/api/directions/all');
    expect(res.status).toBe(401);
  });

  test('GET /api/directions/all — с токеном — возвращает все', async () => {
    const res = await request(app)
      .get('/api/directions/all')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST — создаёт направление', async () => {
    const res = await request(app)
      .post('/api/directions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: '09.03.01',
        shortName: 'ТЕСТовое',
        kafName: 'Тестовая кафедра',
        headTitle: 'Заведующему кафедрой',
        headNameFull: 'Тестов Тест Тестович',
        kafAddress: 'г. Томск',
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    newDirId = res.body.id;
  });

  test('POST — без токена — 401', async () => {
    const res = await request(app)
      .post('/api/directions')
      .send({ code: '00.00.00', shortName: 'X' });
    expect(res.status).toBe(401);
  });

  test('PUT — обновляет направление', async () => {
    const res = await request(app)
      .put(`/api/directions/${newDirId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: '09.03.01', shortName: 'ТЕСТовое-v2',
        kafName: 'Тестовая кафедра',
        headTitle: 'Заведующему', headNameFull: 'Тестов Тест Тестович',
        kafAddress: '', isActive: true,
      });
    expect(res.status).toBe(200);
    expect(res.body.shortName).toBe('ТЕСТовое-v2');
  });

  test('DELETE — скрывает направление', async () => {
    const res = await request(app)
      .delete(`/api/directions/${newDirId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const pub = await request(app).get('/api/directions');
    const ids = pub.body.map(d => d.id);
    expect(ids).not.toContain(newDirId);
  });
});

// ─── Practice types CRUD ──────────────────────────────────────────────────────
describe('Admin: practice types CRUD', () => {
  let ptId;

  test('POST — создаёт вид практики', async () => {
    const res = await request(app)
      .post(`/api/directions/${directionId}/practice-types`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Тестовая практика',
        correctForm: 'тестовой практики',
        supervisorName: 'Тестов Тест Тестович',
        sortOrder: 99,
      });
    expect(res.status).toBe(201);
    ptId = res.body.id;
  });

  test('PUT — обновляет вид практики', async () => {
    const res = await request(app)
      .put(`/api/directions/practice-types/${ptId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Тестовая практика v2',
        correctForm: 'тестовой практики v2',
        supervisorName: 'Тестов Тест Тестович',
        sortOrder: 99, isActive: true,
      });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Тестовая практика v2');
  });

  test('DELETE — скрывает вид практики', async () => {
    const res = await request(app)
      .delete(`/api/directions/practice-types/${ptId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

// ─── Funnel ───────────────────────────────────────────────────────────────────
describe('POST /api/funnel/event', () => {
  const sessionId = 'test-session-' + Date.now();

  test.each([1, 2, 3, 4, 5, 6])('логирует шаг %i', async (step) => {
    const res = await request(app)
      .post('/api/funnel/event')
      .send({ sessionId, step, directionId });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('неверный шаг — 400', async () => {
    const res = await request(app)
      .post('/api/funnel/event')
      .send({ sessionId, step: 99 });
    expect(res.status).toBe(400);
  });

  test('без sessionId — 400', async () => {
    const res = await request(app)
      .post('/api/funnel/event')
      .send({ step: 1 });
    expect(res.status).toBe(400);
  });
});

// ─── Stats ────────────────────────────────────────────────────────────────────
describe('Admin: stats', () => {
  test('GET /api/stats/overview — без токена — 401', async () => {
    const res = await request(app).get('/api/stats/overview');
    expect(res.status).toBe(401);
  });

  test('GET /api/stats/overview — структура ответа', async () => {
    const res = await request(app)
      .get('/api/stats/overview')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.totals).toHaveProperty('all');
    expect(res.body.totals).toHaveProperty('month');
    expect(res.body.totals).toHaveProperty('year');
    expect(Array.isArray(res.body.byDirection)).toBe(true);
    expect(Array.isArray(res.body.byPlace)).toBe(true);
  });

  test('GET /api/stats/funnel — 7 элементов (6 шагов + генерация)', async () => {
    const res = await request(app)
      .get('/api/stats/funnel')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(7);
    res.body.forEach(step => {
      expect(step).toHaveProperty('step');
      expect(step).toHaveProperty('name');
      expect(step).toHaveProperty('count');
      expect(step).toHaveProperty('pct');
    });
  });

  test('GET /api/stats/monthly — 12 месяцев', async () => {
    const res = await request(app)
      .get('/api/stats/monthly?year=2025')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(12);
    res.body.forEach(m => {
      expect(m).toHaveProperty('month');
      expect(m).toHaveProperty('label');
      expect(m).toHaveProperty('count');
    });
  });
});

// ─── Applications ─────────────────────────────────────────────────────────────
describe('GET /api/applications', () => {
  test('без токена — 401', async () => {
    const res = await request(app).get('/api/applications');
    expect(res.status).toBe(401);
  });

  test('структура с пагинацией', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  test('фильтр по направлению', async () => {
    const res = await request(app)
      .get(`/api/applications?directionId=${directionId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('фильтр по дате from/to', async () => {
    const res = await request(app)
      .get('/api/applications?from=2020-01-01&to=2030-12-31')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
  });
});

// ─── Generate — валидация (без реального docx) ────────────────────────────────
describe('POST /api/generate — валидация запроса', () => {
  // Хелпер для отправки generate-запроса
  const makeBody = (overrides = {}) => ({
    directionId,
    practiceTypes: [
      { practiceTypeId: practiceTypeId1, dateStart: '2025-06-01', dateEnd: '2025-06-30' },
    ],
    place: 'кафедра',
    studentGroup: 'з-422П12-3',
    studentFio: 'Иванов Иван Иванович',
    fioFormat: 'short',
    ...overrides,
  });

  test('пустое тело — 400', async () => {
    const res = await request(app).post('/api/generate').send({});
    expect(res.status).toBe(400);
  });

  test('нет practiceTypes — 400', async () => {
    const res = await request(app)
      .post('/api/generate')
      .send(makeBody({ practiceTypes: [] }));
    expect(res.status).toBe(400);
  });

  test('более 3 практик — 400', async () => {
    const res = await request(app)
      .post('/api/generate')
      .send(makeBody({
        practiceTypes: [
          { practiceTypeId: practiceTypeId1, dateStart: '2025-06-01', dateEnd: '2025-06-30' },
          { practiceTypeId: practiceTypeId1, dateStart: '2025-07-01', dateEnd: '2025-07-30' },
          { practiceTypeId: practiceTypeId1, dateStart: '2025-08-01', dateEnd: '2025-08-30' },
          { practiceTypeId: practiceTypeId1, dateStart: '2025-09-01', dateEnd: '2025-09-30' },
        ],
      }));
    expect(res.status).toBe(400);
  });

  test('предприятие без данных — 400', async () => {
    const res = await request(app)
      .post('/api/generate')
      .send(makeBody({ place: 'предприятие', enterpriseName: '', enterpriseAddress: '' }));
    expect(res.status).toBe(400);
  });

  test('нет дат у практики — 400', async () => {
    const res = await request(app)
      .post('/api/generate')
      .send(makeBody({
        practiceTypes: [{ practiceTypeId: practiceTypeId1, dateStart: '', dateEnd: '' }],
      }));
    expect(res.status).toBe(400);
  });

  test('несуществующее направление — 404', async () => {
    const res = await request(app)
      .post('/api/generate')
      .send(makeBody({ directionId: 99999 }));
    expect(res.status).toBe(404);
  });

  test('несуществующий вид практики — 404', async () => {
    const res = await request(app)
      .post('/api/generate')
      .send(makeBody({
        practiceTypes: [{ practiceTypeId: 99999, dateStart: '2025-06-01', dateEnd: '2025-06-30' }],
      }));
    expect(res.status).toBe(404);
  });

  test('2 практики + предприятие — ищет 2_template_org.docx', async () => {
    const res = await request(app)
      .post('/api/generate')
      .send(makeBody({
        place: 'предприятие',
        enterpriseName: 'ООО Тест',
        enterpriseAddress: 'г. Томск',
        practiceTypes: [
          { practiceTypeId: practiceTypeId1, dateStart: '2025-06-01', dateEnd: '2025-06-30' },
          { practiceTypeId: practiceTypeId2, dateStart: '2025-07-01', dateEnd: '2025-07-31' },
        ],
      }));
    expect([200, 500]).toContain(res.status);
    if (res.status === 500) {
      expect(res.body.error).toMatch(/2_template_org/);
    }
  });
});
