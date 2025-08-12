const express = require('express');
const fs = require('fs').promises;
const EventEmitter = require('events');
const path = require('path');

const app = express();
app.use(express.json()); // For parsing JSON request body

// Event emitter setup
class BookEmitter extends EventEmitter {}
const bookEmitter = new BookEmitter();

// Log events
bookEmitter.on('Book Added', (book) => {
  console.log(`Book Added: ${book.title}`);
});
bookEmitter.on('Book Updated', (book) => {
  console.log(`Book Updated: ${book.title}`);
});
bookEmitter.on('Book Deleted', (id) => {
  console.log(`Book Deleted with ID: ${id}`);
});

// File path for book storage
const filePath = path.join(__dirname, 'books.json');

// Helper: Read books
async function readBooks() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

// Helper: Write books
async function writeBooks(books) {
  await fs.writeFile(filePath, JSON.stringify(books, null, 2));
}

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Book Management API');
});

// Get all books
app.get('/books', async (req, res) => {
  const books = await readBooks();
  res.json(books);
});

// Add new book
app.post('/books', async (req, res) => {
  const books = await readBooks();
  const newBook = { id: Date.now().toString(), ...req.body };
  books.push(newBook);
  await writeBooks(books);
  bookEmitter.emit('Book Added', newBook);
  res.status(201).json(newBook);
});

// Update book
app.put('/books/:id', async (req, res) => {
  const books = await readBooks();
  const index = books.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).send('Book not found');

  books[index] = { ...books[index], ...req.body };
  await writeBooks(books);
  bookEmitter.emit('Book Updated', books[index]);
  res.json(books[index]);
});

// Delete book
app.delete('/books/:id', async (req, res) => {
  const books = await readBooks();
  const index = books.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).send('Book not found');

  const deletedBook = books.splice(index, 1)[0];
  await writeBooks(books);
  bookEmitter.emit('Book Deleted', req.params.id);
  res.json(deletedBook);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
