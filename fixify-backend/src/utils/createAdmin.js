const User = require('../models/User');
const connectDB = require('../config/db');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@fixify.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@fixify.com',
      phone: '09000000000',
      password: 'admin123', // Will be hashed automatically by pre-save hook
      role: 'admin'
    });

    console.log('✅ Admin user created successfully');
    console.log('Email: admin@fixify.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();