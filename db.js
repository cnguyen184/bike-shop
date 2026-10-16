import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";

// Database files live in ./data, which is not stored in git
mkdirSync("data", { recursive: true });

const productsDb = new Database("data/products.db");
const customersDb = new Database("data/customers.db");
const ordersDb = new Database("data/orders.db");

export { productsDb, customersDb, ordersDb };

productsDb.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY autoincrement,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL
  )
`);

customersDb.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY autoincrement,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT
  )
`);

ordersDb.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY autoincrement,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    order_date TEXT NOT NULL,
    status TEXT NOT NULL
  )
`);
