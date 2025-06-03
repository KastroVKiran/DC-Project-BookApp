-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS bookstore_db;
USE bookstore_db;

-- Create genres table
CREATE TABLE IF NOT EXISTS genres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create books table
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
);

-- Insert default genres
INSERT INTO genres (name) VALUES 
('Fiction'), 
('Non-Fiction'), 
('Science Fiction'), 
('Mystery'), 
('Biography'), 
('History'), 
('Self-Help'), 
('Business'), 
('Children');

-- Insert sample books
INSERT INTO books (title, author, genre_id, price, isbn, published_date, description, cover_image, stock) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 1, 12.99, '9780743273565', '1925-04-10', 'A novel of the Jazz Age, The Great Gatsby follows a cast of characters living in the fictional towns of West Egg and East Egg on Long Island.', 'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg', 25),
('To Kill a Mockingbird', 'Harper Lee', 1, 14.99, '9780061120084', '1960-07-11', 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.', 'https://images.pexels.com/photos/762687/pexels-photo-762687.jpeg', 18),
('1984', 'George Orwell', 3, 10.99, '9780451524935', '1949-06-08', 'A dystopian novel set in a totalitarian society ruled by the Party, who employ the Thought Police to persecute individuality and independent thinking.', 'https://images.pexels.com/photos/3747139/pexels-photo-3747139.jpeg', 15),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 2, 19.99, '9780062316097', '2014-02-10', 'A book that explores the history of humankind from the evolution of archaic human species in the Stone Age up to the twenty-first century.', 'https://images.pexels.com/photos/2098707/pexels-photo-2098707.jpeg', 12),
('The Hobbit', 'J.R.R. Tolkien', 3, 15.99, '9780547928227', '1937-09-21', 'A fantasy novel about the adventures of a reluctant hero, a powerful wizard, and a treasure-seeking band of dwarves.', 'https://images.pexels.com/photos/3025112/pexels-photo-3025112.jpeg', 22);