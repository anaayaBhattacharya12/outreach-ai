const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
//ENV VAriables
// as env variables are already loaded by dotenv, you can access them using process.env
const port = process.env.PORT || 3000;
require('dotenv').config();//read .env file and set environment variables in process.env



// Connect to MongoDB
connectDB();
const app = express();
//Middleware
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

//Middleware for error handling
app.use((err, req, res,next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});