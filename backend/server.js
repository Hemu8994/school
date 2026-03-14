const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ==================== MongoDB Connection with Retry Logic ====================
const connectWithRetry = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 2,
    retryWrites: true,
    retryReads: true,
    maxIdleTimeMS: 30000,
    autoIndex: false,
  };

  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ Connected to MongoDB');
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectWithRetry, 5000);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('🔄 Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Call the connection function
connectWithRetry();

// ==================== SCHEMAS ====================

// User Schema
const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  pin: { type: String, required: true },
  name: String,
  role: { 
    type: String, 
    enum: ['principal', 'admin', 'teacher', 'parent'],
    default: 'parent'
  },
  classId: String,
  childrenIds: [String],
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});

// Hash PIN before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('pin')) {
    this.pin = await bcrypt.hash(this.pin, 10);
  }
  next();
});

// Method to compare PIN
userSchema.methods.comparePin = async function(candidatePin) {
  return await bcrypt.compare(candidatePin, this.pin);
};

const User = mongoose.model('User', userSchema);

// Student Schema
const studentSchema = new mongoose.Schema({
  admissionNumber: { type: String, unique: true },
  name: String,
  className: String,
  parentPhone: String,
  parentName: String,
  balance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  payments: [{
    amount: Number,
    date: Date,
    method: String,
    contributionId: String,
    contributionName: String,
    receiptNo: String,
    transactionId: String
  }],
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// Contribution Schema
const contributionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: String,
  amount: { type: Number, required: true },
  icon: { type: String, default: '💰' },
  color: { type: String, default: '#00C9A7' },
  academicYear: String,
  dueDate: Date,
  isActive: { type: Boolean, default: true },
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});

