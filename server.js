const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
dotenv.config();
let authRoutes, apiRoutes;
try{ authRoutes = require('./routes/auth'); }catch(e){ authRoutes = (req,res)=>res.status(404).send('auth routes missing'); }
try{ apiRoutes = require('./routes/api'); }catch(e){ apiRoutes = (req,res)=>res.status(404).send('api routes missing'); }
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use(limiter);
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecoverse';
// prevent Mongoose from buffering commands when DB is down; fail fast
mongoose.set('bufferCommands', false);
mongoose.connect(MONGO, { serverSelectionTimeoutMS: 3000 }).then(()=>console.log('MongoDB connected')).catch(err=>console.error('MongoDB error', err));
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// To run with HTTPS in production, wrap `app` in an https.createServer with certs.
