// Import express
const express = require('express');
// Import database server file
const db = require('./db/database');
// Routers to each of the API and HTML files
const apiRoutes = require('./routes/apiRoutes');
// const htmlRoutes = require('./routes/htmlRoutes');

// Port designation and app constant for express method
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Use apiRoutes
app.use('/api', apiRoutes);
// app.use('/', htmlRoutes);

// Default response for any other request(Not Found) Catch all
app.use((req, res) => {
    res.status(404).end();
});

// Port Listener
// Start server after DB connection (To ensure the connection first)
db.on('open', () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
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