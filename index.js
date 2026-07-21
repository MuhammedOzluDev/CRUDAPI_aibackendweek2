const express = require("express");
const { DatabaseSync } = require("node:sqlite");

const app = express();
const PORT = 3000;
app.use(express.json());

// Veritabanı dosyasını aç (yoksa otomatik oluşturur)
const db = new DatabaseSync("tasks.db");

// tasks tablosunu yoksa oluştur
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

// Tablo boşsa 3 örnek görev ekle
const countRow = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();
if (countRow.count === 0) {
  const insertSeed = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)");
  insertSeed.run("Buy milk", 0);
  insertSeed.run("Finish assignment", 0);
  insertSeed.run("Read a book", 1);
}
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

// GET /tasks, return the whole list
// GET /tasks, return the whole list
app.get("/tasks", (req, res) => {
  const { search, done } = req.query;
  let query = "SELECT * FROM tasks WHERE 1=1";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }

  if (done !== undefined) {
    query += " AND done = ?";
    params.push(done === "true" ? 1 : 0);
  }

  if (req.query.sort === "title") {
  query += " ORDER BY title";
   }

  const allTasks = db.prepare(query).all(...params);
  res.json(allTasks);
});

app.get("/stats", (req, res) => {
  const total = db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count;
  const completed = db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE done = 1").get().count;
  res.json({ total, completed, remaining: total - completed });
});
// GET /tasks/:id, return a single task, or 404 if it doesn't exist
// GET /tasks/:id, return a single task, or 404 if it doesn't exist

app.get("/stats", (req, res) => {
  const total = db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count;
  const completed = db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE done = 1").get().count;
  res.json({ total, completed, remaining: total - completed });
});

app.get("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  res.json(task);
});

// POST /tasks, create a new task
// POST /tasks, create a new task
app.post("/tasks", (req, res) => {
  const { title } = req.body;

  // Validation: the server never trusts the client.
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }

  const result = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)").run(title, 0);
  const newTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);

  res.status(201).json(newTask);
});

// PUT /tasks/:id — update a task's title and/or done status
// PUT /tasks/:id — update a task's title and/or done status
app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

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

  let newTitle = task.title;
  let newDone = task.done;

if (titleProvided) {
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ error: "Title must be a non-empty string" });
    }
    newTitle = title;
  }

  if (doneProvided) {
    if (typeof done !== "boolean") {
      return res.status(400).json({ error: "Done must be true or false" });
    }
    newDone = done ? 1 : 0;
  }

  db.prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ?").run(newTitle, newDone, id);
  const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

  res.json(updatedTask);
});

// DELETE /tasks/:id — remove a task
// DELETE /tasks/:id — remove a task
app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});