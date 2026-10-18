import { rmSync } from "node:fs";

// Delete the three database files, then seed.js recreates them with the dummy data
try {
  for (const name of ["products", "customers", "orders"]) {
    rmSync(`data/${name}.db`, { force: true });
  }
} catch (err) {
  console.error("Could not delete the database files. Stop the server first, then try again.");
  console.error(err.message);
  process.exit(1);
}

await import("./seed.js");
console.log("Databases reset to the original dummy data.");
