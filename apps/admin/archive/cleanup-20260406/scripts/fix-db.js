import pool from './src/lib/db.js';

async function fixDB() {
  const connection = await pool.getConnection();
  try {
    // Drop dependent tables first
    await connection.execute(`DROP TABLE IF EXISTS section_content`);
    await connection.execute(`DROP TABLE IF EXISTS sections`);
    await connection.execute(`
      CREATE TABLE sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_id INT NOT NULL,
        template_id INT,
        section_type VARCHAR(255) NOT NULL,
        content JSON,
        \`order\` INT DEFAULT 0,
        enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
        FOREIGN KEY (template_id) REFERENCES section_templates(id) ON DELETE SET NULL
      )
    `);
    console.log('Sections table created.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.release();
  }
}

fixDB().then(() => process.exit(0));
