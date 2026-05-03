const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection (TiDB Serverless Cloud)
const db = mysql.createPool({
    host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
    port: 4000,
    user: '2tWXBh7eYnHX4xS.root', 
    password: 'tewgGcssjX21zlYB',
    database: 'NanoKineticsDB',
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

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

// 1. GET Endpoint: Fetches Joined Data from NANOZYMES, SUBSTRATES, and KINETIC_ASSAYS
app.get('/api/nanozymes', (req, res) => {
    // This query links your tables together to get the Material and Substrate names
    const sqlQuery = `
        SELECT 
            k.AssayID as id, 
            n.Material as material, 
            n.Shape as shape, 
            s.SubstrateName as substrate, 
            k.Vmax as vmax, 
            k.Km as km, 
            k.pH_Level as ph, 
            k.Temp_C as temp, 
            n.StructureID as structureId
        FROM KINETIC_ASSAYS k
        JOIN NANOZYMES n ON k.NanozymeID = n.NanozymeID
        JOIN SUBSTRATES s ON k.SubstrateID = s.SubstrateID
        WHERE k.ApprovalStatus = 'Approved'
    `;
    
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error fetching from database:', err);
            return res.status(500).json({ error: 'Failed to retrieve database records' });
        }
        res.json(results);
    });
});

// 2. POST Endpoint: Handle new submissions
// Note: This logic assumes the Material and Substrate already exist in their tables.
app.post('/api/submit', (req, res) => {
    const { material_name, substrate, vmax, km, ph, temp } = req.body;
    
    // In a complex schema, you'd usually look up the IDs first. 
    // For now, this query targets your KINETIC_ASSAYS table structure.
    const sqlQuery = `
        INSERT INTO KINETIC_ASSAYS (NanozymeID, SubstrateID, Vmax, Km, pH_Level, Temp_C, ApprovalStatus) 
        VALUES ((SELECT NanozymeID FROM NANOZYMES WHERE Material = ? LIMIT 1), 
                (SELECT SubstrateID FROM SUBSTRATES WHERE SubstrateName = ? LIMIT 1), 
                ?, ?, ?, ?, 'Pending')`;
    
    db.query(sqlQuery, [material_name, substrate, vmax, km, ph, temp], (err, result) => {
        if (err) {
            console.error('Error saving submission:', err);
            return res.status(500).json({ error: 'Failed to submit data. Ensure Material and Substrate exist.' });
        }
        res.status(201).json({ message: 'Submission successful! Added to the pending queue.' });
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`NanoKineticsDB Server is live and listening on port ${PORT}`);
});
