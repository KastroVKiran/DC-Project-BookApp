const mysql = require('mysql2/promise');

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'bookstore_user',
  password: process.env.DB_PASSWORD || 'bookstore_password',
  database: process.env.DB_NAME || 'bookstore_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database with required tables
async function initializeDatabase() {
  try {
    // Test connection
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');
    
    // Create tables if they don't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS genres (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        genre_id INT,
        price DECIMAL(10, 2) NOT NULL,
        isbn VARCHAR(20),
        published_date DATE,
        description TEXT,
        cover_image VARCHAR(255),
        stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE SET NULL
      )
    `);
    
    // Insert some default genres if the table is empty
    const [genres] = await connection.query('SELECT COUNT(*) as count FROM genres');
    if (genres[0].count === 0) {
      await connection.query(`
        INSERT INTO genres (name) VALUES 
        ('Fiction'), 
        ('Non-Fiction'), 
        ('Science Fiction'), 
        ('Mystery'), 
        ('Biography'), 
        ('History'), 
        ('Self-Help'), 
        ('Business'), 
        ('Children')
      `);
      console.log('Default genres added');
    }
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Function to query the database and handle errors
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = {
  query,
  initializeDatabase,
  pool
};