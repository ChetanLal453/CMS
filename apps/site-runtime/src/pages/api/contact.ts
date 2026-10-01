// pages/api/contact.ts
import type { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

type ApiResponse = { message?: string } | any[];

const globalForContactDb = globalThis as unknown as {
  __contactMysqlPool?: mysql.Pool;
};

if (!globalForContactDb.__contactMysqlPool) {
  globalForContactDb.__contactMysqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 30000,
    queueLimit: 0,
  });
}

const pool = globalForContactDb.__contactMysqlPool;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      return res.status(500).json({ message: "Database configuration is missing" });
    }

    if (req.method === "POST") {
      console.log(" POST /api/contact - body:", req.body);

      const {
        firstName,
        lastName,
        companyName,
        website,
        monthlyBudget,
        phoneNumber,
        email,
        services,
        acceptTerms,
      } = req.body;

      // basic validation
      if (!firstName || !lastName || !email) {
        return res
          .status(400)
          .json({ message: "firstName, lastName, and email are required" });
      }

      // Ensure table exists
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS contacts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          firstName VARCHAR(255),
          lastName VARCHAR(255),
          companyName VARCHAR(255),
          website VARCHAR(255),
          monthlyBudget VARCHAR(255),
          phoneNumber VARCHAR(255),
          email VARCHAR(255),
          services VARCHAR(255),
          acceptTerms TINYINT(1),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `;
      await pool.execute(createTableQuery);

      // Insert new contact
      const insertQuery = `
        INSERT INTO contacts
        (firstName, lastName, companyName, website, monthlyBudget, phoneNumber, email, services, acceptTerms)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        firstName,
        lastName,
        companyName || null,
        website || null,
        monthlyBudget || null,
        phoneNumber || null,
        email,
        services || null,
        acceptTerms ? 1 : 0,
      ];

      const [result] = await pool.execute(insertQuery, values);
      console.log(" Insert result:", result);

      return res
        .status(200)
        .json({ message: "Contact form submitted successfully" });
    }

    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(" /api/contact error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
