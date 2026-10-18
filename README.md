# Bike Shop Manager

A small web app for managing a bike shop across **three separate SQLite databases**:

| Database | File | Table |
|---|---|---|
| Products | `data/products.db` | `products` (name, category, price, stock) |
| Customers | `data/customers.db` | `customers` (name, email, phone) |
| Orders | `data/orders.db` | `orders` (customer_id, product_id, quantity, order_date, status) |

The front end has a dropdown to choose a database, and lets you read, add, edit and delete records.
Orders show the customer and product names instead of ids.

## Tech

- Node.js + Express (REST API)
- SQLite via `better-sqlite3`
- Plain HTML, CSS and JavaScript front end

## Run

```bash
npm install
node seed.js     # creates the databases and fills them with dummy data
node server.js
```

Then open http://localhost:3000

To reset the data to the original dummy data, stop the server and run `npm run reset`.

## API

| Method | URL | Action |
|---|---|---|
| GET | `/api/:db` | read all |
| GET | `/api/:db/:id` | read one |
| POST | `/api/:db` | create |
| PUT | `/api/:db/:id` | update |
| DELETE | `/api/:db/:id` | delete |

`:db` is one of `products`, `customers`, `orders`.
