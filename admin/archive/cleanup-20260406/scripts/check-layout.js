const mysql = require("mysql2/promise");

async function checkLayout() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "chetanlal8658303482@",
    database: "admin"
  });

  console.log("🔍 Checking Layout Data...");

  try {
    // Get first 500 chars of layout
    const [result] = await connection.query(
      "SELECT LEFT(layout, 1000) as layout_sample FROM pages WHERE slug = ?",
      ["fresh-start-page"]
    );
    
    console.log("\n📄 First 1000 characters of layout:");
    console.log("=".repeat(50));
    console.log(result[0].layout_sample);
    console.log("=".repeat(50));
    
    // Try to parse it
    const [fullResult] = await connection.query(
      "SELECT layout FROM pages WHERE slug = ?",
      ["fresh-start-page"]
    );
    
    console.log("\n🔄 Attempting to parse JSON...");
    try {
      const layout = JSON.parse(fullResult[0].layout);
      console.log("✅ JSON parsed successfully!");
      console.log("Layout keys:", Object.keys(layout));
      
      if (layout.sections) {
        console.log("Sections count:", layout.sections.length);
        
        // Show section structure
        layout.sections.forEach((section, idx) => {
          console.log(`\nSection ${idx + 1}:`);
          console.log("  Name:", section.name || "Unnamed");
          console.log("  Has container:", !!section.container);
          console.log("  Has props:", !!section.props);
          
          if (section.container?.rows) {
            let totalComponents = 0;
            section.container.rows.forEach((row, rowIdx) => {
              row.columns.forEach((col, colIdx) => {
                totalComponents += col.components?.length || 0;
              });
            });
            console.log("  Total components:", totalComponents);
          }
        });
      }
    } catch (parseError) {
      console.log("❌ JSON parse error:", parseError.message);
      console.log("Error at position:", parseError.position);
      
      // Show around the error
      const layoutText = fullResult[0].layout;
      const errorPos = parseError.position || 0;
      const start = Math.max(0, errorPos - 50);
      const end = Math.min(layoutText.length, errorPos + 50);
      console.log("\n🔍 Error context:");
      console.log("...", layoutText.substring(start, end), "...");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkLayout();
