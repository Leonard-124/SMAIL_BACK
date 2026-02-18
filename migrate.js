

// const fs = require('fs');
// const path = require('path');
// const { pool } = require('./database/db.js');

// async function runMigration() {
//   try {
//     const files = ['schema.sql', 'schema2.sql', 'schema3.sql', 'schema_password_resets.sql'];
//     for (const file of files) {
//       const schemaPath = path.join(__dirname, file);
//       const schema = fs.readFileSync(schemaPath, 'utf8');
//       await pool.query(schema);
//       console.log(`✅ Applied ${file}`);
//     }
//     process.exit(0);
//   } catch (err) {
//     console.error('❌ Migration failed:', err.message);
//     process.exit(1);
//   }
// }

// runMigration();
/////////////////////////////////////

const fs = require('fs');
const path = require('path');
const { pool } = require('./database/db.js');

async function runMigration() {
  try {
    const files = [
      'schema.sql',
      'schema2.sql',
      'schema3.sql',
      'schema_password_resets.sql'
    ];

    for (const file of files) {
      const schemaPath = path.join(__dirname, file);
      const schema = fs.readFileSync(schemaPath, 'utf8');

      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const stmt of statements) {
        console.log(`➡️ Running from ${file}:`, stmt);
        await pool.query(stmt);
      }

      console.log(`✅ Applied ${file}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

runMigration();
