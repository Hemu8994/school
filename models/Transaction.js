const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionNo: { type: String, required: true, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: String,
  className: String,
  contributionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contribution' },
  amount: { type: Number, required: true },
  method: { 
    type: String, 
    enum: ['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Cash'],
    required: true 
  },
  mpesaReference: String,
  phoneNumber: String,
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiptNo: String,
  notes: String,
  transactionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
