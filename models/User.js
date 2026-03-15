const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: [true, 'Namba ya simu inahitajika / Phone number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Namba ya simu lazima iwe tarakimu 10 / Phone must be 10 digits']
  },
  pin: { 
    type: String, 
    required: [true, 'PIN inahitajika / PIN is required'],
    minlength: [4, 'PIN lazima iwe tarakimu 4 / PIN must be 4 digits'],
    maxlength: 4
  },
  fullName: { 
    type: String, 
    required: [true, 'Jina linahitajika / Full name is required'],
    trim: true
  },
  role: { 
    type: String, 
    enum: {
      values: ['principal', 'admin', 'teacher', 'parent'],
      message: 'Role {VALUE} haipo / Role {VALUE} is not valid'
    },
    default: 'parent'
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class',
    default: null
  },
  studentIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { 
    type: Date, 
    default: null 
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// ==================== PIN HASHING MIDDLEWARE ====================
// Hash PIN only if it's modified or new
userSchema.pre('save', async function(next) {
  // Only hash if the PIN field is modified
  if (!this.isModified('pin')) {
    return next();
  }

  try {
    // Generate salt and hash the PIN
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ==================== INSTANCE METHODS ====================

/**
 * Compare entered PIN with stored hash
 * @param {string} candidatePin - Plain text PIN to compare
 * @returns {Promise<boolean>} - True if PIN matches
 */
userSchema.methods.comparePin = async function(candidatePin) {
  try {
    return await bcrypt.compare(candidatePin, this.pin);
  } catch (error) {
    throw new Error('PIN comparison failed');
  }
};

/**
 * Update last login timestamp
 * @returns {Promise<Object>} - Updated user
 */
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return this.save();
};

/**
 * Add a student to parent's children list
 * @param {string} studentId - Student ID to add
 * @returns {Promise<Object>} - Updated user
 */
userSchema.methods.addStudent = async function(studentId) {
  if (this.role !== 'parent') {
    throw new Error('Only parents can have students');
  }
  
  if (!this.studentIds.includes(studentId)) {
    this.studentIds.push(studentId);
    await this.save();
  }
  return this;
};

/**
 * Remove a student from parent's children list
 * @param {string} studentId - Student ID to remove
 * @returns {Promise<Object>} - Updated user
 */
userSchema.methods.removeStudent = async function(studentId) {
  this.studentIds = this.studentIds.filter(id => id.toString() !== studentId.toString());
  return this.save();
};

/**
 * Deactivate user account
 * @returns {Promise<Object>} - Updated user
 */
userSchema.methods.deactivate = async function() {
  this.isActive = false;
  return this.save();
};

/**
 * Activate user account
 * @returns {Promise<Object>} - Updated user
 */
userSchema.methods.activate = async function() {
  this.isActive = true;
  return this.save();
};

// ==================== STATIC METHODS ====================

/**
 * Find user by phone number
 * @param {string} phone - Phone number to search
 * @returns {Promise<Object>} - Found user or null
 */
userSchema.statics.findByPhone = function(phone) {
  return this.findOne({ phone, isActive: true });
};

/**
 * Get all teachers
 * @returns {Promise<Array>} - List of teachers
 */
userSchema.statics.getTeachers = function() {
  return this.find({ role: 'teacher', isActive: true }).sort({ fullName: 1 });
};

/**
 * Get all parents
 * @returns {Promise<Array>} - List of parents
 */
userSchema.statics.getParents = function() {
  return this.find({ role: 'parent', isActive: true }).sort({ fullName: 1 });
};

/**
 * Get user statistics by role
 * @returns {Promise<Object>} - Count of users by role
 */
userSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
  
  const result = {
    principal: 0,
    admin: 0,
    teacher: 0,
    parent: 0,
    total: 0
  };
  
  stats.forEach(item => {
    result[item._id] = item.count;
    result.total += item.count;
  });
  
  return result;
};

/**
 * Bulk deactivate users
 * @param {Array} userIds - Array of user IDs to deactivate
 * @returns {Promise<Object>} - Update result
 */
userSchema.statics.bulkDeactivate = function(userIds) {
  return this.updateMany(
    { _id: { $in: userIds } },
    { $set: { isActive: false } }
  );
};

// ==================== VIRTUAL PROPERTIES ====================

/**
 * Get role in Swahili
 */
userSchema.virtual('roleSwahili').get(function() {
  const roles = {
    principal: 'Mkuu wa Shule',
    admin: 'Msimamizi',
    teacher: 'Mwalimu',
    parent: 'Mzazi'
  };
  return roles[this.role] || this.role;
});

/**
 * Check if user is admin or principal (has management privileges)
 */
userSchema.virtual('isManager').get(function() {
  return this.role === 'principal' || this.role === 'admin';
});

/**
 * Check if user is teacher
 */
userSchema.virtual('isTeacher').get(function() {
  return this.role === 'teacher';
});

/**
 * Check if user is parent
 */
userSchema.virtual('isParent').get(function() {
  return this.role === 'parent';
});

// ==================== INDEXES ====================

// Optimize common queries
userSchema.index({ phone: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ classId: 1, isActive: 1 });

// ==================== EXPORT ====================

const User = mongoose.model('User', userSchema);

module.exports = User;
