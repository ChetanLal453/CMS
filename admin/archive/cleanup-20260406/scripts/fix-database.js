const mysql = require("mysql2/promise");

async function diagnoseAndFix() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "chetanlal8658303482@",
    database: "admin"
  });

  console.log("🔧 DIAGNOSE AND FIX");
  console.log("=".repeat(50));

  try {
    // 1. Check all pages
    const [pages] = await connection.query(
      "SELECT id, slug, title, layout FROM pages"
    );

    console.log(\`Found \${pages.length} pages:\`);

    let fixedCount = 0;
    
    for (const page of pages) {
      console.log(\`\\n📄 Page: \${page.slug} (\${page.title})\`);
      console.log("Layout type:", typeof page.layout);
      console.log("Layout value:", page.layout);
      
      const layoutStr = page.layout?.toString() || '';
      
      if (layoutStr.includes('[object Object]')) {
        console.log("❌ This page has corrupted layout data!");
        
        // We need to FIX this page
        // But we need the ACTUAL layout data from somewhere
        
        // Option 1: Check if content column has it
        const [contentResult] = await connection.query(
          "SELECT content FROM pages WHERE id = ?",
          [page.id]
        );
        
        const content = contentResult[0]?.content;
        if (content && content.includes('sections')) {
          console.log("Found possible layout in content column");
          // Try to extract and fix
          try {
            // Look for JSON in content
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const fixedLayout = JSON.parse(jsonMatch[0]);
              console.log("✅ Found valid JSON in content column");
              
              // Update the layout column
              await connection.query(
                "UPDATE pages SET layout = ? WHERE id = ?",
                [JSON.stringify(fixedLayout), page.id]
              );
              
              console.log("✅ Fixed layout for:", page.slug);
              fixedCount++;
            }
          } catch (e) {
            console.log("Could not fix:", e.message);
          }
        } else {
          console.log("⚠️ No backup data found. Page needs to be resaved in editor.");
        }
      } else {
        console.log("✅ Layout looks OK");
      }
    }
    
    console.log(\`\\n📊 Result: Fixed \${fixedCount} out of \${pages.length} pages\`);
    
    if (fixedCount === 0) {
      console.log("\\n🚨 ACTION REQUIRED:");
      console.log("1. Open your Page Editor");
      console.log("2. Edit the 'fresh-start-page'");
      console.log("3. Click SAVE");
      console.log("4. This will save the layout correctly as JSON");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.end();
    console.log("=".repeat(50));
  }
}

diagnoseAndFix();
