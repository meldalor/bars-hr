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

Требования: Docker Desktop, .NET 10 SDK, Node.js. Порядок важен: сначала БД, потом API, потом фронт.

```bash
# 1. База данных (Postgres + pgAdmin)
docker compose up -d

# 2. API — порт 5080
cd backend/BarsHr.Api
dotnet ef database update          # накатить миграции (первый раз / после сброса)
dotnet run --launch-profile http   # при старте сидит демо-данные

# 3. Фронтенд — порт 5173
cd frontend
npm install                        # первый раз
npm run dev
```

Схема БД накатывается только миграциями (в `Program.cs` нет `Migrate()`). Сбросить начисто: `dotnet ef database drop -f && dotnet ef database update`, затем перезапустить API. Если нет `dotnet ef`: `dotnet tool install --global dotnet-ef`.

| Что | Адрес |
|---|---|
| Веб-приложение | http://localhost:5173 |
| Swagger (API) | http://localhost:5080/swagger |
| pgAdmin | http://localhost:5050 (логин `admin@bars.ru`, пароль `admin`) |
| PostgreSQL | localhost:5432, БД/юзер `barshr`, пароль `barshr_dev` |

Подключение сервера в pgAdmin: host `postgres`, port `5432`.

Демо-логины: `admin` / `Admin123!` · `hr` / `Hr123456!` · `decision` / `Decision123!`.