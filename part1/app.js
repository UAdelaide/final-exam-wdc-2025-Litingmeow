var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

const dogsRouter = require('./routes/dogs');
const walkRequestsRouter = require('./routes/walkrequests');
const walkersRouter = require('./routes/walkers');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/dogs', dogsRouter);
app.use('/api/walkers', walkersRouter);
app.use('/api/walkrequests', walkRequestsRouter);

let db;

(async () => {
  try {
    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '' // Set your MySQL root password
    });

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await connection.end();

    // Now connect to the created database
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });

    // Create a table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS Users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('owner', 'walker') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert data if table is empty
    const [rows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
    if (users[0].count === 0) {
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES
        ('alice123', 'alice@example.com', 'hashed123', 'owner'),
        ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
        ('carol123', 'carol@example.com', 'hashed789', 'owner'),
        ('amy456', 'amy@example.com', 'hashed999', 'walker'),
        ('emilyowner', 'emily@example.com', 'hashed888', 'owner');
      `);
    }

    //Intert dogs to test
    const [dogs] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
    if (dogs[0].count === 0) {
      console.log('No dogs found, inserting test data...');
      await db.execute(`
        INSERT INTO Dogs (owner_id, name, size) VALUES
        ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
        ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
        ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Rocky', 'large'),
        ((SELECT user_id FROM Users WHERE username = 'emilyowner'), 'David', 'medium'),
        ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Toby', 'small');
  `);
}
  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

// Route to return it as JSON
app.get('/', async (req, res) => {
  try {
    const [dogs] = await db.execute(`
      SELECT Dogs.dog_id, Dogs.name, Dogs.size, Users.username AS owner
      FROM Dogs
      JOIN Users ON Dogs.owner_id = Users.user_id
      `);
    res.json(dogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;