# Full-Stack CRUD Application

A web app where users sign up, log in, and create, edit, search, and delete their own posts. React frontend, Node/Express REST API, MongoDB for storage.

**Stack:** Node.js, Express, MongoDB (Mongoose), React, REST API

## Features

- Register / log in with JWT auth (passwords hashed with bcrypt)
- Create, read, update, and delete posts, with tags
- Search, pagination, and tag filtering on the list endpoint
- Users can only see and change their own posts
- Input validation on every write (express-validator) with readable error messages
- API documentation with Swagger UI at `/api/docs`
- Responsive React UI that works on phones

## Project layout

```
server/   Express API
  src/models/       Mongoose schemas (User, Post)
  src/routes/       auth and posts endpoints
  src/middleware/   JWT check, validation helper
  src/docs/         OpenAPI spec
client/   React app (Vite)
```

## Running locally

You need Node 18+ and a MongoDB instance (local or Atlas).

```bash
# API
cd server
cp .env.example .env     # set MONGO_URI and JWT_SECRET
npm install
npm run dev              # http://localhost:4000

# Frontend, in another terminal
cd client
npm install
npm run dev              # http://localhost:5173
```

Vite proxies `/api` to the server, so no extra config is needed in development.

## API

Interactive docs: http://localhost:4000/api/docs

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/auth/register` | `name`, `email`, `password` (8+ chars) |
| POST | `/api/auth/login` | returns `token` and `user` |
| GET | `/api/auth/me` | current user |
| GET | `/api/posts` | `?page=&limit=&search=&tag=` |
| POST | `/api/posts` | `title`, `body`, `tags[]` |
| GET | `/api/posts/:id` | |
| PUT | `/api/posts/:id` | |
| DELETE | `/api/posts/:id` | |

All `/api/posts` routes need `Authorization: Bearer <token>`.

Example:

```bash
curl -X POST localhost:4000/api/posts \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Hello","body":"First post","tags":["intro"]}'
```

## Security notes

- `helmet` headers, CORS limited to `CLIENT_ORIGIN`, request body size cap
- Rate limiting on the auth routes
- Every post query is filtered by the logged-in user's id, so ids from other accounts return 404
