# Заявление на практику — Fullstack App

React + Node.js + SQLite (Prisma). Форма для студентов на `/`, панель администратора на `/admin`.

---

## Структура проекта

```
practice-app/
├── server/          # Node.js + Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── index.js
│       ├── middleware/auth.js
│       └── routes/
│           ├── auth.js
│           ├── directions.js
│           ├── applications.js
│           ├── funnel.js
│           ├── stats.js
│           └── generate.js
└── client/          # React + Vite
    └── src/
        ├── pages/
        │   ├── FormPage.jsx          # Публичная форма
        │   └── admin/
        │       ├── LoginPage.jsx
        │       ├── AdminLayout.jsx
        │       ├── Dashboard.jsx     # Статистика + воронка
        │       ├── Directions.jsx    # CRUD направлений
        │       ├── Applications.jsx  # Список заявлений
        │       └── Settings.jsx      # Смена пароля
        ├── hooks/useAuth.js
        └── api/client.js
```

---

## Локальный запуск

```bash
# 1. Клонировать и установить зависимости
git clone ...
cd practice-app
npm run install:all

# 2. Настроить окружение сервера
cd server
cp .env.example .env
# Отредактировать .env: JWT_SECRET, ADMIN_PASSWORD

# 3. Создать БД и заполнить начальными данными
npx prisma db push
node prisma/seed.js

# 4. Запустить в режиме разработки (из корня)
cd ..
npm run dev
# Форма:   http://localhost:5173
# Бэкенд:  http://localhost:3001
# Админка: http://localhost:5173/admin
```

---

## Деплой на VPS (Ubuntu/Debian)

### 1. Установить Node.js и nginx

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2
```

### 2. Загрузить проект

```bash
cd /var/www
git clone <your-repo> practice-app
cd practice-app
npm run install:all
```

### 3. Настроить окружение

```bash
cd server
cp .env.example .env
nano .env
# Задать: DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD, NODE_ENV=production
# CLIENT_URL=https://your-domain.com
```

### 4. Собрать фронтенд и инициализировать БД

```bash
# Из корня проекта:
npm run build           # собирает client/dist

cd server
npx prisma db push
node prisma/seed.js
```

### 5. Запустить сервер через PM2

```bash
cd /var/www/practice-app/server
pm2 start src/index.js --name practice-app
pm2 save
pm2 startup            # чтобы автостарт при перезагрузке
```

### 6. Настроить nginx

```nginx
# /etc/nginx/sites-available/practice-app
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/practice-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Управление

| Действие | Команда |
|---|---|
| Перезапуск сервера | `pm2 restart practice-app` |
| Логи | `pm2 logs practice-app` |
| Обновить код | `git pull && npm run build && pm2 restart practice-app` |
| Бэкап БД | `cp server/prisma/dev.db backups/$(date +%Y%m%d).db` |

---

## Переменные окружения (server/.env)

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | `file:./dev.db` — путь к SQLite |
| `JWT_SECRET` | Секретная строка для JWT (длинная, случайная) |
| `ADMIN_USERNAME` | Логин администратора (default: admin) |
| `ADMIN_PASSWORD` | Используется только при seed |
| `PORT` | Порт сервера (default: 3001) |
| `CLIENT_URL` | URL фронтенда (для CORS) |
| `NODE_ENV` | `production` на сервере |
