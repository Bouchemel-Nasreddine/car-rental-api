const express = require('express');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const app = express();
const prisma = new PrismaClient();

const authRoutes = require('./routes/auth');

app.use(express.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use('/uploads/files', express.static(path.join('uploads', 'files')));

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

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});