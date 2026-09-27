// view-db.js
const db = require('better-sqlite3')('ourApp.db');

console.log('=== DATABASE TABLES ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(table => {
    console.log('Table:', table.name);
});

console.log('\n=== USERS ===');
const users = db.prepare('SELECT * FROM user').all();
users.forEach(user => {
    console.log(`ID: ${user.id}, Username: "${user.username}", Email: ${user.email || 'N/A'}`);
});

console.log('\n=== ITINERARIES ===');
const itineraries = db.prepare('SELECT i.*, u.username FROM itineraries i LEFT JOIN user u ON i.authorid = u.id').all();
itineraries.forEach(itinerary => {
    console.log(`ID: ${itinerary.id}, Title: "${itinerary.title}", AuthorID: ${itinerary.authorid}, Author: "${itinerary.username || 'UNKNOWN'}"`);
});

console.log('\n=== SUMMARY ===');
console.log('Total users:', users.length);
console.log('Total itineraries:', itineraries.length);

// Check specifically for unknown authors
const unknownAuthors = itineraries.filter(it => !it.username);
console.log('Itineraries with unknown authors:', unknownAuthors.length);
unknownAuthors.forEach(it => {
    console.log(`  - ID: ${it.id}, Title: "${it.title}", AuthorID: ${it.authorid}`);
});