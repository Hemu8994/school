const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  admissionNumber: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  className: { type: String, required: true },
  parentPhone: { type: String, required: true },
  parentName: String,
  balance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  payments: [{
    amount: Number,
    date: Date,
    method: String,
    reference: String,
    receiptNo: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
