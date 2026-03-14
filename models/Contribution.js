const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  nameSwahili: { type: String, required: true },
  nameEnglish: { type: String, required: true },
  amount: { type: Number, required: true },
  icon: { type: String, default: '💰' },
  color: { type: String, default: '#00C9A7' },
  academicYear: String,
  dueDate: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contribution', contributionSchema);
