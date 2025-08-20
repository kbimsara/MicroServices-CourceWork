const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();


// Use environment variables
const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL;

app.listen(PORT, () => {
  console.log(`Orders Service is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Welcome to the Orders Service');
});

mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
