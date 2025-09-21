const express = require('express');
const { createClient } = require('@libsql/client');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to your cloud Turso database
const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

app.use(express.json());

// --- 1. Generate a new Short URL ---
app.post('/generateshorturl', async (req, res) => {
    const { longUrl } = req.body;

    try {
        new URL(longUrl);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid URL format provided.' });
    }

    const shortId = nanoid(7);

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
// MODIFIED: Converted to async/await and try/catch
app.get('/count/:shortId', async (req, res) => {
    const { shortId } = req.params;
    const sql = `SELECT click_count FROM urls WHERE short_id = ?`;

    try {
        // Use db.get() to fetch a single row
        const result = await db.get(sql, [shortId]);

        if (!result) {
            return res.status(404).json({ error: 'Short URL not found.' });
        }
        res.status(200).json({ shortId, clicks: result.click_count });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error.' });
    }
});

// --- 3. Redirect Short URL ---
// MODIFIED: Converted to async/await and try/catch
app.get('/:shortId', async (req, res) => {
    const { shortId } = req.params;

    try {
        const findSql = `SELECT long_url FROM urls WHERE short_id = ?`;
        const row = await db.get(findSql, [shortId]);

        if (!row) {
            return res.status(404).json({ error: 'Short URL not found.' });
        }

        // If found, update the click count. No need to await this for a faster redirect.
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
