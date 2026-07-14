const express = require("express");
// This middleware reads incoming JSON bodies and puts them on req.body
// Without it, req.body would be undefined for every POST/PUT
const app = express();
const PORT = 3000;
app.use(express.json());

const swaggerUi = require("swagger-ui-express");
const openapiSpec = require("./openapi.json");
// Swagger UI reads openapi.json and turns it into an interactive page.
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// In-memory "database", just an array that lives in RAM.
// It resets every time the server restarts (that's next week's lesson).
let tasks = [
  { id: 1, title: "Buy milk", done: false },
  { id: 2, title: "Finish assignment", done: false },
  { id: 3, title: "Read a book", done: true },
];
let nextId = 4;

// GET /tasks, return the whole list
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id, return a single task, or 404 if it doesn't exist
app.get("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  res.json(task);
});

// POST /tasks, create a new task
app.post("/tasks", (req, res) => {
  const { title } = req.body;

  // Validation: the server never trusts the client.
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }

  const newTask = { id: nextId, title, done: false };
  nextId++;
  tasks.push(newTask);

  res.status(201).json(newTask);
});

// PUT /tasks/:id — update a task's title and/or done status
app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  const { title, done } = req.body;

  // At least one valid field must be provided.
  const titleProvided = title !== undefined;
  const doneProvided = done !== undefined;

  if (!titleProvided && !doneProvided) {
    return res.status(400).json({ error: "Provide title and/or done to update" });
  }

  if (titleProvided) {
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ error: "Title must be a non-empty string" });
    }
    task.title = title;
  }

  if (doneProvided) {
    if (typeof done !== "boolean") {
      return res.status(400).json({ error: "Done must be true or false" });
    }
    task.done = done;
  }

  res.json(task);
});

// DELETE /tasks/:id — remove a task
app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});