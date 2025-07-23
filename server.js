const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./db'); // MongoDB connection

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // Parse JSon

//check route
app.get('/', (req, res) => {
  res.send('Server is working!');
});

//Routes
//1. userRoutes
const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);
//2. candidateRoutes  (token se chalega) and Role must be {admin} here
const candidateRoutes = require('./routes/candidateRoutes');
app.use('/candidate',candidateRoutes);


//Port configuration
const PORT = process.env.PORT || 9000;
app.listen(PORT,() => {
  console.log(` Server is live at http://localhost:${PORT}`);
});
