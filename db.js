const mongoose = require('mongoose');
require('dotenv').config();


// mongoDB connection url
const mongoURL = process.env.MONGODB_URL_LOCAL;
//const mongoURL = process.env.MONGODB_URL;
// for online database collection


// setup mongodb connection
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
})

//Get the default connection
const db = mongoose.connection;

//define event listeners
 
db.on('connected',() => {
    console.log('Connected to MongoDB server');

})
db.on('disconnected',() => {
    console.log('MongoDB disconnected');
})
db.on('error',() => {
    console.log('MongoDB connection error:')
})
// exports the db
module.exports = db;