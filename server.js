const express = require('express');
const db = require('./config/db')
const app = express()

const dotenv = require('dotenv')

dotenv.config({path: 'config/config.env'})
//Connect to database
db();

// Init middleware
app.use(express.json( {extended: false}));

app.get('/', (req, res) => res.send('API Running '));

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/post'));






app.listen(process.env.PORT, () => {
    console.log(`Server satrted on port: ${process.env.PORT}`)});