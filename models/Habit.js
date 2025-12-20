const mongoose = require('mongoose');
const HabitSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, travel: Number, food: Number, energy: Number, footprint: Number }, { timestamps: true });
module.exports = mongoose.models.Habit || mongoose.model('Habit', HabitSchema);
