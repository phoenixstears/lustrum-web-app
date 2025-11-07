import { Express } from "express";
import express, { Request, Response } from "express";
import pool from "../db/index.js";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM group_brackets');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching group brackets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get("/:id", async (req: Request, res: Response) => {
        const { id } = req.params;
        try{
            const result = await pool.query('SELECT * FROM group_brackets WHERE bracketId = $1', [id]);
            res.json(result.rows[0]);
        } catch (error){
            console.error("Error fetching group bracket", error);
            res.status(500).json({ error: "Internal Sever Error"});
        }
});

router.post('/', async (req: Request, res: Response) => {
    const body = req.body ?? {};
    const {groupcount, teamspergroup, tournamentid } = body;
    if (!groupcount || !teamspergroup || !tournamentid) {
        return res.status(400).json({ error: 'groupcount, teamspergroup and tournamentid are required' });
    }
    try {
        const result = await pool.query(
                'INSERT INTO group_brackets (groupcount, teamspergroup, tournamentid) VALUES ($1, $2, $3) RETURNING bracketid, groupcount, teamspergroup, tournamentid',
                [ groupcount, teamspergroup, tournamentid]
            );
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating group bracket:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/', async (req: Request, res: Response) => {
    const body = req.body ?? {};
    const { bracketid, groupcount, teamspergroup, tournamentid } = body;
    if (!bracketid || !groupcount || !teamspergroup || !tournamentid) {
        return res.status(400).json({ error: 'bracketid, groupcount, teamspergroup and tournamentid are required' });
    }
    try {
        const result = await pool.query(    
                'UPDATE group_brackets SET groupcount = $1, teamspergroup = $2, tournamentid = $3 WHERE bracketid = $4 RETURNING bracketid, groupcount, teamspergroup, tournamentid',
                [groupcount, teamspergroup, tournamentid, bracketid]
            );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating group bracket:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:bracketid', async (req: Request, res: Response) => {
    const { bracketid } = req.params;
    try {
        await pool.query('DELETE FROM group_brackets WHERE bracketid = $1', [bracketid]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting group bracket:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


export default router;