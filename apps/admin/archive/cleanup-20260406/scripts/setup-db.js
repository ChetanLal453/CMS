import 'dotenv/config';
import pool from './src/lib/db.js';
import fs from 'fs';

async function setupDB() {
  try {
    const sql = fs.readFileSync('create-tables.sql', 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      }
    }

    console.log('✅ Database setup complete!');
  } catch (err) {
    console.error('❌ DB setup failed:', err.message);
  } finally {
    process.exit();
  }
}

setupDB();
