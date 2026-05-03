const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json()); 

// ==========================================
// DATABASE CONNECTION 
// ==========================================
const db = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: 'Diviz@03', // <--- Your password is now locked in!
    database: 'NanoKineticsDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Startup Check
db.getConnection()
    .then(connection => {
        console.log('✅ Successfully connected to the NanoKineticsDB MySQL database!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ CRITICAL ERROR: MySQL Connection Failed!', err.message);
    });

// ==========================================
// API ROUTES
// ==========================================

app.get('/', (req, res) => res.send('NanoKinetics API is online!'));

// GET: Fetch Approved Data
app.get('/api/nanozymes', async (req, res) => {
    try {
        const query = `
            SELECT k.AssayID as id, n.Material as material, n.Shape as shape, 
                   s.SubstrateName as substrate, k.Vmax as vmax, k.Km as km, 
                   k.pH_Level as ph, k.Temp_C as temp, n.StructureSource as source, n.StructureID as structureId
            FROM KINETIC_ASSAYS k JOIN NANOZYMES n ON k.NanozymeID = n.NanozymeID
            JOIN SUBSTRATES s ON k.SubstrateID = s.SubstrateID WHERE k.ApprovalStatus = 'Approved'
        `;
        const [rows] = await db.execute(query);
        res.status(200).json(rows);
    } catch (error) { res.status(500).json({ error: 'Database fetch failed' }); }
});

// POST: Submit New Data
app.post('/api/submissions', async (req, res) => {
    const { material, shape, substrate, vmax, km, ph, temp, structureType, structureId } = req.body;
    try {
        const [nzResult] = await db.execute(
            `INSERT INTO NANOZYMES (Material, Shape, StructureSource, StructureID) VALUES (?, ?, ?, ?)`,
            [material, shape, structureType || 'None', structureId || null]
        );
        let subId = 1; 
        if (substrate.toUpperCase() === 'DAB') subId = 2; 
        if (substrate.toUpperCase() === 'H2O2') subId = 3;
        
        await db.execute(
            `INSERT INTO KINETIC_ASSAYS (NanozymeID, SubstrateID, Vmax, Km, pH_Level, Temp_C) VALUES (?, ?, ?, ?, ?, ?)`,
            [nzResult.insertId, subId, vmax, km, ph, temp]
        );
        res.status(201).json({ message: 'Submission successful.' });
    } catch (error) { res.status(500).json({ error: 'Submission failed.' }); }
});

// GET: Fetch Pending Queue for Admin
app.get('/api/curation/pending', async (req, res) => {
    try {
        const query = `
            SELECT k.AssayID as id, n.Material as material, s.SubstrateName as substrate, 
                   k.Vmax as vmax, k.Km as km, k.pH_Level as ph, k.Temp_C as temp
            FROM KINETIC_ASSAYS k JOIN NANOZYMES n ON k.NanozymeID = n.NanozymeID
            JOIN SUBSTRATES s ON k.SubstrateID = s.SubstrateID WHERE k.ApprovalStatus = 'Pending'
        `;
        const [rows] = await db.execute(query);
        res.status(200).json(rows);
    } catch (error) { res.status(500).json({ error: 'Failed to fetch queue.' }); }
});

// PUT: Admin Approve/Reject Data
app.put('/api/curation/:id', async (req, res) => {
    try {
        if (req.body.action === 'Approved') {
            await db.execute(`UPDATE KINETIC_ASSAYS SET ApprovalStatus = 'Approved' WHERE AssayID = ?`, [req.params.id]);
        } else if (req.body.action === 'Rejected') {
            await db.execute(`DELETE FROM KINETIC_ASSAYS WHERE AssayID = ?`, [req.params.id]);
        }
        res.status(200).json({ message: `Success.` });
    } catch (error) { res.status(500).json({ error: 'Action failed.' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\n🚀 NanoKinetics API is running on http://localhost:${PORT}`));