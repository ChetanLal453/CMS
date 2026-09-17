const mysql = require('mysql2/promise');

async function checkPage() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'chetanlal8658303482@',
      database: 'admin'
    });

    console.log('🔍 Checking for "fresh start page"...');
    
    // Check all pages
    const [pages] = await connection.query('SELECT slug, title FROM pages');
    console.log(`Total pages in database: ${pages.length}`);
    
    pages.forEach(p => {
      console.log(\`- "\${p.title}" (slug: "\${p.slug}")\`);
    });

    // Check specifically for fresh start
    const [freshPages] = await connection.query(
      'SELECT * FROM pages WHERE slug LIKE ? OR title LIKE ?',
      ['%fresh%', '%fresh%']
    );
    
    if (freshPages.length > 0) {
      console.log('\\n🎯 Found matching pages:');
      freshPages.forEach(p => {
        console.log(\`- ID: \${p.id}, Slug: "\${p.slug}", Title: "\${p.title}", Status: \${p.status}\`);
      });
    } else {
      console.log('\\n❌ No pages found with "fresh" in name/title');
    }

    await connection.end();
  } catch (error) {
    console.error('Database error:', error.message);
  }
}

checkPage();
