const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const booksRoutes = require('./routes/books');
const genresRoutes = require('./routes/genres');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 9999;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/books', booksRoutes);
app.use('/api/genres', genresRoutes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server after database connection is established
db.initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Visit http://localhost:${PORT} to access the Book Store Management app`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });