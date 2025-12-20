const mongoose = require('mongoose');
const ScoreSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, points: Number }, { timestamps: true });
module.exports = mongoose.models.Score || mongoose.model('Score', ScoreSchema);
