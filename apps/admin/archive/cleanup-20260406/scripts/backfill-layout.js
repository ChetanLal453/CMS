import pool from './src/lib/db.js';

async function backfillLayouts() {
  const connection = await pool.getConnection();
  try {
    // Get all pages
    const [pages] = await connection.execute('SELECT id, title, layout FROM pages');

    let updated = 0;
    for (const page of pages) {
      let needsUpdate = false;
      let newLayout = null;

      if (!page.layout) {
        // Null layout
        needsUpdate = true;
        newLayout = {
          id: page.id.toString(),
          name: page.title,
          sections: []
        };
      } else {
        // Check if valid JSON
        try {
          JSON.parse(page.layout);
        } catch (e) {
          // Invalid JSON
          needsUpdate = true;
          newLayout = {
            id: page.id.toString(),
            name: page.title,
            sections: []
          };
        }
      }

      if (needsUpdate) {
        await connection.execute(
          'UPDATE pages SET layout = ? WHERE id = ?',
          [JSON.stringify(newLayout), page.id]
        );
        updated++;
        console.log(`Updated layout for page ${page.id}: ${page.title}`);
      }
    }

    console.log(`Backfill complete. Updated ${updated} pages.`);
  } catch (error) {
    console.error('Error during backfill:', error);
  } finally {
    connection.release();
  }
}

backfillLayouts().then(() => process.exit(0));
