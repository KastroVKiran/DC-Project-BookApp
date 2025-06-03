document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const booksContainer = document.getElementById('books-container');
  const genreList = document.getElementById('genre-list');
  const currentViewTitle = document.getElementById('current-view-title');
  const emptyState = document.getElementById('empty-state');
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  
  // Modals
  const bookModal = document.getElementById('book-modal');
  const genreModal = document.getElementById('genre-modal');
  const bookDetailsModal = document.getElementById('book-details-modal');
  const confirmModal = document.getElementById('confirm-modal');
  
  // Buttons
  const addBookBtn = document.getElementById('add-book-btn');
  const emptyAddBookBtn = document.getElementById('empty-add-book-btn');
  const addGenreBtn = document.getElementById('add-genre-btn');
  const viewButtons = document.querySelectorAll('.view-btn');
  
  // Form Elements
  const bookForm = document.getElementById('book-form');
  const genreForm = document.getElementById('genre-form');
  const bookGenreSelect = document.getElementById('book-genre');
  const bookCoverInput = document.getElementById('book-cover');
  const coverPreview = document.getElementById('cover-preview');
  
  // State
  let currentGenre = 'all';
  let currentView = 'grid';
  let books = [];
  let genres = [];
  let currentBookId = null;
  let currentGenreId = null;

  // API Endpoints
  const API = {
    books: '/api/books',
    genres: '/api/genres'
  };

  // Initialization
  init();

  // Functions
  function init() {
    loadGenres();
    loadBooks();
    setupEventListeners();
  }

  function setupEventListeners() {
    // Add book button
    addBookBtn.addEventListener('click', openAddBookModal);
    emptyAddBookBtn.addEventListener('click', openAddBookModal);
    
    // Add genre button
    addGenreBtn.addEventListener('click', openAddGenreModal);
    
    // Form submissions
    bookForm.addEventListener('submit', handleBookFormSubmit);
    genreForm.addEventListener('submit', handleGenreFormSubmit);
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });
    
    document.getElementById('cancel-book-btn').addEventListener('click', closeAllModals);
    document.getElementById('cancel-genre-btn').addEventListener('click', closeAllModals);
    document.getElementById('cancel-confirm-btn').addEventListener('click', closeAllModals);
    
    // View toggles
    viewButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        setView(this.dataset.view);
      });
    });
    
    // Book details
    document.getElementById('edit-book-btn').addEventListener('click', handleEditBookClick);
    document.getElementById('delete-book-btn').addEventListener('click', handleDeleteBookClick);
    
    // Confirmation actions
    document.getElementById('confirm-action-btn').addEventListener('click', handleConfirmAction);
    
    // Book cover preview
    bookCoverInput.addEventListener('input', updateCoverPreview);
    
    // Search
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
      if (e.target === bookModal || e.target === genreModal || 
          e.target === bookDetailsModal || e.target === confirmModal) {
        closeAllModals();
      }
    });
  }

  async function loadBooks(genreId = 'all', searchTerm = '') {
    showLoading();
    
    try {
      let url = API.books;
      
      if (searchTerm) {
        url = `${API.books}/search/${searchTerm}`;
      } else if (genreId !== 'all') {
        url = `${API.genres}/${genreId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      let data = await response.json();
      
      // Handle the different response formats
      if (genreId !== 'all' && genreId !== 'search' && genreId !== currentGenre) {
        books = data.books || [];
        currentViewTitle.textContent = data.name || 'Books';
      } else {
        books = data || [];
        currentViewTitle.textContent = searchTerm ? `Search: "${searchTerm}"` : 'All Books';
      }
      
      renderBooks();
    } catch (error) {
      showToast('Error loading books', error.message, 'error');
      console.error('Error loading books:', error);
      hideLoading();
      showEmptyState();
    }
  }

  async function loadGenres() {
    try {
      const response = await fetch(API.genres);
      
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      
      genres = await response.json();
      renderGenres();
      populateGenreSelect();
    } catch (error) {
      showToast('Error loading genres', error.message, 'error');
      console.error('Error loading genres:', error);
    }
  }

  function renderBooks() {
    hideLoading();
    
    if (!books.length) {
      showEmptyState();
      return;
    }
    
    hideEmptyState();
    booksContainer.innerHTML = '';
    booksContainer.className = currentView === 'grid' ? 'books-grid' : 'books-list';
    
    books.forEach(book => {
      if (currentView === 'grid') {
        booksContainer.appendChild(createBookCard(book));
      } else {
        booksContainer.appendChild(createBookListItem(book));
      }
    });
  }

  function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.id = book.id;
    
    const defaultCover = 'https://images.pexels.com/photos/1005324/literature-book-open-pages-1005324.jpeg';
    
    card.innerHTML = `
      <div class="book-cover">
        <img src="${book.cover_image || defaultCover}" alt="${book.title}" onerror="this.src='${defaultCover}'">
      </div>
      <div class="book-info">
        <div class="book-title">${book.title}</div>
        <div class="book-author">${book.author}</div>
        <div class="book-price">$${parseFloat(book.price).toFixed(2)}</div>
        ${book.genre_name ? `<div class="book-genre">${book.genre_name}</div>` : ''}
      </div>
    `;
    
    card.addEventListener('click', () => openBookDetails(book));
    
    return card;
  }

  function createBookListItem(book) {
    const item = document.createElement('div');
    item.className = 'book-list-item';
    item.dataset.id = book.id;
    
    const defaultCover = 'https://images.pexels.com/photos/1005324/literature-book-open-pages-1005324.jpeg';
    
    item.innerHTML = `
      <div class="book-list-cover">
        <img src="${book.cover_image || defaultCover}" alt="${book.title}" onerror="this.src='${defaultCover}'">
      </div>
      <div class="book-list-info">
        <div class="book-list-title">${book.title}</div>
        <div class="book-list-author">by ${book.author}</div>
        <div class="book-list-meta">
          ${book.genre_name ? `<span>${book.genre_name}</span>` : ''}
          ${book.isbn ? `<span>ISBN: ${book.isbn}</span>` : ''}
          <span>Stock: ${book.stock || 0}</span>
        </div>
      </div>
      <div class="book-list-price">$${parseFloat(book.price).toFixed(2)}</div>
    `;
    
    item.addEventListener('click', () => openBookDetails(book));
    
    return item;
  }

  function renderGenres() {
    // Keep the "All Books" item
    genreList.innerHTML = `
      <li class="genre-item ${currentGenre === 'all' ? 'active' : ''}" data-id="all">All Books</li>
    `;
    
    genres.forEach(genre => {
      const item = document.createElement('li');
      item.className = `genre-item ${currentGenre === genre.id ? 'active' : ''}`;
      item.dataset.id = genre.id;
      item.textContent = genre.name;
      
      item.addEventListener('click', function() {
        document.querySelectorAll('.genre-item').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        currentGenre = this.dataset.id;
        loadBooks(currentGenre);
      });
      
      genreList.appendChild(item);
    });
  }

  function populateGenreSelect() {
    bookGenreSelect.innerHTML = '<option value="">Select Genre</option>';
    
    genres.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre.id;
      option.textContent = genre.name;
      bookGenreSelect.appendChild(option);
    });
  }

  function openAddBookModal() {
    bookForm.reset();
    document.getElementById('modal-title').textContent = 'Add New Book';
    document.getElementById('book-id').value = '';
    coverPreview.classList.add('hidden');
    currentBookId = null;
    openModal(bookModal);
  }

  function openEditBookModal(book) {
    document.getElementById('modal-title').textContent = 'Edit Book';
    document.getElementById('book-id').value = book.id;
    document.getElementById('book-title').value = book.title;
    document.getElementById('book-author').value = book.author;
    document.getElementById('book-price').value = book.price;
    document.getElementById('book-genre').value = book.genre_id || '';
    document.getElementById('book-isbn').value = book.isbn || '';
    document.getElementById('book-published-date').value = book.published_date ? new Date(book.published_date).toISOString().split('T')[0] : '';
    document.getElementById('book-description').value = book.description || '';
    document.getElementById('book-cover').value = book.cover_image || '';
    document.getElementById('book-stock').value = book.stock || 0;
    
    currentBookId = book.id;
    
    if (book.cover_image) {
      coverPreview.src = book.cover_image;
      coverPreview.classList.remove('hidden');
    } else {
      coverPreview.classList.add('hidden');
    }
    
    openModal(bookModal);
  }

  function openAddGenreModal() {
    genreForm.reset();
    document.getElementById('genre-modal-title').textContent = 'Add New Genre';
    document.getElementById('genre-id').value = '';
    currentGenreId = null;
    openModal(genreModal);
  }

  function openEditGenreModal(genre) {
    document.getElementById('genre-modal-title').textContent = 'Edit Genre';
    document.getElementById('genre-id').value = genre.id;
    document.getElementById('genre-name').value = genre.name;
    currentGenreId = genre.id;
    openModal(genreModal);
  }

  function openBookDetails(book) {
    document.getElementById('details-book-title').textContent = book.title;
    document.getElementById('details-author').textContent = book.author;
    document.getElementById('details-genre').textContent = book.genre_name || 'Uncategorized';
    document.getElementById('details-isbn').textContent = book.isbn || 'N/A';
    document.getElementById('details-published-date').textContent = book.published_date ? new Date(book.published_date).toLocaleDateString() : 'N/A';
    document.getElementById('details-stock').textContent = book.stock || 0;
    document.getElementById('details-price').textContent = parseFloat(book.price).toFixed(2);
    document.getElementById('details-description').textContent = book.description || 'No description available.';
    
    const defaultCover = 'https://images.pexels.com/photos/1005324/literature-book-open-pages-1005324.jpeg';
    const detailsCover = document.getElementById('details-cover');
    detailsCover.src = book.cover_image || defaultCover;
    detailsCover.onerror = function() {
      this.src = defaultCover;
    };
    
    currentBookId = book.id;
    
    openModal(bookDetailsModal);
  }

  function openConfirmModal(title, message, callback) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-action-btn').onclick = callback;
    openModal(confirmModal);
  }

  function openModal(modal) {
    closeAllModals();
    modal.classList.add('show');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('show');
    });
  }

  async function handleBookFormSubmit(e) {
    e.preventDefault();
    
    const bookData = {
      title: document.getElementById('book-title').value,
      author: document.getElementById('book-author').value,
      price: document.getElementById('book-price').value,
      genre_id: document.getElementById('book-genre').value || null,
      isbn: document.getElementById('book-isbn').value || null,
      published_date: document.getElementById('book-published-date').value || null,
      description: document.getElementById('book-description').value || null,
      cover_image: document.getElementById('book-cover').value || null,
      stock: document.getElementById('book-stock').value || 0
    };
    
    try {
      let response;
      let method;
      let url = API.books;
      
      if (currentBookId) {
        url = `${API.books}/${currentBookId}`;
        method = 'PUT';
      } else {
        method = 'POST';
      }
      
      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save book');
      }
      
      const savedBook = await response.json();
      
      closeAllModals();
      showToast(
        currentBookId ? 'Book Updated' : 'Book Added', 
        `"${savedBook.title}" has been ${currentBookId ? 'updated' : 'added'} successfully.`,
        'success'
      );
      
      loadBooks(currentGenre);
    } catch (error) {
      showToast('Error saving book', error.message, 'error');
      console.error('Error saving book:', error);
    }
  }

  async function handleGenreFormSubmit(e) {
    e.preventDefault();
    
    const genreName = document.getElementById('genre-name').value;
    
    if (!genreName) {
      showToast('Validation Error', 'Genre name is required', 'error');
      return;
    }
    
    try {
      let response;
      let method;
      let url = API.genres;
      
      if (currentGenreId) {
        url = `${API.genres}/${currentGenreId}`;
        method = 'PUT';
      } else {
        method = 'POST';
      }
      
      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: genreName })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save genre');
      }
      
      const savedGenre = await response.json();
      
      closeAllModals();
      showToast(
        currentGenreId ? 'Genre Updated' : 'Genre Added', 
        `"${savedGenre.name}" has been ${currentGenreId ? 'updated' : 'added'} successfully.`,
        'success'
      );
      
      loadGenres();
    } catch (error) {
      showToast('Error saving genre', error.message, 'error');
      console.error('Error saving genre:', error);
    }
  }

  function handleEditBookClick() {
    const bookToEdit = books.find(book => book.id === currentBookId);
    if (bookToEdit) {
      closeAllModals();
      openEditBookModal(bookToEdit);
    }
  }

  function handleDeleteBookClick() {
    const bookToDelete = books.find(book => book.id === currentBookId);
    if (bookToDelete) {
      openConfirmModal(
        'Delete Book', 
        `Are you sure you want to delete "${bookToDelete.title}"? This action cannot be undone.`,
        deleteBook
      );
    }
  }

  async function deleteBook() {
    try {
      const response = await fetch(`${API.books}/${currentBookId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete book');
      }
      
      closeAllModals();
      showToast('Book Deleted', 'The book has been deleted successfully.', 'success');
      loadBooks(currentGenre);
    } catch (error) {
      showToast('Error deleting book', error.message, 'error');
      console.error('Error deleting book:', error);
    }
  }

  function handleConfirmAction() {
    // This is a placeholder - the actual action is assigned in openConfirmModal
  }

  function updateCoverPreview() {
    const coverUrl = bookCoverInput.value;
    
    if (coverUrl) {
      coverPreview.src = coverUrl;
      coverPreview.onload = function() {
        coverPreview.classList.remove('hidden');
      };
      coverPreview.onerror = function() {
        coverPreview.classList.add('hidden');
      };
    } else {
      coverPreview.classList.add('hidden');
    }
  }

  function handleSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
      currentGenre = 'search';
      document.querySelectorAll('.genre-item').forEach(el => el.classList.remove('active'));
      loadBooks('search', searchTerm);
    } else {
      // If search is empty, go back to all books
      currentGenre = 'all';
      document.querySelector('.genre-item[data-id="all"]').classList.add('active');
      loadBooks();
    }
  }

  function setView(view) {
    currentView = view;
    
    viewButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    renderBooks();
  }

  function showLoading() {
    booksContainer.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading books...</p>
      </div>
    `;
    hideEmptyState();
  }

  function hideLoading() {
    const spinner = booksContainer.querySelector('.loading-spinner');
    if (spinner) {
      spinner.remove();
    }
  }

  function showEmptyState() {
    emptyState.classList.remove('hidden');
    booksContainer.classList.add('hidden');
  }

  function hideEmptyState() {
    emptyState.classList.add('hidden');
    booksContainer.classList.remove('hidden');
  }

  function showToast(title, message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon;
    switch (type) {
      case 'success': icon = 'check-circle'; break;
      case 'error': icon = 'exclamation-circle'; break;
      case 'warning': icon = 'exclamation-triangle'; break;
      default: icon = 'info-circle';
    }
    
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas fa-${icon}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">&times;</button>
    `;
    
    toast.querySelector('.toast-close').addEventListener('click', function() {
      toast.remove();
    });
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
});