import express, { Request, Response } from 'express';
import pool from '../db/index.js';

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM tournaments');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } 
});

router.post('/', async (req: Request, res: Response) => {
    const body = req.body ?? {};
    const { gamename, starttime, brackettype } = body;
    if (!gamename || !starttime || !brackettype) {
        return res.status(400).json({ error: 'gamename, starttime and brackettype are required' });
    }
    try {
        const result = await pool.query(
                'INSERT INTO tournaments (gamename, starttime, brackettype) VALUES ($1, $2, $3) RETURNING tournamentid, gamename, starttime, brackettype',
                [gamename, starttime, brackettype]
            );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating tournament:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body ?? {};
    const { gamename, starttime, brackettype } = body;
    if (!gamename || !starttime || !brackettype) {
        return res.status(400).json({ error: 'gamename, starttime and brackettype are required' });
    }
    try {
        const result = await pool.query(
                'UPstarttime tournaments SET gamename = $1, starttime = $2, brackettype = $3 WHERE tournamentid = $4 RETURNING tournamentid, gamename, starttime, brackettype',
                [gamename, starttime, brackettype, id]
            );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating tournament:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tournaments WHERE tournamentid = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting tournament:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
