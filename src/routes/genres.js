const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all genres
router.get('/', async (req, res) => {
  try {
    const genres = await db.query('SELECT * FROM genres ORDER BY name');
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching genres', error: error.message });
  }
});

// Get a single genre with its books
router.get('/:id', async (req, res) => {
  try {
    const [genre] = await db.query('SELECT * FROM genres WHERE id = ?', [req.params.id]);
    
    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }
    
    const books = await db.query(`
      SELECT * FROM books 
      WHERE genre_id = ? 
      ORDER BY title
    `, [req.params.id]);
    
    res.json({
      ...genre,
      books
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching genre', error: error.message });
  }
});

// Add a new genre
router.post('/', async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Genre name is required' });
  }
  
  try {
    const result = await db.query('INSERT INTO genres (name) VALUES (?)', [name]);
    const [newGenre] = await db.query('SELECT * FROM genres WHERE id = ?', [result.insertId]);
    
    res.status(201).json(newGenre);
  } catch (error) {
    // Check for duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Genre already exists' });
    }
    res.status(500).json({ message: 'Error creating genre', error: error.message });
  }
});

// Update a genre
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Genre name is required' });
  }
  
  try {
    // Check if genre exists
    const [genre] = await db.query('SELECT * FROM genres WHERE id = ?', [req.params.id]);
    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }
    
    await db.query('UPDATE genres SET name = ? WHERE id = ?', [name, req.params.id]);
    const [updatedGenre] = await db.query('SELECT * FROM genres WHERE id = ?', [req.params.id]);
    
    res.json(updatedGenre);
  } catch (error) {
    // Check for duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Genre already exists' });
    }
    res.status(500).json({ message: 'Error updating genre', error: error.message });
  }
});

// Delete a genre
router.delete('/:id', async (req, res) => {
  try {
    // Check if genre exists
    const [genre] = await db.query('SELECT * FROM genres WHERE id = ?', [req.params.id]);
    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }
    
    // Check if there are books with this genre
    const books = await db.query('SELECT COUNT(*) as count FROM books WHERE genre_id = ?', [req.params.id]);
    if (books[0].count > 0) {
      // Update books to have no genre instead of deleting them
      await db.query('UPDATE books SET genre_id = NULL WHERE genre_id = ?', [req.params.id]);
    }
    
    await db.query('DELETE FROM genres WHERE id = ?', [req.params.id]);
    res.json({ message: 'Genre deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting genre', error: error.message });
  }
});

module.exports = router;