require('dotenv/config');
const mysql = require("mysql2/promise");
const { getDatabaseConfig } = require("./scripts/_db-config.cjs");

async function checkDB() {
  const connection = await mysql.createConnection(getDatabaseConfig());

  console.log("🔍 Checking Database...");

  try {
    // 1. Check columns
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'pages' 
      AND TABLE_SCHEMA = 'admin'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log("\n📊 Table Structure:");
    columns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    // 2. Check my extra columns
    const extraCols = columns.filter(col => 
      ['html_content', 'css_content', 'updated_html_at'].includes(col.COLUMN_NAME)
    );
    
    if (extraCols.length > 0) {
      console.log("\n⚠️  Extra columns (ignore these):");
      extraCols.forEach(col => console.log(`  - ${col.COLUMN_NAME}`));
    }

    // 3. Check page count
    const [countResult] = await connection.query("SELECT COUNT(*) as total FROM pages");
    console.log(`\n📄 Total pages: ${countResult[0].total}`);

    // 4. Check fresh-start-page
    console.log("\n🔎 Checking 'fresh-start-page':");
    const [pageResult] = await connection.query(
      "SELECT id, slug, title, LENGTH(layout) as layout_size FROM pages WHERE slug = ?",
      ["fresh-start-page"]
    );

    if (pageResult.length > 0) {
      const page = pageResult[0];
      console.log(`✅ Found: ${page.title} (ID: ${page.id})`);
      console.log(`   Layout size: ${page.layout_size} bytes`);
      
      // Get full layout
      const [layoutResult] = await connection.query(
        "SELECT layout FROM pages WHERE id = ?",
        [page.id]
      );
      
      try {
        const layout = JSON.parse(layoutResult[0].layout);
        console.log(`   Sections: ${layout.sections?.length || 0}`);
        
        if (layout.sections) {
          console.log("   Section details:");
          layout.sections.forEach((section, idx) => {
            const name = section.name || `Section ${idx + 1}`;
            let componentCount = 0;
            
            if (section.container?.rows) {
              section.container.rows.forEach(row => {
                row.columns.forEach(col => {
                  componentCount += col.components?.length || 0;
                });
              });
            }
            
            console.log(`     ${idx + 1}. ${name} - ${componentCount} components`);
          });
        }
      } catch (e) {
        console.log("   ❌ Layout parse error");
      }
    } else {
      console.log("❌ Page not found");
    }

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.end();
    console.log("\n✅ Check complete");
  }
}

checkDB();
