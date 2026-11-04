const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.'))); // Serves your HTML/CSS frontend files

// Initialize SQLite Database
const db = new sqlite3.Database('./cs_sync.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            security_question TEXT,
            security_answer TEXT,
            program TEXT,
            batch_year TEXT
        )`);
    }
});

// 1. Sign Up Endpoint
app.post('/api/signup', (req, res) => {
    const { name, email, password, security_question, security_answer, batch_year } = req.body;

    if (!email || !email.endsWith('@up.edu.ph')) {
        return res.status(400).json({ success: false, message: 'Only @up.edu.ph accounts are accepted.' });
    }

    const query = `INSERT INTO users (name, email, password, security_question, security_answer, program, batch_year) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [name, email, password, security_question, security_answer, 'BS Computer Science', batch_year], function(err) {
        if (err) {
            return res.status(400).json({ success: false, message: 'Email already registered or invalid input.' });
        }
        res.json({ success: true, message: 'Account created successfully!' });
    });
});

// 2. Sign In Endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.get(query, [email, password], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        if (!row) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        res.json({ success: true, user: row });
    });
});

// 3. Password Reset Endpoint (Forgot Password)
app.post('/api/reset-password', (req, res) => {
    const { email, security_question, security_answer, new_password } = req.body;

    const query = `SELECT * FROM users WHERE email = ? AND security_question = ? AND security_answer = ?`;
    db.get(query, [email, security_question, security_answer], (err, row) => {
        if (err || !row) {
            return res.status(400).json({ success: false, message: 'Incorrect email or security answer.' });
        }

        const updateQuery = `UPDATE users SET password = ? WHERE email = ?`;
        db.run(updateQuery, [new_password, email], function(updateErr) {
            if (updateErr) {
                return res.status(500).json({ success: false, message: 'Failed to update password.' });
            }
            res.json({ success: true, message: 'Password successfully reset!' });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});