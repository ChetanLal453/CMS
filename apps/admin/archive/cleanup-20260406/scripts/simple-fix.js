const mysql = require("mysql2/promise");

async function fixData() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "chetanlal8658303482@",
    database: "admin"
  });

  console.log("Fixing database data...");

  try {
    // Check all pages
    const [pages] = await connection.query("SELECT id, slug, title, layout FROM pages");
    
    console.log("Found " + pages.length + " pages:");
    
    for (const page of pages) {
      console.log("\nPage: " + page.slug + " (" + page.title + ")");
      
      const layoutStr = page.layout ? page.layout.toString() : '';
      
      if (layoutStr.includes('[object Object]')) {
        console.log("ERROR: Layout is corrupted!");
        console.log("This page needs to be resaved in the editor.");
        console.log("Current value: " + layoutStr.substring(0, 100));
      } else {
        console.log("OK: Layout looks fine");
      }
    }
    
    console.log("\n=== ACTION REQUIRED ===");
    console.log("1. Open your Page Editor");
    console.log("2. Edit 'fresh-start-page'");
    console.log("3. Make a small change (add space, etc.)");
    console.log("4. Click SAVE");
    console.log("5. This will save layout as proper JSON");
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.end();
  }
}

fixData();
