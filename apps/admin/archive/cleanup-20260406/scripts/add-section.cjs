const mysql = require('mysql2/promise');

async function addSections() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'chetanlal8658303482@',
    database: 'admin'
  });

  try {
    await pool.execute('INSERT INTO sections (page_id, section_type, content, `order`) VALUES (?, ?, ?, ?)', [
      2,
      'about_one',
      JSON.stringify({
        subtitle: 'WHY CHOOSE US',
        image: '/img/about/about-thumb-2.png',
        shapeImage: '/img/shape/about-thumb-shape.png'
      }),
      0
    ]);
    console.log('Added section for page 2');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

addSections();
