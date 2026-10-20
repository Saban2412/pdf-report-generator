import { db, initializeDatabase } from "./db.js";

initializeDatabase();

export function seedDatabase() {
  db.exec("DELETE FROM orders;");

  const products = ["Laptop", "Mouse", "Keyboard", "Monitor", "Headphones"];
  const customers = ["Alice", "Bob", "Charlie", "Diana", "Eve"];

  const insertStmt = db.prepare(`
    INSERT INTO orders (customer, product, amount, created_at)
    VALUES (?, ?, ?, ?)
  `);

  db.exec("BEGIN TRANSACTION;");

  try {
    for (let i = 0; i < 200; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const amount = parseFloat((Math.random() * 195 + 5).toFixed(2));

      const date = new Date(
        Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      )
        .toISOString()
        .split("T")[0];

      insertStmt.run(customer, product, amount, date);
    }

    db.exec("COMMIT;");
    console.log("Database seeded successfully with 200 orders.");
  } catch (error) {
    db.exec("ROLLBACK;");
    console.error("Failed to seed database:", error);
  }
}

seedDatabase();
