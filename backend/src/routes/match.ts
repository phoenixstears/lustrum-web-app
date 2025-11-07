import express, {Request, Response} from "express";
import pool from "../db/index.js"

const router = express.Router()

router.get("/", async(req: Request, res: Response) => {
     try {
        const result = await pool.query("SELECT * FROM matches");
        res.json(result.rows);
     } catch (error) {
        console.error("Error fetching matches", error);
        res.status(500).json({error: "Internal Server Error"});
     }
});

router.get("/:id", async(req: Request, res: Response) => {
     const { id } = req.params;
     try {
        const result = await pool.query("SELECT * FROM matches WHERE matchId = $1", [id]);
        res.json(result.rows[0]);
     } catch (error) {
        console.error("Error fetching match", error);
        res.status(500).json({error: "Internal Server Error"});
     }
});

router.post("/", async (req: Request, res: Response) => {
        const body = req.body ?? {};
        const {team1Id, team2Id, result2, nextMatch, groupBracketId, ladderBracketId} = body;
        if (!team1Id || !team2Id || !nextMatch || (!groupBracketId && !ladderBracketId)){
            return res.status(400).json({error: "Missing required fields"});
        }
        try {
            const result = await pool.query('INSERT INTO matches (team1Id, team2Id, result, nextMatch, groupBracketId, ladderBracketId) VALUES ($1, $2, $3, $4, $5, $6) RETURNING matchId, team1Id, team2Id, result, nextMatch, groupBracketId, ladderBracketId', [team1Id, team2Id, result2, nextMatch, groupBracketId, ladderBracketId]);
            res.status(201).json(result.rows[0]);
        } catch (error){
            console.error("Error creating match", error);
            res.status(500).json({error: "Internal Server Error"});
        }
});

router.put("/:id", async (req: Request, res: Response) => {
        const { matchId } = req.params;
        const body = req.body ?? {};
        const {team1Id, team2Id, result2, nextMatch, groupBracketId, ladderBracketId} = body;
         if (!matchId || !team1Id || !team2Id || !nextMatch || (!groupBracketId && !ladderBracketId)){
            return res.status(400).json({error: "Missing required fields"});
        }       
        try {
            const result = await pool.query('UPDATE matches SET team1Id = $2, team2Id = $3, result = $4, nextMatch = $5, groupBracketId = $6, ladderBracketId = $7 WHERE matchId  = $1', [matchId, team1Id, team2Id, result2, nextMatch, groupBracketId, ladderBracketId]);
            res.json(result.rows[0]);
        } catch (error){
            console.error("Error updating match", error);
            res.status(500).json({ error: "Internal Server Error"});
        }
});

router.delete("/:id", async (req: Request, res: Response) => {
        const { matchId } = req.params;
        try {
            await pool.query('DELETE FROM matches WHERE matchId = $1', [matchId]);
            res.status(204).send();
        } catch (error) {
            console.error("Error deleting match", error);
            res.status(500).json({error: "Internal Server Error"});
        }


});