const express = require("express");
const app = express();
const PORT = 3000;

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});