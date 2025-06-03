# BookHaven - Book Store Management Platform

A beautiful, responsive book store management application built with Node.js, Express, and MySQL, deployed using Docker and docker-compose.

## Features

- Book inventory management (add, view, update, delete books)
- Beautiful, responsive user interface with smooth animations
- Book search and filtering capabilities
- Book categorization by genre
- Detailed book view with all information
- Admin dashboard with book statistics
- Docker containerization for easy deployment

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: HTML, CSS, JavaScript
- **Deployment**: Docker, docker-compose

## Project Structure

```
/bookstore
  ├── src/               # Backend source code
  │   ├── app.js         # Main application file
  │   ├── db.js          # Database connection
  │   └── routes/        # API routes
  ├── public/            # Frontend assets
  │   ├── index.html     # Main HTML file
  │   ├── styles.css     # CSS styles
  │   └── script.js      # Frontend JavaScript
  ├── Dockerfile         # Docker configuration for Node.js app
  ├── docker-compose.yml # Multi-container Docker configuration
  └── init.sql           # Initial database setup
```

## Deployment Instructions

### Prerequisites

- Docker and docker-compose installed on your system
- Git for cloning the repository

### Step-by-Step Deployment

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/bookstore-management.git
cd bookstore-management
```

2. **Build and start the containers**

```bash
docker-compose up -d
```

This command will:
- Build the Node.js application container
- Pull the MySQL container image
- Create a bridge network for the containers
- Set up volumes for data persistence
- Start all services defined in docker-compose.yml

3. **Access the application**

Open your browser and go to:
```
http://localhost:9999
```

4. **Stop the containers**

When you want to stop the application:
```bash
docker-compose down
```

To remove all data volumes (this will delete all book and genre data):
```bash
docker-compose down -v
```

## MySQL Database Access

### Accessing MySQL from command line

To connect to the MySQL database from the command line:

```bash
docker exec -it bookstore-management_mysql_1 mysql -ubookstore_user -pbookstore_password bookstore_db
```

### Useful MySQL Commands

Once connected to MySQL, you can use these commands:

```sql
-- List all tables
SHOW TABLES;

-- View all books
SELECT * FROM books;

-- View all genres
SELECT * FROM genres;

-- View books with their genre names
SELECT b.*, g.name as genre_name 
FROM books b 
LEFT JOIN genres g ON b.genre_id = g.id;

-- Find books by a specific author
SELECT * FROM books WHERE author LIKE '%Tolkien%';

-- Find books in a specific price range
SELECT * FROM books WHERE price BETWEEN 10 AND 15;

-- Add a new genre
INSERT INTO genres (name) VALUES ('Fantasy');

-- Update a book's price
UPDATE books SET price = 17.99 WHERE id = 1;
```

## Customization

### Changing the port

If you want to run the application on a different port, modify the `docker-compose.yml` file:

```yaml
services:
  app:
    ports:
      - "YOUR_DESIRED_PORT:9999"
```

### Database credentials

To change the database credentials, update both the `docker-compose.yml` and `.env` files with your preferred values.

## Troubleshooting

### Container not starting

Check the logs to see any errors:
```bash
docker-compose logs
```

### Database connection issues

Ensure the MySQL container is running:
```bash
docker ps
```

Check if the database was initialized properly:
```bash
docker exec -it bookstore-management_mysql_1 mysql -uroot -proot_password -e "SHOW DATABASES;"
```

## License

This project is licensed under the MIT License.