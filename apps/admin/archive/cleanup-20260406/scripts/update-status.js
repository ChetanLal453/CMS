const mysql = require("mysql2/promise");

async function updatePageStatus() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root", 
      password: "chetanlal8658303482@",
      database: "admin"
    });

    console.log("Updating page status from 'draft' to 'published'...");
    
    const [result] = await connection.query(
      "UPDATE pages SET status = 'published' WHERE slug = ?",
      ["fresh-start-page"]
    );

    if (result.affectedRows > 0) {
      console.log("✅ Page status updated to 'published'");
    } else {
      console.log("⚠️ No rows updated");
    }

    // Verify
    const [pages] = await connection.query(
      "SELECT slug, title, status FROM pages WHERE slug = ?",
      ["fresh-start-page"]
    );
    
    console.log("\nUpdated page info:");
    pages.forEach(p => {
      console.log(`- "${p.title}" (slug: "${p.slug}", status: "${p.status}")`);
    });

    await connection.end();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

updatePageStatus();
