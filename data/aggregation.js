import { db } from "./db.js";

export function getReportData() {
  try {
    const stmt = db
      .prepare(
        `
            SELECT COUNT(*) AS total_orders, SUM(amount) AS total_amount FROM orders;
            `,
      )
      .get();
    const topProductsStmt = db
      .prepare(
        `
        SELECT product, SUM(amount) AS total_amount FROM orders GROUP BY product ORDER BY total_amount DESC LIMIT 5;
        `,
      )
      .all();

    const ordersPerDayStmt = db
      .prepare(
        `
    SELECT 
      DATE(created_at) AS order_date, 
      COUNT(*) AS daily_orders,
      SUM(amount) AS daily_revenue
    FROM orders 
    WHERE created_at >= datetime('now', '-30 days') 
    GROUP BY DATE(created_at) 
    ORDER BY order_date DESC 
    LIMIT 7
  `,
      )
      .all();
    const jsonData = {
      total_orders: stmt.total_orders,
      total_amount: stmt.total_amount,
      top_products: topProductsStmt,
      orders_per_day: ordersPerDayStmt,
    };

    console.log("Report Data:", jsonData);
    return jsonData;
  } catch (error) {
    console.error("Error fetching report data:", error);
  }
}
