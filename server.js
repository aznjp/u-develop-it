// Import express
const express = require('express');

// Port designation and app constant for express method
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Default response for any other request(Not Found) Catch all
app.use((req, res) => {
    res.status(404).end();
});



app.get('/', (req, res) => {
    res.json({
        message: 'Hello World'
    });
});


// Port Listener
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});