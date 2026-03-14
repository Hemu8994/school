const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^[0-9]{10}$/
  },
  pin: { 
    type: String, 
    required: true,
    minlength: 4,
    maxlength: 4
  },
  fullName: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['principal', 'admin', 'teacher', 'parent'],
    default: 'parent'
  },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, // for teachers
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], // for parents
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

module.exports = mongoose.model('User', userSchema);
