const mysql = require("mysql2/promise");

async function checkContent() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "chetanlal8658303482@",
    database: "admin"
  });

  console.log("🔍 Checking actual content type...");

  try {
    // Get the raw layout value and check its type
    const [result] = await connection.query(
      "SELECT layout, typeof(layout) as type FROM pages WHERE slug = ?",
      ["fresh-start-page"]
    );
    
    const layoutValue = result[0].layout;
    const type = result[0].type;
    
    console.log("\n📊 Layout column analysis:");
    console.log("Database type:", type);
    console.log("Value type:", typeof layoutValue);
    console.log("First 200 chars:", layoutValue?.toString().substring(0, 200));
    console.log("Full length:", layoutValue?.toString().length);
    
    // Try different parsing approaches
    console.log("\n🔄 Attempting to parse:");
    
    // Method 1: Direct parse
    try {
      const parsed1 = JSON.parse(layoutValue);
      console.log("✅ Method 1 (JSON.parse): Success");
    } catch (e1) {
      console.log("❌ Method 1 failed:", e1.message);
    }
    
    // Method 2: If it's already an object
    if (typeof layoutValue === 'object' && layoutValue !== null) {
      console.log("✅ Method 2: Already an object");
      console.log("Object keys:", Object.keys(layoutValue));
    }
    
    // Method 3: String manipulation
    const strValue = layoutValue?.toString();
    if (strValue?.startsWith('[object Object]')) {
      console.log("❌ Method 3: Contains '[object Object]' string");
      console.log("This means an object was saved incorrectly!");
    }
    
    // Check if we can extract the actual object
    console.log("\n🔍 Looking for actual JSON...");
    const str = layoutValue?.toString() || '';
    
    // Try to find JSON start
    const jsonStart = str.indexOf('{"');
    if (jsonStart !== -1) {
      console.log("Found JSON start at position:", jsonStart);
      console.log("Sample from that position:", str.substring(jsonStart, jsonStart + 200));
      
      try {
        // Try to parse from that position
        const jsonStr = str.substring(jsonStart);
        const parsed = JSON.parse(jsonStr);
        console.log("✅ Extracted JSON successfully!");
        console.log("Keys:", Object.keys(parsed));
      } catch (e) {
        console.log("❌ Could not parse extracted string");
      }
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkContent();
