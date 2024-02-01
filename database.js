const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verify the connection pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database as id ' + connection.threadId);
    initializeDatabase(connection);
  }
});

function initializeDatabase(connection) {
  const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`;

  connection.query(createDatabaseQuery, (err) => {
    if (err) {
      console.error('Error creating database:', err);
      connection.release();
      return;
    }

    console.log('Database created or already exists.');
    createTableUser(connection);
  });
}

function createTableUser(connection) {
  const createTableUserQuery = `
    CREATE TABLE IF NOT EXISTS user (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(100) DEFAULT NULL,
      password_salt VARCHAR(100) DEFAULT NULL,
      rol TINYINT(1) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY id_UNIQUE (id),
      UNIQUE KEY email_UNIQUE (email)
    )
  `;

  connection.query(createTableUserQuery, (err) => {
    if (err) {
      console.error('Error creating user table:', err);
      connection.release();
      return;
    }

    console.log('User table created or already exists.');
    createTableChallenge(connection);
  });
}

function createTableChallenge(connection) {
  const createTableChallengeQuery = `
    CREATE TABLE IF NOT EXISTS challenge (
      id INT NOT NULL AUTO_INCREMENT,
      challengecol VARCHAR(255) NOT NULL,
      PRIMARY KEY (id)
    )
  `;

  connection.query(createTableChallengeQuery, (err) => {
    if (err) {
      console.error('Error creating challenge table:', err);
      connection.release();
      return;
    }

    console.log('Challenge table created or already exists.');
    connection.release();
  });
}

module.exports = pool;
