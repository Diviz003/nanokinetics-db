const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

// Initialize the Express app
const app = express();

// Middleware
app.use(cors()); // Allows your frontend to talk to this backend
app.use(express.json()); // Allows the server to understand JSON data from submissions

// Database Connection (TiDB Serverless Cloud)
// Using createPool is highly recommended for cloud hosting to manage multiple connections
const db = mysql.createPool({
    host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
    port: 4000,
    user: '2tWXBh7eYnHX4xS.root', // Replace with your TiDB user
    password: 'tewgGcssjX21zlYB',       // Replace with your saved password
    database: 'NanoKineticsDB',
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verify Connection on Startup
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Successfully connected to TiDB Cloud!');
        connection.release();
    }
});

// ==========================================
//                 API ROUTES
// ==========================================

// 1. GET Endpoint: Fetch live data for the public search portal
// (Assuming your main table is 'kinetic_data'. Adjust the table name if your schema is different.)
app.get('/api/nanozymes', (req, res) => {
    // Only fetch data that the admin has officially approved
    const sqlQuery = 'SELECT * FROM kinetic_data WHERE status = "Approved"';
    
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error fetching from database:', err);
            return res.status(500).json({ error: 'Failed to retrieve database records' });
        }
        res.json(results);
    });
});

// 2. POST Endpoint: Handle new community submissions
app.post('/api/submit', (req, res) => {
    // Extract the submitted fields from the frontend form
    const { material_name, substrate, vmax, km, ph, temp } = req.body;
    
    // Insert into the database with a default status of "Pending" for admin review
    const sqlQuery = 'INSERT INTO kinetic_data (material_name, substrate, vmax, km, ph, temp, status) VALUES (?, ?, ?, ?, ?, ?, "Pending")';
    
    db.query(sqlQuery, [material_name, substrate, vmax, km, ph, temp], (err, result) => {
        if (err) {
            console.error('Error saving submission:', err);
            return res.status(500).json({ error: 'Failed to submit data to the database' });
        }
        res.status(201).json({ message: 'Submission successful! Added to the pending queue for review.' });
    });
});

// ==========================================
//               SERVER LAUNCH
// ==========================================

// CRITICAL FOR RENDER: Cloud providers dynamically assign ports. 
// process.env.PORT tells Render to use its own port, falling back to 3000 only for local testing.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`NanoKineticsDB Server is live and listening on port ${PORT}`);
});
