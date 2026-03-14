const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// Get all students (principal/admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'principal' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { class: className, search } = req.query;
    let query = { isActive: true };

    if (className && className !== 'All') {
      query.className = className;
    }

    if (search) {
      query.fullName = { $regex: search, $options: 'i' };
    }

    const students = await Student.find(query).sort({ fullName: 1 });
    res.json(students);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single student
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check access based on role
    if (req.user.role === 'parent') {
      const parent = await User.findById(req.user.userId);
      if (!parent.studentIds.includes(student._id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'teacher') {
      const teacher = await User.findById(req.user.userId);
      if (student.className !== teacher.classId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add student (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'principal' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
