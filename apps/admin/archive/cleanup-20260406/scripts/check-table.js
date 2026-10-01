import 'dotenv/config';
import pool from './src/lib/db.js';

async function checkTable() {
  try {
    const [rows] = await pool.query('DESCRIBE sections');
    console.log('Sections table structure:');
    rows.forEach(row => console.log(row.Field, row.Type));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}

checkTable();
