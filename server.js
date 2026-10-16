import express from "express";
import { productsDb, customersDb, ordersDb } from "./db.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const tables = {
  products: {
    db: productsDb,
    table: "products",
    columns: ["name", "category", "price", "stock"],
  },
  customers: {
    db: customersDb,
    table: "customers",
    columns: ["name", "email", "phone"],
    optional: ["phone"],
  },
  orders: {
    db: ordersDb,
    table: "orders",
    columns: ["customer_id", "product_id", "quantity", "order_date", "status"],
    // Ids point to other databases, so names are attached in JS (no SQL JOIN across files)
    lookups: [
      { idCol: "customer_id", db: customersDb, table: "customers", as: "customer_name" },
      { idCol: "product_id", db: productsDb, table: "products", as: "product_name" },
    ],
  },
};

// Adds readable names (e.g. customer_name) to rows that reference other databases
function attachLookups(rows, lookups = []) {
  for (const { idCol, db, table, as } of lookups) {
    const names = new Map(
      db.prepare(`SELECT id, name FROM ${table}`).all().map((r) => [r.id, r.name]),
    );
    for (const row of rows) {
      row[as] = names.get(row[idCol]) ?? "(deleted)";
    }
  }
  return rows;
}

// Find the config by :dbName, 404 if unknown
app.use("/api/:dbName", (req, res, next) => {
  const cfg = tables[req.params.dbName];
  if (!cfg) {
    return res.status(404).send("Database not found");
  }
  req.cfg = cfg;
  next();
});

// Returns the required columns that are missing or empty in the body
function missingFields({ columns, optional = [] }, body = {}) {
  return columns.filter(
    (col) =>
      !optional.includes(col) &&
      (body[col] === undefined || body[col] === null || body[col] === ""),
  );
}

//READ ALL
app.get("/api/:dbName", (req, res) => {
  const { db, table, lookups } = req.cfg;
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  res.json(attachLookups(rows, lookups));
});

//READ ONE
app.get("/api/:dbName/:id", (req, res) => {
  const { db, table } = req.cfg;
  const { id } = req.params;
  const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
  if (!row) {
    return res.status(404).send("Record not found");
  }
  res.json(row);
});

//CREATE
app.post("/api/:dbName", (req, res) => {
  const { db, table, columns } = req.cfg;
  const missing = missingFields(req.cfg, req.body);
  if (missing.length > 0) {
    return res.status(400).send(`Missing fields: ${missing.join(", ")}`);
  }
  try {
    const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
    const values = columns.map((col) => req.body[col]);
    const stmt = db.prepare(sql);
    const info = stmt.run(values);
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//UPDATE
app.put("/api/:dbName/:id", (req, res) => {
  const { db, table, columns } = req.cfg;
  const { id } = req.params;
  const missing = missingFields(req.cfg, req.body);
  if (missing.length > 0) {
    return res.status(400).send(`Missing fields: ${missing.join(", ")}`);
  }
  try {
    const sql = `UPDATE ${table} SET ${columns.map((col) => `${col} = ?`).join(", ")} WHERE id = ?`;
    const values = columns.map((col) => req.body[col]);
    values.push(id);
    const stmt = db.prepare(sql);
    const info = stmt.run(values);
    if (info.changes === 0) {
      return res.status(404).send("Record not found");
    }
    res.json({ id });
  } catch (err) {
    res.status(400).send(err.message);
  }
});
//DELETE
app.delete("/api/:dbName/:id", (req, res) => {
  const { db, table } = req.cfg;
  const { id } = req.params;
  try {
    const stmt = db.prepare(`DELETE FROM ${table} WHERE id = ?`);
    const info = stmt.run(id);
    if (info.changes === 0) {
      return res.status(404).send("Record not found");
    }
    res.json({ id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
