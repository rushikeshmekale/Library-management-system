const { validationResult } = require('express-validator');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');

const addBook = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const { title, author, isbn, category, quantity } = req.body;
    const exists = await Book.findOne({ isbn });
    if (exists) return res.status(400).json({ success: false, message: 'ISBN already exists' });

    const book = await Book.create({
      title, author, isbn,
      category: category || '',
      quantity,
      availableQuantity: quantity,
    });
    res.status(201).json({ success: true, book });
  } catch (err) { next(err); }
};

const getAllBooks = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }
    const books = await Book.find(filter)
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, books });
  } catch (err) { next(err); }
};

const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, book });
  } catch (err) { next(err); }
};

const updateBook = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const { title, author, isbn, category, quantity } = req.body;
    const diff = quantity - book.quantity;

    book.title = title ?? book.title;
    book.author = author ?? book.author;
    book.isbn = isbn ?? book.isbn;
    book.category = category !== undefined ? category : book.category;
    book.quantity = quantity ?? book.quantity;
    book.availableQuantity = Math.max(0, book.availableQuantity + diff);

    await book.save();
    res.json({ success: true, book });
  } catch (err) { next(err); }
};

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book deleted' });
  } catch (err) { next(err); }
};

const borrowBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.availableQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Book is currently unavailable.' });
    }

    const alreadyBorrowed = await Borrow.findOne({
      memberId: req.user._id,
      bookId: book._id,
      status: 'borrowed',
    });
    if (alreadyBorrowed) {
      return res.status(400).json({ success: false, message: 'You already have this book borrowed.' });
    }

    const record = await Borrow.create({ memberId: req.user._id, bookId: book._id });
    book.availableQuantity -= 1;
    await book.save();

    res.status(201).json({ success: true, record });
  } catch (err) { next(err); }
};

const returnBook = async (req, res, next) => {
  try {
    const record = await Borrow.findOne({
      memberId: req.user._id,
      bookId: req.params.id,
      status: 'borrowed',
    });
    if (!record) {
      return res.status(400).json({ success: false, message: 'No active borrow found for this book.' });
    }

    record.status = 'returned';
    record.returnDate = new Date();
    await record.save();

    const book = await Book.findById(req.params.id);
    if (book) { book.availableQuantity += 1; await book.save(); }

    res.json({ success: true, record });
  } catch (err) { next(err); }
};

module.exports = { addBook, getAllBooks, getBookById, updateBook, deleteBook, borrowBook, returnBook };
