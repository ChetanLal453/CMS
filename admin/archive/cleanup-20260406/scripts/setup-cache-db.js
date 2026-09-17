const mysql = require("mysql2/promise");

async function setupCacheDatabase() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root", 
    password: "chetanlal8658303482@",
    database: "admin"
  });

  console.log("🔄 Setting up HTML cache system...");
  
  try {
    // Check current structure
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'pages' 
      AND TABLE_SCHEMA = 'admin'
    `);
    
    const columnNames = columns.map(c => c.COLUMN_NAME);
    
    // Add cache columns if missing
    if (!columnNames.includes('html_content')) {
      await connection.query(`
        ALTER TABLE pages 
        ADD COLUMN html_content LONGTEXT NULL
      `);
      console.log("✅ Added html_content column");
    }
    
    if (!columnNames.includes('css_content')) {
      await connection.query(`
        ALTER TABLE pages 
        ADD COLUMN css_content TEXT NULL
      `);
      console.log("✅ Added css_content column");
    }
    
    if (!columnNames.includes('updated_html_at')) {
      await connection.query(`
        ALTER TABLE pages 
        ADD COLUMN updated_html_at TIMESTAMP NULL
      `);
      console.log("✅ Added updated_html_at column");
    }
    
    console.log("\n🎯 Database ready for HTML caching!");
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.end();
  }
}

setupCacheDatabase();
