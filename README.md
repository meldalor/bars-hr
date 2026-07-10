# БАРС Груп · Платформа для технических собеседований

Сайт-платформа для HR-специалиста: структурирование данных о кандидатах —
оценка компетенций, комментарии, информация о грядущих и прошедших собеседованиях.

## Команда

| Участник | Роль |
|---|---|
| Закиева Алина | Team Lead, Frontend |
| Галиуллина Рената | Backend |
| Глебов Семён | Frontend |
| Карпов Родион | Backend |
| Лебедзе Анвар | Backend |
| Мартынова Милена | Frontend |

## Стек

- **Backend:** .NET 10 (C#), ASP.NET Core Web API, Entity Framework Core, PostgreSQL 16, Docker
- **Frontend:** JavaScript + React + Vite
- **Проектирование:** PlantUML, Figma

## Как запустить

Требование: только Docker Desktop. Весь проект (Postgres + API + фронтенд) поднимается одной командой:

```bash
docker compose up -d
```

При первом запуске собираются образы, автоматически применяются миграции и БД наполняется
демо-данными (сид). Открывать приложение — по адресу http://localhost:8080.

Перезалить данные заново (пересид) — с пересозданием тома БД:

```bash
docker compose down -v
docker compose up -d --build
```

| Что | Адрес |
|---|---|
| Веб-приложение | http://localhost:8080 |
| Swagger (API) | http://localhost:5080/swagger |
| pgAdmin | http://localhost:5050 (логин `admin@bars.ru`, пароль `admin`) |
| PostgreSQL | localhost:5432, БД/юзер `barshr`, пароль `barshr_dev` |

Подключение сервера в pgAdmin: host `postgres`, port `5432`.

Демо-логины: `admin` / `Admin123!` · `hr` / `Hr123456!` · `decision` / `Decision123!`.

### Локальная разработка без Docker (по желанию)

```bash
docker compose up -d postgres      # только БД
cd backend/BarsHr.Api && dotnet run --launch-profile http   # API :5080, миграции применяются сами
cd frontend && npm install && npm run dev                   # фронт :5173
```