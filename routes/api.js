const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Score = require('../models/Score');
// in-memory fallback for demo when DB is not connected
const inMemoryScores = [];
const inMemoryUsers = [];
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

function requireAuth(req, res, next){
  try{
    const hdr = req.headers.authorization || '';
    if (!hdr.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
    const token = hdr.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub; req.username = payload.username;
    next();
  }catch(e){ return res.status(401).json({ error: 'invalid token' }); }
}

router.post('/calc', async (req, res) => {
  const { travel = 0, food = 0, energy = 0 } = req.body || {};
  const footprint = (travel * 0.2) + (food * 0.15) + (energy * 0.25);
  res.json({ footprint });
});
router.get('/quests', async (req, res) => {
  const base = [
    { title: 'Plant Trees', description: 'Plant 5 trees in your area', reward: 20 },
    { title: 'Bike Commute', description: 'Bike to work 3 times this week', reward: 15 },
    { title: 'Solar Build', description: 'Research and share a solar plan', reward: 25 },
    { title: 'Reduce Meat', description: 'Have 2 meat-free days', reward: 10 },
    { title: 'Community Cleanup', description: 'Join a local cleanup', reward: 30 }
  ];
  res.json({ quests: base });
});
router.get('/leaderboard', async (req, res) => {
  try{
    // return top 10 scores
    if (mongoose.connection.readyState !== 1) {
      const rows = inMemoryScores.slice().sort((a,b)=>b.points - a.points).slice(0,20);
      const leaderboard = rows.map(r=>({ points: r.points, user: { username: r.username } }));
      return res.json({ leaderboard });
    }
    const rows = await Score.find().sort({ points: -1 }).limit(20).populate('user').lean();
    const leaderboard = rows.map(r=>({ points: r.points, user: r.user ? { username: r.user.username } : null }));
    res.json({ leaderboard });
  }catch(e){ console.error(e); res.json({ leaderboard: [] }); }
});

// Accept score submissions: { username, points }
// Secure score submissions: require JWT and use authenticated user
router.post('/leaderboard', requireAuth, async (req, res) => {
  try{
    const { points=0 } = req.body || {};
    if (mongoose.connection.readyState !== 1) {
      // find username from token username (req.username)
      inMemoryScores.push({ username: req.username || 'Anon', points, created: new Date() });
      return res.json({ ok: true, score: { points, user: { username: req.username || 'Anon' } } });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'user not found' });
    const score = await Score.create({ user: user._id, points });
    return res.json({ ok: true, score: { points: score.points, user: { username: user.username } } });
  }catch(e){ console.error(e); res.status(500).json({ error: 'failed' }); }
});
module.exports = router;
