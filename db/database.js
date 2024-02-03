const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database as id " + connection.threadId);
    initializeDatabase(connection);
  }
});

function initializeDatabase(connection) {
  const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`;
  connection.query(createDatabaseQuery, (err) => {
    if (err) {
      console.error("Error creating database:", err);
      connection.release();
      return;
    }
    console.log("Database created or already exists.");
    useDatabase(connection);
    createTableUser(connection);
    createTableChallenge(connection);
    insertSeeds(connection);
    createAdminUser(connection);
  });
}

function useDatabase(connection) {
  const useDatabaseQuery = `USE ${process.env.DB_DATABASE}`;
  connection.query(useDatabaseQuery, (err) => {
    if (err) {
      console.error("Error using database:", err);
      connection.release();
      return;
    }

    console.log(`Using database: ${process.env.DB_DATABASE}.`);
    connection.release();
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
      console.error("Error creating user table:", err);
      connection.release();
      return;
    }

    console.log("User table created or already exists.");
    connection.release();
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
      console.error("Error creating challenge table:", err);
      connection.release();
      return;
    }

    console.log("Challenge table created or already exists.");
    connection.release();
  });
}

function createAdminUser(connection) {
  const saltRounds = 10;
  const name = process.env.DB_ADMIN_NAME;
  const email = process.env.DB_ADMIN_EMAIL;
  const rol = process.env.DB_ADMIN_ROL;
  const password_salt = bcrypt.genSaltSync(saltRounds);
  const password_hash = bcrypt.hashSync(
    process.env.DB_ADMIN_PASS,
    password_salt
  );
  const createAdminUserQuery = `INSERT INTO user (name, email, rol, password_salt, password_hash) VALUES ('${name}', '${email}', ${rol}, '${password_salt}', '${password_hash}')`;
  connection.query(
    "SELECT * FROM user WHERE email = 'admin@admin.com'",
    (err, results) => {
      if (err) {
        console.error("Error checking table records:", err);
        connection.release();
        return;
      }
      const result = results[0];
      if (result && result.email === email) {
        console.log("User Admin already created");
        return;
      }
      connection.query(createAdminUserQuery, (err, result) => {
        if (err) {
          console.error("Error creating user admin:", err);
          connection.release();
          return;
        }

        console.log("User admin created.");
        insertSeeds(connection);
        connection.release();
      });
    }
  );
}

function insertSeeds(connection) {
  connection.query(
    "SELECT COUNT(*) AS count FROM challenge",
    (err, results) => {
      if (err) {
        console.error("Error checking table records:", err);
        connection.release();
        return;
      }

      const count = results[0].count;
      if (count === 0) {
        const insertSeedsQueries = [
          "INSERT INTO challenge (challengecol) VALUES ('Cuenta tu peor experiencia teniendo sexo o toma un shot')",
          "INSERT INTO challenge (challengecol) VALUES ('Enseña una foto de tu mejor polvo')",
          "INSERT INTO challenge (challengecol) VALUES ('Enseña una foto de tu peor polvo')",
          "INSERT INTO challenge (challengecol) VALUES ('Di cuál es tu mayor fantasía sexual o toma un shot')",
          "INSERT INTO challenge (challengecol) VALUES ('Enseña una foto de la persona más hipócrita que conozcas')",
          "INSERT INTO challenge (challengecol) VALUES ('Toman un shot los que han chupado culo')",
          "INSERT INTO challenge (challengecol) VALUES ('Toman un shot los que han hecho un trío')",
          "INSERT INTO challenge (challengecol) VALUES ('Llama a tu ex y no hables hasta que la otra persona cuelgue o toma un shot')",
        ];

        insertSeedsQueries.forEach((query) => {
          connection.query(query, (err) => {
            if (err) {
              console.error("Error inserting seeds:", err);
            } else {
              console.log("Seed inserted.");
            }
          });
        });
      } else {
        console.log("Seeds already inserted");
      }
      connection.release();
    }
  );
}

module.exports = pool;
