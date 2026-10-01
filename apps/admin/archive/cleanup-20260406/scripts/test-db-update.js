const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Your password
    database: 'your_database', // Your database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const connection = await pool.getConnection();
    
    // Read current
    const [rows] = await connection.execute(
      'SELECT * FROM pages WHERE id = 2'
    );
    console.log('Current data:', rows[0]);
    
    // Try to update
    const [result] = await connection.execute(
      'UPDATE pages SET header_slug = ?, footer_slug = ?, updated_at = NOW() WHERE id = ?',
      ['header-2', 'footer-2', 2]
    );
    
    console.log('Update result:', result);
    
    // Read again
    const [updated] = await connection.execute(
      'SELECT * FROM pages WHERE id = 2'
    );
    console.log('Updated data:', updated[0]);
    
    connection.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

test();