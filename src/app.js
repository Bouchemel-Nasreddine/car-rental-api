const express = require('express');
const path = require('path');

const app = express();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');

app.use(express.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use('/uploads/files', express.static(path.join('uploads', 'files')));

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'pug');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});


app.get('/', async (req, res) => {
    res.json({ message: 'Hello, this is the root of the Car Rental API :)' });
});

app.use('/', authRoutes);

app.use('/admin', adminRoutes);

app.use('/profile', profileRoutes);

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});