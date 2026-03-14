const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  pin: { type: String, required: true }, // Will be hashed
  name: String,
  role: { 
    type: String, 
    enum: ['principal', 'teacher', 'parent'],
    default: 'parent'
  },
  classId: String, // for teachers
  childrenIds: [String], // for parents
  createdAt: { type: Date, default: Date.now }
});

// Hash PIN before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('pin')) {
    this.pin = await bcrypt.hash(this.pin, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

// Student Schema
const studentSchema = new mongoose.Schema({
  name: String,
  class: String,
  parentPhone: String, // Link to parent via phone
  balance: { type: Number, default: 0 },
  payments: [{
    amount: Number,
    date: Date,
    method: String,
    receiptNo: String
  }]
});

const Student = mongoose.model('Student', studentSchema);

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    
    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: 'Namba ya simu haipo / Phone not registered' });
    }
    
    // Check PIN
    const isValid = await bcrypt.compare(pin, user.pin);
    if (!isValid) {
      return res.status(401).json({ error: 'PIN si sahihi / Wrong PIN' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' }
    );
    
    // Get role-specific data
    let dashboardData = {};
    
    if (user.role === 'principal') {
      // Get all stats
      const students = await Student.countDocuments();
      const paid = await Student.aggregate([
        { $group: { _id: null, total: { $sum: "$payments.amount" } } }
      ]);
      dashboardData = {
        totalStudents: students,
        totalCollected: paid[0]?.total || 0
      };
    } else if (user.role === 'teacher') {
      // Get their class only
      const students = await Student.find({ class: user.classId });
      dashboardData = { students };
    } else if (user.role === 'parent') {
      // Get their children only
      const students = await Student.find({ parentPhone: user.phone });
      dashboardData = { students };
    }
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role
      },
      dashboard: dashboardData
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register new user (for admin use)
app.post('/api/register', async (req, res) => {
  try {
    const { phone, pin, name, role, classId, childrenIds } = req.body;
    
    // Check if user exists
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: 'Namba tayari ipo / Phone already registered' });
    }
    
    const user = new User({
      phone,
      pin, // Will be hashed by pre-save hook
      name,
      role,
      classId,
      childrenIds
    });
    
    await user.save();
    res.json({ success: true, message: 'User registered' });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
