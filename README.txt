BUSFOTO v9 — SECURE RELEASE

Усиленная релизная версия BusFoto: Helmet/CSP, rate limiting, CSRF, secure cookies, bcrypt, роли user/admin, модерация, SQLite WAL, загрузка JPG/PNG/WEBP, health endpoint и адаптивный интерфейс.

ПЕРЕД ПУБЛИКАЦИЕЙ:
- ADMIN_PASSWORD — уникальный длинный пароль.
- SESSION_SECRET — случайная строка 32+ символа.
- Использовать HTTPS.
- Не публиковать .env и секреты.
- Подключить persistent storage для DATA_DIR.
- Делать резервные копии базы и фотографий.
- Регулярно обновлять Node.js и зависимости.

Запуск:
npm install
npm start
