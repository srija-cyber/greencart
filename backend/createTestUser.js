import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from './config.js';
import User from './models/User.js';

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const createTestUser = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ username: 'admin' });
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const testUser = new User({
      username: 'admin',
      email: 'admin@greencart.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await testUser.save();
    console.log('Test user created successfully:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the function
createTestUser();
