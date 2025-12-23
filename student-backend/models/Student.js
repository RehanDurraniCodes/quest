const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number },
  course: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
