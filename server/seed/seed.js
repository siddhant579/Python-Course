// Creates ONLY the first admin account. Deliberately does NOT create any
// course/week/topic/lesson content - that all comes from the PDF workflow
// through the admin dashboard, never hardcoded here.
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

async function seed() {
  await connectDB();

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin already exists: ${email}`);
  } else {
    await User.create({
      name: process.env.SEED_ADMIN_NAME || 'Admin',
      email,
      password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'admin',
    });
    console.log(`Admin created: ${email}`);
    console.log('Log in and change the password immediately in production.');
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
