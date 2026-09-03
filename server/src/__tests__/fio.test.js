const { declineFio, applyFioFormat, formatDate } = require('../utils/fio');

// ─── declineFio ───────────────────────────────────────────────────────────────
describe('declineFio', () => {
  describe('genitive (Р.п. — от кого)', () => {
    test('мужское полное ФИО', () => {
      expect(declineFio('Иванов Иван Иванович', 'genitive')).toBe('Иванова Ивана Ивановича');
    });
    test('женское полное ФИО', () => {
      expect(declineFio('Петрова Мария Сергеевна', 'genitive')).toBe('Петровой Марии Сергеевны');
    });
    test('без отчества', () => {
      expect(declineFio('Сидоров Алексей', 'genitive')).toBe('Сидорова Алексея');
    });
    test('пустая строка — возвращает как есть', () => {
      expect(declineFio('', 'genitive')).toBe('');
    });
    test('null — возвращает null', () => {
      expect(declineFio(null, 'genitive')).toBe(null);
    });
    test('одно слово — возвращает как есть', () => {
      expect(declineFio('Иванов', 'genitive')).toBe('Иванов');
    });
  });

  describe('dative (Д.п. — кому)', () => {
    test('мужское полное ФИО', () => {
      expect(declineFio('Иванов Иван Иванович', 'dative')).toBe('Иванову Ивану Ивановичу');
    });
    test('женское полное ФИО', () => {
      expect(declineFio('Петрова Мария Сергеевна', 'dative')).toBe('Петровой Марии Сергеевне');
    });
  });

  describe('граничные случаи', () => {
    test('лишние пробелы обрезаются', () => {
      expect(declineFio('  Иванов  Иван  Иванович  ', 'genitive')).toBe('Иванова Ивана Ивановича');
    });
    test('при ошибке возвращает строку', () => {
      const result = declineFio('123 456 789', 'genitive');
      expect(typeof result).toBe('string');
    });
  });
});

// ─── applyFioFormat ───────────────────────────────────────────────────────────
describe('applyFioFormat', () => {
  const full = 'Иванов Иван Иванович';

  test('full — Фамилия Имя Отчество', () => {
    expect(applyFioFormat(full, 'full')).toBe('Иванов Иван Иванович');
  });
  test('short — Фамилия И.О.', () => {
    expect(applyFioFormat(full, 'short')).toBe('Иванов И.И.');
  });
  test('firstLast — Имя Отчество Фамилия', () => {
    expect(applyFioFormat(full, 'firstLast')).toBe('Иван Иванович Иванов');
  });
  test('initialsLast — И.О. Фамилия', () => {
    expect(applyFioFormat(full, 'initialsLast')).toBe('И. И. Иванов');
  });
  test('неизвестный формат — как full', () => {
    expect(applyFioFormat(full, 'unknown')).toBe('Иванов Иван Иванович');
  });
  test('без отчества — short', () => {
    expect(applyFioFormat('Иванов Иван', 'short')).toBe('Иванов И.');
  });
  test('без отчества — initialsLast', () => {
    expect(applyFioFormat('Иванов Иван', 'initialsLast')).toBe('И. Иванов');
  });
  test('пустая строка — возвращает как есть', () => {
    expect(applyFioFormat('', 'short')).toBe('');
  });
  test('null — возвращает null', () => {
    expect(applyFioFormat(null, 'short')).toBe(null);
  });
  test('склонённое ФИО + short', () => {
    const declined = declineFio('Иванов Иван Иванович', 'genitive');
    expect(applyFioFormat(declined, 'short')).toBe('Иванова И.И.');
  });
  test('склонённое женское ФИО + short', () => {
    const declined = declineFio('Петрова Мария Сергеевна', 'dative');
    expect(applyFioFormat(declined, 'short')).toBe('Петровой М.С.');
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────
describe('formatDate', () => {
  test('однозначный день — дополняется нулём', () => {
    expect(formatDate('2025-06-01')).toBe('«01» июня 2025');
  });
  test('двузначный день — без изменений', () => {
    expect(formatDate('2025-06-15')).toBe('«15» июня 2025');
  });
  test('январь', () => {
    expect(formatDate('2025-01-01')).toBe('«01» января 2025');
  });
  test('декабрь', () => {
    expect(formatDate('2024-12-31')).toBe('«31» декабря 2024');
  });
  test('день 5 → «05»', () => {
    expect(formatDate('2025-03-05')).toBe('«05» марта 2025');
  });
  test('пустая строка — возвращает пустую строку', () => {
    expect(formatDate('')).toBe('');
  });
  test('null — возвращает пустую строку', () => {
    expect(formatDate(null)).toBe('');
  });
  test('содержит кавычки', () => {
    expect(formatDate('2025-06-15')).toMatch(/«\d{2}»/);
  });
});
