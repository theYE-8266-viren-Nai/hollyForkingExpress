import express from 'express'
import pool from '../db.js'
const router = express.Router();
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, clubname, thanata, "studentId" FROM schoolclubs ORDER BY id DESC'
        );

        res.status(200).json({
            clubs: result.rows,        // Only the actual data rows
            total: result.rowCount
        });

    } catch (error) {
        console.error('Error fetching all clubs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/', async (req, res) => {
    const { clubname } = req.body;
    const userRes = await pool.query(
        'SELECT thanata FROM students WHERE id = $1',
        [req.userId]
    );
    const thanata = userRes.rows[0].thanata;
    const result = await pool.query(
        `INSERT INTO schoolclubs (clubname, thanata, "studentId") 
   VALUES ($1, $2, $3) 
   RETURNING *`,
        [clubname, thanata, req.userId]  // ← this is secure!
    );
    console.log(thanata);
    res.status(201).json({
        message: "School Club created successfully",
    })
})
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { clubname } = req.body;

    if (!clubname || typeof clubname !== 'string') {
        return res.status(400).json({ message: "clubname is required and must be a string" });
    }
    try {
        const clubCheck = await pool.query(
            'SELECT "studentId" FROM schoolclubs WHERE id = $1',
            [id]
        )
        if (clubCheck.rowCount === 0) {
            return res.status(404).json({
                message: 'Club not found'
            })
        }
        if (clubCheck.rows[0].studentId !== req.userId) {
            return res.status(403).json({ message: "You can only update your own clubs" })
        }

        const result = await pool.query(
            `UPDATE schoolclubs SET clubname = $1 
            WHERE id = $2 
            RETURNING *
            ` ,
            [clubname, id]
        );
        res.status(200).json({
            message: 'Club updated successfully',
            club: result.rows[0]
        });
    }
    catch (err) {
        console.log('Error updating club:', err);
        res.status(500).json({ message: 'Server error' })

    }
})
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Check ownership
        const clubCheck = await pool.query(
            `SELECT "studentId" FROM schoolclubs WHERE id = $1`,
            [id]
        );

        if (clubCheck.rowCount === 0) {
            return res.status(404).json({ message: 'Club not found' });
        }

        if (clubCheck.rows[0].studentId !== req.userId) {
            return res.status(403).json({ message: 'You can only delete your own clubs' });
        }

        // Delete the club
        await pool.query(`DELETE FROM schoolclubs WHERE id = $1`, [id]);

        res.status(200).json({ message: 'Club has been deleted ' });

    } catch (error) {
        console.error('Error deleting club:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
export default router;