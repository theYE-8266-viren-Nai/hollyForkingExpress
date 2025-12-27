import express from 'express'
import cors from 'cors'
import pool from './db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import authRoutes from './src/authRoutes.js'
import clubRoutes from './src/clubRoutes.js'
import authMiddleware from './src/middleware/authmiddleware.js'
dotenv.config();
const app = express()


//middleware
app.use(cors())
app.use(express.json())
const PORT = process.env.PORT || 5002

//db connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log('PostgreSQL connected successfully!');
        console.log('Server time:', result.rows[0].now);
    });
});

app.get('/', async (req, res) => {
    try {
        return res.send("Hello world")
    } catch (error) {
        console.error(err);
        return res.status(500).send("Server Error")
    }
})

//routes 
app.use('/auth' , authRoutes);
app.use('/clubs', authMiddleware, clubRoutes);
 

app.listen(PORT, () => {
    console.log(`Server has started on port : ${PORT}`);
})