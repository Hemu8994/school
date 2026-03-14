const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// Generate transaction number
const generateTransactionNo = () => {
  const date = new Date();
  return `TXN-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}-${Math.floor(Math.random() * 10000).toString().padStart(4,'0')}`;
};

// Process payment
router.post('/', auth, async (req, res) => {
  try {
    const { studentId, amount, method, phoneNumber, contributionId } = req.body;

    // Get student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Create transaction
    const transaction = new Transaction({
      transactionNo: generateTransactionNo(),
      studentId: student._id,
      studentName: student.fullName,
      className: student.className,
      contributionId,
      amount,
      method,
      phoneNumber,
      status: 'completed',
      processedBy: req.user.userId,
      receiptNo: `RCT-${Date.now()}`
    });

    await transaction.save();

    // Update student balance
    student.balance -= amount;
    student.payments.push({
      amount,
      date: new Date(),
      method,
      reference: transaction.transactionNo,
      receiptNo: transaction.receiptNo
    });
    await student.save();

    res.json({
      success: true,
      transaction,
      receipt: {
        no: transaction.receiptNo,
        student: student.fullName,
        amount,
        date: transaction.transactionDate
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ 
      studentId: req.params.studentId 
    }).sort({ transactionDate: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions (principal/admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'principal' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const transactions = await Transaction.find()
      .sort({ transactionDate: -1 })
      .limit(100);
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
