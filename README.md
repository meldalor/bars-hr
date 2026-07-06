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

```bash
# 1. База данных и pgAdmin
docker compose up -d

# 2. API
cd backend/BarsHr.Api
dotnet run
```

| Что | Адрес |
|---|---|
| Swagger (API) | http://localhost:5080/swagger |
| pgAdmin | http://localhost:5050 (логин `admin@bars.ru`, пароль `admin`) |
| PostgreSQL | localhost:5432, БД/юзер `barshr`, пароль `barshr_dev` |

Подключение сервера в pgAdmin: host `postgres`, port `5432`.


## Как запустить

Требования: Docker Desktop, .NET 10 SDK.

```bash
# 1. База данных и pgAdmin
docker compose up -d

# 2. API
cd backend/BarsHr.Api
dotnet run
```