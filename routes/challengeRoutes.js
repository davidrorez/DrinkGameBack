const express = require('express');
const router = express.Router();
require('dotenv').config();
const connection = require('../db/database');

router.get('/', (req, res) => {
    try {

        connection.query('SELECT * FROM challenge', (err, results) => {
            if (err) {
                console.error('Error getting challenges', err);
                res.status(500).json({ error: true });
            } else {
                //console.log(results);
                res.json(results);
            }
        });
    } catch (error) {
        console.error('Unhandled error:', error);
        res.status(500).json({ error: true });
    }
});

router.post('/', (req, res) => {
    try {

        const { challengecol } = req.body;
        const insertQuery = 'INSERT INTO challenge (challengecol) VALUES (?)';

        connection.query(insertQuery, [challengecol], (err, result) => {
            if (err) {
                console.error('Error:', err);
                res.status(500).json({ error: true });
            } else {
                console.log('New challenge successfully');
                res.status(201).json({ error: false });
            }
        });

    } catch (error) {
        console.error('Unhandled error:', error);
        res.status(500).json({ error: true });
    }
});

router.put('/:id', (req, res) => {
    try {

        const { challengecol } = req.body;
        const id = req.params.id;
        const updateQuery = 'UPDATE challenge SET challengecol = ? WHERE id = ?';

        connection.query(updateQuery, [challengecol, id], (err, result) => {
            if (err) {
                console.error('Error:', err);
                res.status(500).json({ error: true });
            } else {
                console.log('Update challenge successfully');
                res.status(201).json({ error: false });
            }
        });

    } catch (error) {
        console.error('Unhandled error:', error);
        res.status(500).json({ error: true });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const id = req.params.id;
        const deleteQuery = 'DELETE FROM challenge WHERE id = ?';

        connection.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error('Error:', err);
                res.status(500).json({ error: true });
            } else {
                if (result.affectedRows === 0) {
                    console.log('ID not found');
                    res.status(404).json({ notFound: true },);
                } else {
                    console.log('Delete challenge successfully');
                    res.status(200).json({ error: false });
                }
            }
        });

    } catch (error) {
        console.error('Unhandled error:', error);
        res.status(500).json({ error: true });
    }
});


module.exports = router;