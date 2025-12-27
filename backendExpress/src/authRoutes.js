import express from 'express'
import db from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const router = express.Router()
//register route
router.post('/register', async (req, res) => {
    const { name, password, thanata } = req.body;
    console.log(name, password, thanata);
    const hashedPassword = bcrypt.hashSync(password, 8)

    try {
        const result = await db.query(
            'INSERT INTO "students"(name, password, thanata) VALUES ($1, $2, $3) RETURNING *',
            [name, hashedPassword, thanata]
        );

        const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SECRET, { expiresIn: '24h' })
        // Success - return 201 with created data
        res.status(201).json({
            message: "Registration successful",
            user: result.rows[0],
            token: token
        });
    } catch (err) {
        console.log(err.message);
        res.status(503).json({ error: "Registration failed" });
    }
});
//login route
router.post('/login', async (req, res) => {
    const { name, password } = req.body;
    console.log(name, password);
    try {
        const result = await db.query('SELECT * FROM students WHERE name = $1', [name]);
        const user = result.rows[0]; // Get the first row from the result

        // 2. Check if user exists BEFORE comparing password
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 3. Compare the password
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            console.log("Password from Postman:", password);
            console.log("Hash from Database:", user.password);

            const passwordIsValid = bcrypt.compareSync(password, user.password);
            console.log("Match Result:", passwordIsValid);
            return res.status(401).json({ // 401 is more standard for password errors
                message: "password invalid"
            });
        }

        // 4. Sign the token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // console.log('Auth successful - userId:', decoded.id);

        // 5. Send successful response
        res.status(200).json({ // 200 is standard for a successful Login
            message: "Login successful",
            token: token
        });

    }

    catch (error) {
        console.log(error.message);
        res.sendStatus(503)
    }
})
router.get('/testing', async (req, res) => {
    res.sendStatus(200);
})
export default router 