const express = require('express');
const { Pool } = require('pg');                   
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const fs = require('fs');                              
const path = require('path');                           
const port = 3000;

require('dotenv').config();

const app = express(); 
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.get('/invitem/:name', async (req, res) => {
    const name = req.params.name;
    try {
        const result = await pool.query('SELECT * FROM invitems WHERE name = $1', [name]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]); // Return item details
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (err) {
        console.error('Error fetching item:', err);
        res.status(500).send('Server error');
    }
});

app.post('/bill', async (req, res) => {
    const { itemName, quantity, action } = req.body;
    try {
        // Get the item from the database
        const result = await pool.query('SELECT * FROM invitems WHERE name = $1', [itemName]);
        if (result.rows.length > 0) {
            const item = result.rows[0];

            if (action === 'delete') {
                // Delete item from inventory
                await pool.query('DELETE FROM invitems WHERE name = $1', [itemName]);
                res.json({ message: 'Item billed and removed from inventory' });
            } else if (action === 'update') {
                // Update item quantity in inventory
                const newQuantity = item.quantity - quantity;
                await pool.query('UPDATE invitems SET quantity = $1 WHERE name = $2', [newQuantity, itemName]);
                res.json({ message: 'Item billed and quantity updated' });
            } else {
                res.status(400).json({ message: 'Invalid action' });
            }
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (err) {
        console.error('Error processing billing:', err);
        res.status(500).send('Server error');
    }
});


const barcodeDir = path.join(__dirname, 'public', 'barcodes');
if (!fs.existsSync(barcodeDir)) {
    fs.mkdirSync(barcodeDir, { recursive: true });
}
app.use(express.static(path.join(__dirname, 'public')));
app.get('/items', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM invitems');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
app.post('/add-item', async (req, res) => {
    const { name, price, quantity } = req.body;
    const barcodeNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();

    try {
        const result = await pool.query(
            'INSERT INTO invitems (name, price, quantity, barcode) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, price, quantity, barcodeNumber]
        );

        const newItem = result.rows[0];
        const canvas = createCanvas(300, 150);
        JsBarcode(canvas, barcodeNumber, { format: 'CODE128' });
        const barcodeImage = canvas.toBuffer();

        fs.writeFileSync(`${barcodeDir}/${barcodeNumber}.png`, barcodeImage);

        res.json(newItem);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.put('/edit-item/:id', async (req, res) => {
    const id = req.params.id;
    const { name, price, quantity } = req.body;

    try {
        const result = await pool.query(
            'UPDATE invitems SET name = $1, price = $2, quantity = $3 WHERE id = $4 RETURNING *',
            [name, price, quantity, id]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('Item not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.delete('/delete-item/:id', async (req, res) => {
    const id = req.params.id;

    try {
        await pool.query('DELETE FROM invitems WHERE id = $1', [id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});




app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/index.html`);
});
