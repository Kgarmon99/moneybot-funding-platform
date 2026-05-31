import Database from 'better-sqlite3';
const db = new Database('./data/funding.db');
console.log('Tables:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables);
console.log('\nOpportunities count:');
const count = db.prepare('SELECT COUNT(*) as count FROM opportunities').get();
console.log(count);
