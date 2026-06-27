require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.DATABASE_URL);
  const existing = await User.findOne({ email: 'admin@library.com' });
  if (existing) {
    console.log('Librarian already exists: admin@library.com');
    process.exit(0);
  }
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin Librarian',
    email: 'admin@library.com',
    password: hashedPassword,
    role: 'librarian',
  });
  console.log('✅ Librarian created!');
  console.log('   Email:    admin@library.com');
  console.log('   Password: admin123');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
