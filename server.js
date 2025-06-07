// server.js - Simple Express server with SQLite
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database
const db = new Database('magic-lantern-reviews.db');

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        film_title TEXT,
        film_year TEXT,
        result_id TEXT,
        publication TEXT,
        date TEXT,
        score REAL,
        reviewed BOOLEAN DEFAULT 0,
        important BOOLEAN DEFAULT 0,
        skipped BOOLEAN DEFAULT 0,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS tags (
        review_id TEXT,
        tag TEXT,
        FOREIGN KEY (review_id) REFERENCES reviews(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_film ON reviews(film_title, film_year);
    CREATE INDEX IF NOT EXISTS idx_reviewed ON reviews(reviewed);
`);

// API Routes
app.post('/api/review', (req, res) => {
    const { filmTitle, filmYear, resultId, publication, date, score, state } = req.body;
    const id = `${filmTitle}_${filmYear}_${resultId}`;
    
    try {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO reviews 
            (id, film_title, film_year, result_id, publication, date, score, 
             reviewed, important, skipped, note, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `);
        
        stmt.run(id, filmTitle, filmYear, resultId, publication, date, score,
                 state.reviewed ? 1 : 0,
                 state.important ? 1 : 0,
                 state.skipped ? 1 : 0,
                 state.note || '');
        
        // Handle tags
        db.prepare('DELETE FROM tags WHERE review_id = ?').run(id);
        if (state.tags && state.tags.length > 0) {
            const tagStmt = db.prepare('INSERT INTO tags (review_id, tag) VALUES (?, ?)');
            state.tags.forEach(tag => tagStmt.run(id, tag));
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/review/:id', (req, res) => {
    const review = db.prepare(`
        SELECT r.*, GROUP_CONCAT(t.tag) as tags
        FROM reviews r
        LEFT JOIN tags t ON r.id = t.review_id
        WHERE r.id = ?
        GROUP BY r.id
    `).get(req.params.id);
    
    if (review) {
        // Convert tags string to array
        if (review.tags) {
            review.tags = review.tags.split(',');
        } else {
            review.tags = [];
        }
        res.json(review);
    } else {
        // Return empty state for non-existent reviews
        res.json({
            reviewed: 0,
            important: 0,
            skipped: 0,
            note: '',
            tags: []
        });
    }
});

app.get('/api/stats', (req, res) => {
    const stats = db.prepare(`
        SELECT 
            COUNT(*) as total,
            SUM(reviewed) as reviewed,
            SUM(important) as important,
            SUM(skipped) as skipped
        FROM reviews
    `).get();
    
    const byFilm = db.prepare(`
        SELECT film_title, film_year, 
               COUNT(*) as total,
               SUM(reviewed) as reviewed
        FROM reviews
        GROUP BY film_title, film_year
        ORDER BY film_year, film_title
    `).all();
    
    res.json({ overall: stats, byFilm });
});

app.get('/api/export', (req, res) => {
    const reviews = db.prepare(`
        SELECT r.*, GROUP_CONCAT(t.tag) as tags
        FROM reviews r
        LEFT JOIN tags t ON r.id = t.review_id
        WHERE r.reviewed = 1
        GROUP BY r.id
        ORDER BY r.film_year, r.film_title, r.score DESC
    `).all();
    
    res.json(reviews);
});

// Serve static files
app.use(express.static('.'));

app.listen(3000, () => {
    console.log('Magic Lantern Review Server running on http://localhost:3000');
});