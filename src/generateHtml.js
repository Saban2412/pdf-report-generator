export function generateHtml(data) {
  const today = new Date().toISOString().split("T")[0];

  const topProductsRows = data.top_products
    .map(
      (p) => `
      <tr>
        <td>${p.product}</td>
        <td>$${p.total_amount.toFixed(2)}</td>
      </tr>
    `,
    )
    .join("");

  const dailyOrdersRows = data.orders_per_day
    .map(
      (d) => `
      <tr>
        <td>${d.order_date}</td>
        <td>${d.daily_orders}</td>
        <td>$${d.daily_revenue.toFixed(2)}</td>
      </tr>
    `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Sales Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
        }
        h1 { color: #1a365d; }
        .summary-box {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }
        .card {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          padding: 15px;
          border-radius: 8px;
          width: 50%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          border: 1px solid #cbd5e0;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #edf2f7;
        }

        tr {
          break-inside: avoid;
        }
        thead {
          display: table-header-group;
        }
      </style>
    </head>
    <body>
      <h1>Executive Sales Report</h1>
      <p>Generated on: <strong>${today}</strong></p>

      <div class="summary-box">
        <div class="card">
          <h3>Total Orders</h3>
          <p style="font-size: 24px; font-weight: bold;">${data.total_orders}</p>
        </div>
        <div class="card">
          <h3>Total Revenue</h3>
          <p style="font-size: 24px; font-weight: bold;">$${data.total_amount.toFixed(2)}</p>
        </div>
      </div>

      <h2>Top 5 Products by Revenue</h2>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${topProductsRows}
        </tbody>
      </table>

      <h2>Daily Sales Breakdowns (Last Days)</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Orders Count</th>
            <th>Daily Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${dailyOrdersRows}
        </tbody>
      </table>
    </body>
    </html>
  `;
}
