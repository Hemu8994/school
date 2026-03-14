const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

// Login with phone and PIN
router.post('/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: 'Namba ya simu haipo / Phone not registered' });
    }

    // Check PIN
    const isValid = await user.comparePin(pin);
    if (!isValid) {
      return res.status(401).json({ error: 'PIN si sahihi / Wrong PIN' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id, 
        phone: user.phone, 
        role: user.role,
        fullName: user.fullName
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Get role-specific data
    let dashboardData = {};

    if (user.role === 'principal' || user.role === 'admin') {
      const students = await Student.countDocuments({ isActive: true });
      const transactions = await Transaction.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      dashboardData = {
        totalStudents: students,
        totalCollected: transactions[0]?.total || 0,
        recentTransactions: await Transaction.find()
          .sort({ transactionDate: -1 })
          .limit(10)
      };
    } else if (user.role === 'teacher' && user.classId) {
      dashboardData.students = await Student.find({ 
        className: user.classId,
        isActive: true 
      });
    } else if (user.role === 'parent') {
      dashboardData.students = await Student.find({ 
        parentPhone: user.phone,
        isActive: true 
      });
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.fullName,
        phone: user.phone,
        role: user.role
      },
      dashboard: dashboardData
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register new user (admin only - protect this route)
router.post('/register', async (req, res) => {
  try {
    const { phone, pin, fullName, role, classId, studentIds } = req.body;

    // Check if user exists
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: 'Phone already registered' });
    }

    const user = new User({
      phone,
      pin,
      fullName,
      role,
      classId,
      studentIds
    });

    await user.save();
    res.json({ success: true, message: 'User registered successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
