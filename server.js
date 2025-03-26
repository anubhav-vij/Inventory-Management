const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mummy@31051959',
    database: 'inventory_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
});

// Get all products with their lots
app.get('/api/products', (req, res) => {
    const query = `
        SELECT p.*, l.lot_id, l.lot_number, l.quantity, l.receipt_date, l.expiration_date
        FROM products p
        LEFT JOIN lots l ON p.product_id = l.product_id
    `;
    db.query(query, (err, results) => {
        if (err) throw err;
        
        const products = {};
        results.forEach(row => {
            if (!products[row.product_id]) {
                products[row.product_id] = {
                    product_id: row.product_id,
                    vendor: row.vendor,
                    vendor_part: row.vendor_part,
                    location: row.location,
                    additional_info: row.additional_info, // Added additional_info
                    lots: []
                };
            }
            if (row.lot_id) {
                products[row.product_id].lots.push({
                    lot_id: row.lot_id,
                    lot_number: row.lot_number,
                    quantity: row.quantity,
                    receipt_date: row.receipt_date,
                    expiration_date: row.expiration_date
                });
            }
        });
        res.json(Object.values(products));
    });
});

// Add a new product with lots
app.post('/api/products', (req, res) => {
    const { vendor, vendor_part, location, additional_info, lots } = req.body; // Added additional_info
    db.query(
        'INSERT INTO products (vendor, vendor_part, location, additional_info) VALUES (?, ?, ?, ?)',
        [vendor, vendor_part, location, additional_info], // Added additional_info to values
        (err, result) => {
            if (err) throw err;
            const productId = result.insertId;
            
            if (lots && lots.length > 0) {
                const lotValues = lots.map(lot => [
                    productId,
                    lot.lot_number,
                    lot.quantity,
                    lot.receipt_date,
                    lot.expiration_date
                ]);
                db.query(
                    'INSERT INTO lots (product_id, lot_number, quantity, receipt_date, expiration_date) VALUES ?',
                    [lotValues],
                    (err) => {
                        if (err) throw err;
                        res.json({ success: true, product_id: productId });
                    }
                );
            } else {
                res.json({ success: true, product_id: productId });
            }
        }
    );
});

// Update an existing product and its lots
app.put('/api/products/:id', (req, res) => {
    const { vendor, vendor_part, location, additional_info, lots } = req.body; // Added additional_info
    const productId = req.params.id;

    db.query(
        'UPDATE products SET vendor=?, vendor_part=?, location=?, additional_info=? WHERE product_id=?',
        [vendor, vendor_part, location, additional_info, productId], // Added additional_info to update
        (err) => {
            if (err) throw err;
            
            // Delete existing lots and insert new ones
            db.query('DELETE FROM lots WHERE product_id=?', [productId], (err) => {
                if (err) throw err;
                
                if (lots && lots.length > 0) {
                    const lotValues = lots.map(lot => [
                        productId,
                        lot.lot_number,
                        lot.quantity,
                        lot.receipt_date,
                        lot.expiration_date
                    ]);
                    db.query(
                        'INSERT INTO lots (product_id, lot_number, quantity, receipt_date, expiration_date) VALUES ?',
                        [lotValues],
                        (err) => {
                            if (err) throw err;
                            res.json({ success: true });
                        }
                    );
                } else {
                    res.json({ success: true });
                }
            });
        }
    );
});

// Delete a product (unchanged)
app.delete('/api/products/:id', (req, res) => {
    db.query('DELETE FROM products WHERE product_id=?', [req.params.id], (err) => {
        if (err) throw err;
        res.json({ success: true });
    });
});

// Serve the main page (unchanged)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Serve the edit page (unchanged)
app.get('/edit/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'edit.html'));
});

// Start the server
// app.listen(3000, () => console.log('Server running on port 3000'));

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
});