const mysql = require("mysql2/promise");

async function checkPageDetails() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root", 
      password: "chetanlal8658303482@",
      database: "admin"
    });

    console.log("🔍 DETAILED PAGE ANALYSIS\n");

    // 1. Check page details
    console.log("=== PAGE DETAILS ===");
    const [pages] = await connection.query(
      "SELECT id, slug, title, name, layout, content, status, created_at FROM pages WHERE slug = ?",
      ["fresh-start-page"]
    );

    if (pages.length === 0) {
      console.log("❌ Page not found in database");
      await connection.end();
      return;
    }

    const page = pages[0];
    console.log(`ID: ${page.id}`);
    console.log(`Title: "${page.title}"`);
    console.log(`Slug: "${page.slug}"`);
    console.log(`Status: ${page.status}`);
    console.log(`Created: ${page.created_at}`);
    console.log(`Layout Type: ${typeof page.layout}`);
    console.log(`Content Type: ${typeof page.content}`);
    
    // Check layout content
    if (page.layout) {
      try {
        const layout = typeof page.layout === 'string' ? JSON.parse(page.layout) : page.layout;
        console.log(`\n📦 LAYOUT ANALYSIS:`);
        console.log(`Has layout: ${!!layout}`);
        console.log(`Layout keys: ${Object.keys(layout).join(', ')}`);
        
        if (layout.sections) {
          console.log(`Number of sections in layout: ${layout.sections.length}`);
          if (layout.sections.length > 0) {
            console.log("First section:", JSON.stringify(layout.sections[0], null, 2).substring(0, 200) + "...");
          }
        } else {
          console.log("No 'sections' key in layout");
        }
      } catch (e) {
        console.log(`Error parsing layout: ${e.message}`);
      }
    } else {
      console.log("\n📦 No layout data");
    }

    // 2. Check sections table
    console.log("\n=== SECTIONS TABLE CHECK ===");
    try {
      const [sections] = await connection.query(
        "SELECT COUNT(*) as count FROM sections WHERE page_id = ?",
        [page.id]
      );
      console.log(`Sections in table: ${sections[0].count}`);
      
      if (sections[0].count > 0) {
        const [sectionDetails] = await connection.query(
          "SELECT id, section_type, props, sort_order FROM sections WHERE page_id = ? ORDER BY sort_order",
          [page.id]
        );
        console.log("\nSection details:");
        sectionDetails.forEach((sec, i) => {
          console.log(`  ${i+1}. Type: ${sec.section_type}, Order: ${sec.sort_order}`);
          if (sec.props) {
            try {
              const props = typeof sec.props === 'string' ? JSON.parse(sec.props) : sec.props;
              console.log(`     Props keys: ${Object.keys(props).join(', ')}`);
            } catch (e) {
              console.log(`     Props (raw): ${String(sec.props).substring(0, 50)}...`);
            }
          }
        });
      }
    } catch (error) {
      console.log(`Sections table error: ${error.message}`);
    }

    // 3. Check table structure
    console.log("\n=== TABLE STRUCTURE ===");
    const [pageColumns] = await connection.query("DESCRIBE pages");
    console.log("Pages table columns:");
    pageColumns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });

    try {
      const [sectionColumns] = await connection.query("DESCRIBE sections");
      console.log("\nSections table columns:");
      sectionColumns.forEach(col => {
        console.log(`  ${col.Field} (${col.Type})`);
      });
    } catch (e) {
      console.log("\nSections table doesn't exist or error:", e.message);
    }

    await connection.end();
    console.log("\n✅ Analysis complete");

  } catch (error) {
    console.error("Database error:", error.message);
  }
}

checkPageDetails();
