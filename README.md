# Task API

A small in-memory CRUD API for managing a to-do list, built with Node.js and Express.
Data lives only in memory — it resets whenever the server restarts.

## How to run

```
npm install
npm start
```

The server starts on **http://localhost:3000**.
Interactive docs (Swagger UI): **http://localhost:3000/docs**

## Endpoints

| Method | Path         | Description                          | Success | Errors    |
|--------|--------------|---------------------------------------|---------|-----------|
| GET    | `/`          | API info                              | 200     | —         |
| GET    | `/health`    | Health check                          | 200     | —         |
| GET    | `/tasks`     | List all tasks                        | 200     | —         |
| GET    | `/tasks/:id` | Get a single task                     | 200     | 404       |
| POST   | `/tasks`     | Create a task (`{ "title": "..." }`)  | 201     | 400       |
| PUT    | `/tasks/:id` | Update `title` and/or `done`          | 200     | 400, 404  |
| DELETE | `/tasks/:id` | Delete a task                         | 204     | 404       |

## Example: create a task

```
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Learn Express"}'
```

```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":4,"title":"Learn Express","done":false}
```

## Swagger UI screenshot

_(paste your screenshot of http://localhost:3000/docs here)_

## The mortality experiment

_(after restarting the server and hitting GET /tasks again, write 1-2 sentences here about what happened and why — this is the whole point of Week 3)_
