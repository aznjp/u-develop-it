const express = require('express');
const router = express.Router();
const db = require('../../db/database');
const inputCheck = require('../../utils/inputCheck');


// Get all candidates
router.get('/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
             AS party_name 
             FROM candidates 
             LEFT JOIN parties 
             ON candidates.party_id = parties.id`;
    const params = [];

    // all method will grab all the data
    // requires three arguments which will include the actual SQL data files and render the commands "SELECT * FROM candidates", 
    // the parameter variable and lastly a callback function for error and rows(the data retreived)
    db.all(sql, params, (err, rows) => {
        if (err) {
            // error 500 is an internal server message
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: rows
        });
    });
});

// Get single candidate
router.get('/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
    AS party_name 
    FROM candidates 
    LEFT JOIN parties 
    ON candidates.party_id = parties.id 
    WHERE candidates.id = ?`;

    // Will now use the database call to get specific ID's using param method to query into candidates table
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        // NOTICE IT USES ROW VS ROWS TO SPECIFICALLY TAKE OUT ONE ROW
        res.json({
            message: 'success',
            data: row
        });
    });
});

/* This route might feel a little strange because we're using a parameter for the candidate's id (req.params.id), 
but the request body contains the party's id (req.body.party_id). Why mix the two? 
Again, we want to follow best practices for consistency and clarity. The affected row's id should always be part of the route 
(e.g., /api/candidate/2) while the actual fields we're updating should be part of the body.*/
router.put('/candidate/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');

    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    const sql = `UPDATE candidates SET party_id = ? 
                 WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];

    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: req.body,
            changes: this.changes
        });
    });
});

// Delete a candidate
router.delete('/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates 
    WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: res.message });
            return;
        }

        res.json({
            message: 'successfully deleted',
            changes: this.changes
        });
    });
});

// Create a candidate
router.post('/candidate', ({ body }, res) => {
    // This is to check the input to ensure that it has all the data required before it is inputted into database
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) 
              VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];
    // ES5 function, not arrow function, to use `this`
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: body,
            id: this.lastID
        });
    });
});

module.exports = router