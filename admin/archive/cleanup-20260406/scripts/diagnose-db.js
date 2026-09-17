require('dotenv/config');
const mysql = require('mysql2/promise');
const { getDatabaseConfig } = require('./scripts/_db-config.cjs');

async function diagnose() {
  const connection = await mysql.createConnection(getDatabaseConfig());

  console.log('🔍 DATABASE DIAGNOSIS');
  console.log('='.repeat(50));

  try {
    // 1. Table structure check
    console.log('\\n1. TABLE STRUCTURE:');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'pages' 
      AND TABLE_SCHEMA = 'admin'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Columns in pages table:');
    columns.forEach(col => {
      console.log(`  • \${col.COLUMN_NAME.padEnd(20)} | \${col.DATA_TYPE.padEnd(15)} | Nullable: \${col.IS_NULLABLE}`);
    });

    // 2. Check for my extra columns
    const myColumns = ['html_content', 'css_content', 'updated_html_at'];
    const found = columns.filter(col => myColumns.includes(col.COLUMN_NAME));
    
    if (found.length > 0) {
      console.log('\\n⚠️  My extra columns found (will ignore them):');
      found.forEach(col => console.log(`  - \${col.COLUMN_NAME}`));
    }

    // 3. Data quality check
    console.log('\\n2. DATA QUALITY CHECK:');
    const [pages] = await connection.query('SELECT COUNT(*) as total FROM pages');
    console.log(`Total pages: \${pages[0].total}`);

    // 4. Check specific page (fresh-start-page)
    console.log('\\n3. CHECK fresh-start-page:');
    const [specificPage] = await connection.query(
      'SELECT id, slug, title, LENGTH(layout) as layout_size, updated_at FROM pages WHERE slug = ?',
      ['fresh-start-page']
    );

    if (specificPage.length > 0) {
      const page = specificPage[0];
      console.log(`✅ Page found: \${page.title}`);
      console.log(`   ID: \${page.id}`);
      console.log(`   Layout size: \${page.layout_size} bytes`);
      console.log(`   Last updated: \${page.updated_at}`);
      
      // Sample layout data
      const [layoutData] = await connection.query(
        'SELECT layout FROM pages WHERE id = ?',
        [page.id]
      );
      
      try {
        const layout = JSON.parse(layoutData[0].layout);
        console.log(`   Sections count: \${layout.sections?.length || 0}`);
        
        if (layout.sections) {
          layout.sections.forEach((section, idx) => {
            const compCount = section.container?.rows?.reduce((total, row) => 
              total + row.columns.reduce((colTotal, col) => 
                colTotal + (col.components?.length || 0), 0), 0) || 0;
            
            console.log(`      Section \${idx + 1}: "\${section.name || 'No name'}" | Components: \${compCount}`);
          });
        }
      } catch (e) {
        console.log('   ❌ Layout JSON parse error:', e.message);
      }
    } else {
      console.log('❌ fresh-start-page not found in database');
    }

    // 5. Check API is working
    console.log('\\n4. API ENDPOINT TEST:');
    console.log('   URL: http://localhost:3000/api/get-page?slug=fresh-start-page');
    console.log('   Expected: JSON with layout data');

  } catch (error) {
    console.error('Diagnosis error:', error.message);
  } finally {
    await connection.end();
    console.log('\\n' + '='.repeat(50));
    console.log('Diagnosis complete.');
  }
}

diagnose();
