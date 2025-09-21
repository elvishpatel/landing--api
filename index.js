const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const cors = require('cors'); // <-- NEW: Import the cors package

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './urls.db'; 

// Connect to our SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
    }
    console.log('Connected to the urls.db database.');
});

app.use(cors()); // <-- NEW: Enable CORS for all routes
app.use(express.json());


// --- 1. Generate a new Short URL ---
app.post('/generateshorturl', (req, res) => {
    const { longUrl } = req.body;

    try {
        new URL(longUrl);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid URL format provided.' });
    }
    
    const shortId = crypto.randomBytes(4).toString('hex');

    const sql = `INSERT INTO urls (long_url, short_id) VALUES (?, ?)`;
    db.run(sql, [longUrl, shortId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to create short URL.' });
        }
        const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;
        res.status(201).json({ longUrl, shortUrl });
    });
});

// ... the rest of your code remains exactly the same ...


// --- 2. Get Click Count ---
app.get('/count/:shortId', (req, res) => {
    const { shortId } = req.params;
    const sql = `SELECT click_count FROM urls WHERE short_id = ?`;

    db.get(sql, [shortId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error.' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Short URL not found.' });
        }
        res.status(200).json({ shortId, clicks: row.click_count });
    });
});

// --- 3. Redirect Short URL ---
app.get('/:shortId', (req, res) => {
    const { shortId } = req.params;

    const findSql = `SELECT long_url FROM urls WHERE short_id = ?`;
    db.get(findSql, [shortId], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Short URL not found.' });
        }
        const updateSql = `UPDATE urls SET click_count = click_count + 1 WHERE short_id = ?`;
        db.run(updateSql, [shortId]);

        res.redirect(301, row.long_url);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
