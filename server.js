// Import express
const express = require('express');
// Connect to the SQLite database
const sqlite3 = require('sqlite3').verbose();

const inputCheck = require('./utils/inputCheck');

// Port designation and app constant for express method
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Default response for any other request(Not Found) Catch all
// app.use((req, res) => {
//     res.status(404).end();
// });

// Connect to database
const db = new sqlite3.Database('./db/election.db', err => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the election database.');
});

// This method runs the SQL query and executes the callback with all the resulting rows that match the query.
// db.all(`SELECT * FROM candidates`, (err, rows) => {
//     console.log(rows);
// });

// db.get(`SELECT * FROM candidates WHERE id = 1`, (err, row) => {
//     if (err) {
//         console.log(err);
//     }
//     console.log(row);
// });

// Delete a candidate
/* The method run() will execute an SQL query but won't retrieve any result data.
The question mark (?) denotes a placeholder, making this a prepared statement. 
Prepared statements can have placeholders that can be filled in dynamically with real values at runtime.
An additional param argument can provide values for prepared statement placeholders. 
Here, we're hardcoding 1 temporarily to demonstrate how prepared statements work. 
If we need additional placeholders, the param argument can be an array that holds multiple values.
An ES5 function is used for the callback. 
This allows us to take advantage of the database object that's returned in the callback function. 
Let's take a look at what the database object looks like, by logging this.*/

// db.run(`DELETE FROM candidates WHERE id = ?`, 1, function(err, result) {
//     if (err) {
//         console.log(err);
//     }
//     console.log(result, this, this.changes);
// });

// Create a candidate
// const sql = `INSERT INTO candidates (id, first_name, last_name, industry_connected) 
//               VALUES (?,?,?,?)`;
// const params = [1, 'Ronald', 'Firbank', 1];
// // ES5 function, not arrow function, to use this
// db.run(sql, params, function(err, result) {
//     if (err) {
//         console.log(err);
//     }
//     console.log(result, this.lastID);
// });

// Get all candidates
app.get('/api/candidates', (req, res) => {
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
app.get('/api/candidate/:id', (req, res) => {
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

// Get all parties
app.get('/api/parties', (req, res) => {
    const sql = `SELECT * FROM parties`;
    const params = [];
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: rows
        });
    });
});

// Get a single party
app.get('/api/party/:id', (req, res) => {
    const sql = `SELECT * FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

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
app.put('/api/candidate/:id', (req, res) => {
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
app.delete('/api/candidate/:id', (req, res) => {
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

// Delete a party
app.delete('/api/party/:id', (req, res) => {
    const sql = `DELETE FROM parties WHERE id = ?`;
    const params = [req.params.id];

    // We also need to use normal function syntax for the db.run() callback instead of an arrow function, 
    // or else we'd lose the context of this.changes.
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: res.message });
            return;
        }

        res.json({ message: 'successfully deleted', changes: this.changes });
    });
});


// Create a candidate
app.post('/api/candidate', ({ body }, res) => {
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

// Port Listener
// Start server after DB connection (To ensure the connection first)
db.on('open', () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});