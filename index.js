const express = require('express');
const { createClient } = require('@libsql/client');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to your cloud Turso database using environment variables
const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

app.use(cors());
app.use(express.json());

// --- 1. Generate a new Short URL ---
// This route is already correct.
app.post('/generateshorturl', async (req, res) => {
    const { longUrl } = req.body;

    try {
        new URL(longUrl);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid URL format provided.' });
    }

    const shortId = crypto.randomBytes(4).toString('hex');

    try {
        const sql = `INSERT INTO urls (long_url, short_id) VALUES (?, ?)`;
        await db.execute({ sql: sql, args: [longUrl, shortId] });

        const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;
        res.status(201).json({ longUrl, shortUrl });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create short URL.' });
    }
});

// --- 2. Get Click Count ---
// MODIFIED: This route is now fixed.
app.get('/count/:shortId', async (req, res) => {
    const { shortId } = req.params;
    const sql = `SELECT click_count FROM urls WHERE short_id = ?`;

    try {
        // Use db.execute() which returns a result object
        const result = await db.execute({ sql: sql, args: [shortId] });

        // Check if the 'rows' array is empty
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Short URL not found.' });
        }
        
        // Get the first row from the 'rows' array
        const row = result.rows[0];
        res.status(200).json({ shortId, clicks: row.click_count });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error.' });
    }
});

// --- 3. Redirect Short URL ---
// MODIFIED: This route is now fixed.
app.get('/:shortId', async (req, res) => {
    const { shortId } = req.params;

    try {
        const findSql = `SELECT long_url FROM urls WHERE short_id = ?`;
        // Use db.execute() which returns a result object
        const result = await db.execute({ sql: findSql, args: [shortId] });

        // Check if the 'rows' array is empty
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Short URL not found.' });
        }

        // Get the first row from the 'rows' array
        const row = result.rows[0];

        // Update the click count
        const updateSql = `UPDATE urls SET click_count = click_count + 1 WHERE short_id = ?`;
        db.execute({ sql: updateSql, args: [shortId] });

        // Redirect the user
        res.redirect(301, row.long_url);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
