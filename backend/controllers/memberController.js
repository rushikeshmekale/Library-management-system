const User = require('../models/User');
const Borrow = require('../models/Borrow');

const getAllMembers = async (req, res, next) => {
  try {
    const members = await User.find({ role: 'member' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, members });
  } catch (err) { next(err); }
};

const deleteMember = async (req, res, next) => {
  try {
    const member = await User.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, message: 'Member deleted' });
  } catch (err) { next(err); }
};

const getMyBooks = async (req, res, next) => {
  try {
    const records = await Borrow.find({ memberId: req.user._id })
      .populate('bookId', 'title author isbn category')
      .sort({ borrowDate: -1 });
    res.json({ success: true, records });
  } catch (err) { next(err); }
};

const getAllBorrows = async (req, res, next) => {
  try {
    const records = await Borrow.find()
      .populate('bookId', 'title author isbn')
      .populate('memberId', 'name email')
      .sort({ borrowDate: -1 });
    res.json({ success: true, records });
  } catch (err) { next(err); }
};

module.exports = { getAllMembers, deleteMember, getMyBooks, getAllBorrows };