const Contribution = mongoose.model('Contribution', contributionSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  transactionNo: { type: String, required: true, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: String,
  className: String,
  contributionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contribution' },
  contributionName: String,
  amount: Number,
  method: { 
    type: String, 
    enum: ['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Cash']
  },
  mpesaReference: String,
  phoneNumber: String,
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  processedBy: String,
  receiptNo: String,
  notes: String,
  transactionDate: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// ==================== MIDDLEWARE ====================

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin/Principal only middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'principal' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;

    // Trim phone number to remove any spaces
    const cleanPhone = phone.trim();
    
    console.log(`Login attempt for phone: ${cleanPhone}`);

    const user = await User.findOne({ phone: cleanPhone, isActive: true });
    if (!user) {
      console.log(`User not found for phone: ${cleanPhone}`);
      return res.status(401).json({ error: 'Namba ya simu haipo / Phone not registered' });
    }

    console.log(`User found: ${user.name}, comparing PIN...`);
    
    const isValid = await user.comparePin(pin);
    if (!isValid) {
      console.log(`Invalid PIN for user: ${user.name}`);
      return res.status(401).json({ error: 'PIN si sahihi / Wrong PIN' });
    }

    console.log(`Login successful for: ${user.name}`);

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { 
        userId: user._id, 
        phone: user.phone, 
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' }
    );

    let dashboardData = {};

    if (user.role === 'principal' || user.role === 'admin') {
      const students = await Student.countDocuments({ isActive: true });
      const transactions = await Transaction.find({ status: 'completed' });
      const totalCollected = transactions.reduce((sum, t) => sum + t.amount, 0);
      
      dashboardData = {
        totalStudents: students,
        totalCollected,
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
        name: user.name,
        phone: user.phone,
        role: user.role
      },
      dashboard: dashboardData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DEBUG ROUTE - REMOVE AFTER TESTING ====================
app.post('/api/debug-login', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    
    const cleanPhone = phone.trim();
    
    // Find ALL users to see what's in DB
    const allUsers = await User.find({});
    
    // Find specific user
    const user = await User.findOne({ phone: cleanPhone });
    
    let pinMatch = false;
    let pinError = null;
    
    if (user) {
      try {
        pinMatch = await bcrypt.compare(pin, user.pin);
      } catch (err) {
        pinError = err.message;
      }
    }
    
    res.json({
      searchedPhone: cleanPhone,
      userFound: !!user,
      pinMatches: pinMatch,
      pinError: pinError,
      userDetails: user ? {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        pinHash: user.pin.substring(0, 20) + '...',
        isActive: user.isActive
      } : null,
      allUsersInDb: allUsers.map(u => ({
        phone: u.phone,
        name: u.name,
        role: u.role,
        pinHash: u.pin.substring(0, 15) + '...'
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Temporary route to fix PINs if needed
app.post('/api/fix-pin/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { newPin } = req.body;
    
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Hash the new PIN
    const hashedPin = await bcrypt.hash(newPin || '1234', 10);
    user.pin = hashedPin;
    await user.save();
    
    res.json({
      success: true,
      message: `PIN updated for ${user.name}`,
      newHash: hashedPin.substring(0, 20) + '...'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register (Admin only)
app.post('/api/register', async (req, res) => {
  try {
    const { phone, pin, name, role, classId, childrenIds } = req.body;

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: 'Phone already registered' });
    }

    const user = new User({
      phone,
      pin,
      name,
      role,
      classId,
      childrenIds
    });

    await user.save();
    res.json({ success: true, message: 'User registered successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CONTRIBUTION ROUTES ====================

// Get all contributions
app.get('/api/contributions', async (req, res) => {
  try {
    const contributions = await Contribution.find({ isActive: true }).sort({ amount: 1 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new contribution (Admin only)
app.post('/api/contributions', authenticate, isAdmin, async (req, res) => {
  try {
    const contribution = new Contribution({
      ...req.body,
      createdBy: req.user.userId
    });
    await contribution.save();
    res.status(201).json(contribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contribution (Admin only)
app.put('/api/contributions/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const contribution = await Contribution.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(contribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contribution (soft delete) (Admin only)
app.delete('/api/contributions/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await Contribution.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Contribution deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STUDENT ROUTES ====================

// Get all students (with filters)
app.get('/api/students', authenticate, async (req, res) => {
  try {
    const { class: className, search } = req.query;
    let query = { isActive: true };

    if (req.user.role === 'teacher') {
      const teacher = await User.findById(req.user.userId);
      query.className = teacher.classId;
    } else if (req.user.role === 'parent') {
      const parent = await User.findById(req.user.userId);
      query._id = { $in: parent.childrenIds };
    }

    if (className && className !== 'All') {
      query.className = className;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const students = await Student.find(query).sort({ name: 1 });
    res.json(students);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single student
app.get('/api/students/:id', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add student (Admin only)
app.post('/api/students', authenticate, isAdmin, async (req, res) => {
  try {
    const count = await Student.countDocuments();
    const admissionNumber = `ADM-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    
    const student = new Student({
      ...req.body,
      admissionNumber
    });
    
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student
app.put('/api/students/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PAYMENT ROUTES ====================

// Generate transaction number
const generateTransactionNo = () => {
  const date = new Date();
  return `TXN-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}-${Math.floor(Math.random() * 10000).toString().padStart(4,'0')}`;
};

// Process payment
app.post('/api/payments', authenticate, async (req, res) => {
  try {
    const { studentId, amount, method, phoneNumber, contributionId } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const contribution = await Contribution.findById(contributionId);
    
    const transactionNo = generateTransactionNo();
    const receiptNo = `RCT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const transaction = new Transaction({
      transactionNo,
      studentId: student._id,
      studentName: student.name,
      className: student.className,
      contributionId,
      contributionName: contribution?.name,
      amount,
      method,
      phoneNumber,
      status: 'completed',
      processedBy: req.user.userId,
      receiptNo
    });

    await transaction.save();

    student.balance = (student.balance || 0) - amount;
    student.payments.push({
      amount,
      date: new Date(),
      method,
      contributionId,
      contributionName: contribution?.name,
      receiptNo,
      transactionId: transaction._id
    });
    
    await student.save();

    res.json({
      success: true,
      transaction,
      receipt: {
        no: receiptNo,
        student: student.name,
        amount,
        date: new Date(),
        method
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions for a student
app.get('/api/payments/student/:studentId', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ 
      studentId: req.params.studentId 
    }).sort({ transactionDate: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions (Admin only)
app.get('/api/payments', authenticate, isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ transactionDate: -1 })
      .limit(100);
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DASHBOARD ROUTES ====================

// Get dashboard stats based on role
app.get('/api/dashboard', authenticate, async (req, res) => {
  try {
    const { role, userId } = req.user;
    let stats = {};

    if (role === 'principal' || role === 'admin') {
      const students = await Student.countDocuments({ isActive: true });
      const completedTxns = await Transaction.find({ status: 'completed' });
      const totalCollected = completedTxns.reduce((sum, t) => sum + t.amount, 0);
      
      const classes = ['Form 1A','Form 1B','Form 2A','Form 2B','Form 3A','Form 3B','Form 4A','Form 4B'];
      const classStats = await Promise.all(classes.map(async (className) => {
        const classStudents = await Student.find({ className, isActive: true });
        const paid = classStudents.filter(s => s.balance <= 0).length;
        return {
          className,
          total: classStudents.length,
          paid,
          percentage: classStudents.length ? Math.round((paid / classStudents.length) * 100) : 0
        };
      }));

      stats = {
        totalStudents: students,
        totalCollected,
        recentTransactions: await Transaction.find()
          .sort({ transactionDate: -1 })
          .limit(10),
        classStats,
        contributions: await Contribution.find({ isActive: true })
      };

    } else if (role === 'teacher') {
      const teacher = await User.findById(userId);
      const students = await Student.find({ 
        className: teacher.classId,
        isActive: true 
      });
      
      const paid = students.filter(s => s.balance <= 0).length;
      
      stats = {
        className: teacher.classId,
        totalStudents: students.length,
        paidStudents: paid,
        percentage: students.length ? Math.round((paid / students.length) * 100) : 0,
        students: students.slice(0, 10)
      };

    } else if (role === 'parent') {
      const parent = await User.findById(userId);
      const students = await Student.find({ 
        _id: { $in: parent.childrenIds },
        isActive: true 
      });
      
      stats = {
        children: students,
        totalBalance: students.reduce((sum, s) => sum + (s.balance || 0), 0),
        recentPayments: await Transaction.find({
          studentId: { $in: parent.childrenIds }
        }).sort({ transactionDate: -1 }).limit(10)
      };
    }

    res.json(stats);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== UTILITY ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Get all classes
app.get('/api/classes', (req, res) => {
  const classes = ['Form 1A','Form 1B','Form 2A','Form 2B','Form 3A','Form 3B','Form 4A','Form 4B'];
  res.json(classes);
});

// ==================== ERROR HANDLING ====================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong! Please try again.' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});

module.exports = app;
