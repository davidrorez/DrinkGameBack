const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const connection = require('../database');
require('dotenv').config();

router.post('/login', (req, res) => {
    try {
        const { user } = req.body;
        const getUserQuery = 'SELECT * FROM user WHERE email = ?';

        connection.query(getUserQuery, [user.email], (err, result) => {
            if (err) {
                console.error('Error:', err);
                return res.status(500).json({ error: true });
            }

            if (result.length === 0) {
                return res.status(401).json({ incorrectEmail: true });
            }
            
            const isPasswordCorrect = bcrypt.compareSync(user.password, result[0].password_hash);

            if (!isPasswordCorrect) {
                return res.status(401).json({ incorrectPassword: true });
            }

            if (result[0].rol) {
                return res.status(200).json({ error: false, admin: true, name: result[0].name });
            } else {
                return res.status(200).json({ error: false, admin: false, name: result[0].name });
            }
        });
    } catch (error) {
        console.error('Unhandled error:', error);
        res.status(500).json({ error: true });
    }
});

router.get('/', (req, res) => {
    try {
        connection.query('SELECT * FROM user', (err, results) => {
            if (err) {
                console.error('Error get users:', err);
                res.status(500).json({ error: true });
            } else {
                console.log(results);
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
        const { user } = req.body;
        console.log(user)
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(user.password, salt);

        const insertQuery = 'INSERT INTO user (name, email, rol, password_salt, password_hash) VALUES (?, ?, ?, ?, ?)';

        connection.query(insertQuery, [user.name, user.email, user.rol, salt, passwordHash], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(500).json({ duplicated: true });
                }
                console.error('Error:', err);
                return res.status(500).json({ error: true });
            } else {
                console.log('New user created successfully');
                return res.status(201).json({ error: false });
            }
        });
    } catch (error) {
        console.error('Unhandled error:', error);
        res.status(500).json({ error: true, success: false });
    }
});

router.put('/:id', (req, res) => {
    try {
        const { name } = req.body;
        const id = req.params.id;

        const updateQuery = 'UPDATE user SET name = ? WHERE id = ?';

        connection.query(updateQuery, [name, id], (err, result) => {
            if (err) {
                console.error('Error:', err);
                res.status(500).json({ error: true });
            } else {
                console.log('User edited successfully');
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
        const deleteQuery = 'DELETE FROM user WHERE id = ?'

        connection.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error('Error:', err);
                res.status(500).json({ error: true });
            } else {
                if (result.affectedRows === 0) {
                    console.log('User not found');
                    res.status(404).json({ notFound: true });
                } else {
                    console.log('User deleted successfully');
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