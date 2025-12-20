const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// In-memory fallback storage when MongoDB isn't available (demo only)
const inMemoryUsers = [];

router.post('/register', async (req, res) => {
  try{
    const { username, email, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    if (require('mongoose').connection.readyState === 1) {
      try {
        let existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ error: 'username taken' });
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hash });
        const token = jwt.sign({ sub: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ ok: true, token, user: { username: user.username, email: user.email } });
      } catch (dbErr) {
        console.error('DB auth/register error, falling back to memory:', dbErr);
      }
    }
    // fallback: in-memory
    if (inMemoryUsers.find(u=>u.username === username)) return res.status(409).json({ error: 'username taken' });
    const hash = await bcrypt.hash(password, 10);
    const user = { id: 'mem_' + (inMemoryUsers.length+1), username, email, password: hash };
    inMemoryUsers.push(user);
    const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ ok: true, token, user: { username: user.username, email: user.email } });
  }catch(e){ console.error(e); res.status(500).json({ error: 'registration failed' }); }
});

router.post('/login', async (req, res) => {
  try{
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    if (require('mongoose').connection.readyState === 1) {
      try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'invalid credentials' });
        const ok = await bcrypt.compare(password, user.password || '');
        if (!ok) return res.status(401).json({ error: 'invalid credentials' });
        const token = jwt.sign({ sub: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ ok: true, token, user: { username: user.username, email: user.email } });
      } catch (dbErr) {
        console.error('DB auth/login error, falling back to memory:', dbErr);
      }
    }
    // fallback: in-memory
    const user = inMemoryUsers.find(u=>u.username === username);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ ok: true, token, user: { username: user.username, email: user.email } });
  }catch(e){ console.error(e); res.status(500).json({ error: 'login failed' }); }
});

module.exports = router;

