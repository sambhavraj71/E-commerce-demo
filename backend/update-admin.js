const mongoose = require('mongoose');
require('dotenv').config();

async function updateAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    const User = require('./src/models/User');
    
    // Update admin role
    const result = await User.updateOne(
      { email: 'admin@textura.com' },
      { 
        role: 'super-admin',
        isVerified: true 
      }
    );
    
    console.log('Update result:', result);
    
    // Verify the update
    const admin = await User.findOne({ email: 'admin@textura.com' });
    console.log('Admin user now has role:', admin.role);
    console.log('Admin email:', admin.email);
    
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAdmin();