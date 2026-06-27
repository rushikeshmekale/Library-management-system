const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { mongoIdRule } = require('../validators/validationRules');
const { getAllMembers, deleteMember, getMyBooks, getAllBorrows } = require('../controllers/memberController');

// Member routes
router.get('/me/books', protect, requireRole('member'), getMyBooks);

// Librarian routes
router.get('/', protect, requireRole('librarian'), getAllMembers);
router.get('/all-borrows', protect, requireRole('librarian'), getAllBorrows);
router.delete('/:id', protect, requireRole('librarian'), mongoIdRule, deleteMember);

module.exports = router;
