const sqlite3 = require('sqlite3').verbose();

// Create a new database file named 'urls.db'
const db = new sqlite3.Database('./urls.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the urls.db database.');
});

// Create the 'urls' table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS urls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        long_url TEXT NOT NULL,
        short_id TEXT NOT NULL UNIQUE,
        click_count INTEGER DEFAULT 0
    )`, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log("Successfully created the 'urls' table.");
    });
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Closed the database connection.');
});