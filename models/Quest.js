const mongoose = require('mongoose');
const QuestSchema = new mongoose.Schema({ title: String, description: String, progress: Number, target: Number, reward: Number, completed: Boolean }, { timestamps: true });
module.exports = mongoose.models.Quest || mongoose.model('Quest', QuestSchema);
