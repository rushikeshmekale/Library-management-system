const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { bookRules, mongoIdRule } = require('../validators/validationRules');
const {
  addBook, getAllBooks, getBookById,
  updateBook, deleteBook, borrowBook, returnBook,
} = require('../controllers/bookController');

router.get('/', protect, getAllBooks);
router.get('/:id', protect, mongoIdRule, getBookById);
router.post('/', protect, requireRole('librarian'), bookRules, addBook);
router.put('/:id', protect, requireRole('librarian'), mongoIdRule, bookRules, updateBook);
router.delete('/:id', protect, requireRole('librarian'), mongoIdRule, deleteBook);
router.post('/:id/borrow', protect, requireRole('member'), mongoIdRule, borrowBook);
router.post('/:id/return', protect, requireRole('member'), mongoIdRule, returnBook);

module.exports = router;
