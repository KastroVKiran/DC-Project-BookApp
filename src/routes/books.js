const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await db.query(`
      SELECT b.*, g.name as genre_name
      FROM books b
      LEFT JOIN genres g ON b.genre_id = g.id
      ORDER BY b.created_at DESC
    `);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
});

// Get a single book by ID
router.get('/:id', async (req, res) => {
  try {
    const [book] = await db.query(`
      SELECT b.*, g.name as genre_name
      FROM books b
      LEFT JOIN genres g ON b.genre_id = g.id
      WHERE b.id = ?
    `, [req.params.id]);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book', error: error.message });
  }
});

// Add a new book
router.post('/', async (req, res) => {
  const { 
    title, 
    author, 
    genre_id, 
    price, 
    isbn, 
    published_date, 
    description, 
    cover_image, 
    stock 
  } = req.body;
  
  if (!title || !author || !price) {
    return res.status(400).json({ message: 'Title, author, and price are required' });
  }
  
  try {
    const result = await db.query(`
      INSERT INTO books (
        title, author, genre_id, price, isbn, 
        published_date, description, cover_image, stock
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, author, genre_id || null, price, isbn || null, 
      published_date || null, description || null, cover_image || null, stock || 0
    ]);
    
    const newBookId = result.insertId;
    const [newBook] = await db.query('SELECT * FROM books WHERE id = ?', [newBookId]);
    
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: 'Error creating book', error: error.message });
  }
});

// Update a book
router.put('/:id', async (req, res) => {
  const { 
    title, 
    author, 
    genre_id, 
    price, 
    isbn, 
    published_date, 
    description, 
    cover_image, 
    stock 
  } = req.body;
  
  try {
    // Check if book exists
    const [book] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    await db.query(`
      UPDATE books SET
        title = ?,
        author = ?,
        genre_id = ?,
        price = ?,
        isbn = ?,
        published_date = ?,
        description = ?,
        cover_image = ?,
        stock = ?
      WHERE id = ?
    `, [
      title || book.title,
      author || book.author,
      genre_id !== undefined ? genre_id : book.genre_id,
      price || book.price,
      isbn !== undefined ? isbn : book.isbn,
      published_date || book.published_date,
      description !== undefined ? description : book.description,
      cover_image !== undefined ? cover_image : book.cover_image,
      stock !== undefined ? stock : book.stock,
      req.params.id
    ]);
    
    const [updatedBook] = await db.query(`
      SELECT b.*, g.name as genre_name
      FROM books b
      LEFT JOIN genres g ON b.genre_id = g.id
      WHERE b.id = ?
    `, [req.params.id]);
    
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    // Check if book exists
    const [book] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book', error: error.message });
  }
});

// Search books
router.get('/search/:term', async (req, res) => {
  const { term } = req.params;
  
  try {
    const books = await db.query(`
      SELECT b.*, g.name as genre_name
      FROM books b
      LEFT JOIN genres g ON b.genre_id = g.id
      WHERE 
        b.title LIKE ? OR 
        b.author LIKE ? OR 
        b.isbn LIKE ? OR
        g.name LIKE ?
      ORDER BY b.title
    `, [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]);
    
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error searching books', error: error.message });
  }
});

module.exports = router;