const mysql = require("mysql2/promise");

async function checkContent() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "chetanlal8658303482@",
    database: "admin"
  });

  console.log("🔍 Checking layout content...");

  try {
    // Get the raw layout value
    const [result] = await connection.query(
      "SELECT layout FROM pages WHERE slug = ?",
      ["fresh-start-page"]
    );
    
    const layoutValue = result[0].layout;
    
    console.log("\n📊 Analysis:");
    console.log("Type of value:", typeof layoutValue);
    console.log("Is string?", typeof layoutValue === 'string');
    console.log("Is object?", typeof layoutValue === 'object' && layoutValue !== null);
    console.log("Value:", layoutValue);
    console.log("String length:", layoutValue?.toString().length);
    
    // Show beginning and end
    const str = layoutValue?.toString() || '';
    console.log("\nFirst 500 chars:");
    console.log(str.substring(0, 500));
    console.log("\nLast 500 chars:");
    console.log(str.substring(str.length - 500));
    
    // Check for common issues
    console.log("\n🔍 Common issues check:");
    
    if (str.includes('[object Object]')) {
      console.log("❌ Contains '[object Object]' - Object saved incorrectly!");
      
      // Try to find actual JSON
      const jsonStart = str.indexOf('{"id":');
      if (jsonStart !== -1) {
        console.log(`Found JSON at position: ${jsonStart}`);
        const potentialJson = str.substring(jsonStart);
        
        try {
          const parsed = JSON.parse(potentialJson);
          console.log("✅ Can parse extracted JSON!");
          console.log("Parsed keys:", Object.keys(parsed));
        } catch (e) {
          console.log("❌ Still cannot parse");
        }
      }
    }
    
    if (str.startsWith('{') && str.endsWith('}')) {
      console.log("✅ Looks like valid JSON format");
      try {
        const parsed = JSON.parse(str);
        console.log("✅ Can parse as JSON!");
      } catch (e) {
        console.log("❌ But cannot parse:", e.message);
      }
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkContent();
