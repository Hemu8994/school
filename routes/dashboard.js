const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Transaction = require('../models/Transaction');
const Contribution = require('../models/Contribution');
const auth = require('../middleware/auth');

// Get dashboard stats based on role
router.get('/', auth, async (req, res) => {
  try {
    const { role, userId } = req.user;
    let stats = {};

    if (role === 'principal' || role === 'admin') {
      // Full school stats
      const students = await Student.countDocuments({ isActive: true });
      const completedTxns = await Transaction.find({ status: 'completed' });
      const totalCollected = completedTxns.reduce((sum, t) => sum + t.amount, 0);
      
      // Class breakdown
      const classes = ['Form 1A','Form 1B','Form 2A','Form 2B','Form 3A','Form 3B','Form 4A','Form 4B'];
      const classStats = await Promise.all(classes.map(async (className) => {
        const classStudents = await Student.find({ className, isActive: true });
        const paid = classStudents.filter(s => s.balance === 0).length;
        return {
          className,
          total: classStudents.length,
          paid,
          percentage: classStudents.length ? (paid / classStudents.length * 100).toFixed(0) : 0
        };
      }));

      stats = {
        totalStudents: students,
        totalCollected,
        pendingAmount: students * 180000 - totalCollected, // Assuming total fees per student
        recentTransactions: await Transaction.find().sort({ transactionDate: -1 }).limit(10),
        classStats,
        contributions: await Contribution.find({ isActive: true })
      };

    } else if (role === 'teacher') {
      // Teacher's class only
      const teacher = await User.findById(userId);
      const students = await Student.find({ 
        className: teacher.classId,
        isActive: true 
      });
      
      const paid = students.filter(s => s.balance === 0).length;
      
      stats = {
        className: teacher.classId,
        totalStudents: students.length,
        paidStudents: paid,
        percentage: students.length ? (paid / students.length * 100).toFixed(0) : 0,
        students: students.slice(0, 10) // Recent 10 students
      };

    } else if (role === 'parent') {
      // Parent's children only
      const parent = await User.findById(userId);
      const students = await Student.find({ 
        _id: { $in: parent.studentIds },
        isActive: true 
      });
      
      stats = {
        children: students,
        totalBalance: students.reduce((sum, s) => sum + s.balance, 0),
        recentPayments: await Transaction.find({
          studentId: { $in: parent.studentIds }
        }).sort({ transactionDate: -1 }).limit(10)
      };
    }

    res.json(stats);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
