import { productsDb, customersDb, ordersDb } from "./db.js";
// Seed the products table
const count = productsDb
  .prepare("SELECT COUNT(*) AS count FROM products")
  .get().count;
if (count === 0) {
  productsDb.exec(`
    INSERT INTO products (name, category, price, stock) VALUES
    ('Mountain Bike', 'Bikes', 500.00, 10),
    ('Road Bike', 'Bikes', 700.00, 5),
    ('Helmet', 'Accessories', 50.00, 20),
    ('Gloves', 'Accessories', 20.00, 30),
    ('Water Bottle', 'Accessories', 15.00, 25),
    ('Children Bike', 'Bikes', 300.00, 8)
  `);
}

// Seed the customers table
const customerCount = customersDb
  .prepare("SELECT COUNT(*) AS count FROM customers")
  .get().count;
if (customerCount === 0) {
  customersDb.exec(`
    INSERT INTO customers (name, email, phone) VALUES
    ('John Doe', 'john@example.com', '123-456-7890'),
    ('Jane Smith', 'jane@example.com', '987-654-3210'), 
    ('Alice Johnson', 'alice@example.com', '555-123-4567'),
    ('Hana Lee', 'hana@example.com', '444-555-6666'),
    ('Bob Brown', 'bob@example.com', '333-444-5555')
  `);
}

// Seed the orders table
const orderCount = ordersDb
  .prepare("SELECT COUNT(*) AS count FROM orders")
  .get().count;
if (orderCount === 0) {
  ordersDb.exec(`
    INSERT INTO orders (customer_id, product_id, quantity, order_date, status) VALUES
    (1, 1, 1, '2026-09-01', 'DELIVERING'),
    (2, 3, 2, '2026-09-02', 'COMPLETED'), 
    (3, 2, 1, '2026-09-03', 'PAID'),
    (4, 5, 3, '2026-09-04', 'COMPLETED'),
    (5, 6, 1, '2026-09-05', 'CANCELLED')
  `);
}
