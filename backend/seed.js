const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./server'); // Adjust path

const seedUsers = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const users = [
    {
      phone: '0712345678',
      pin: '1234',
      name: 'Felix Mrema',
      role: 'principal'
    },
    {
      phone: '0723456789',
      pin: '1234',
      name: 'Teacher John',
      role: 'teacher',
      classId: 'Form 3A'
    },
    {
      phone: '0734567890',
      pin: '1234',
      name: 'Parent Mary',
      role: 'parent'
    }
  ];

  for (let user of users) {
    const hashedPin = await bcrypt.hash(user.pin, 10);
    await User.create({
      ...user,
      pin: hashedPin
    });
  }

  console.log('Users created!');
  mongoose.disconnect();
};

seedUsers();
