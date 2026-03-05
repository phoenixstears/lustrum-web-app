import express, { Request, Response } from "express";
import pool from "../db/index.js";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM players");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
        const { id } = req.params;
        try{
            const result = await pool.query('SELECT * FROM players WHERE playerId = $1', [id]);
            res.json(result.rows[0]);
        } catch (error){
            console.error("Error fetching player", error);
            res.status(500).json({ error: "Internal Sever Error"});
        }
});


// get all players of a team, 99.9% gonna need this at some point 
router.get("/team/:id", async (req: Request, res: Response) => {
       const {teamId} = req.params
       try {
        const result = await pool.query("SELECT * FROM players WHERE teamId = $1", [teamId]);
        res.json(result.rows)
       } catch (error) {
        console.error("Error fetching players of a team", error);
        res.status(500).json({error: "Internal Server Error"});
       }
});

// get all players of a tournament need it for the player list of the 
router.get("/tournament/:id", async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const result = await pool.query("SELECT * FROM players WHERE tournamentId = $1", [id]);
            res.json(result.rows)
        } catch (error) {
            console.error("Error fetching players of a tournament", error);
            res.status(500).json({error: "Internal Server Error"});
        }
});

// get all players of a tournament with their team information
router.get("/tournament/:id/withteams", async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const result = await pool.query(
                `SELECT p.*, t.teamId, t.teamName FROM players p 
                 LEFT JOIN teams t ON p.teamId = t.teamId 
                 WHERE p.tournamentId = $1 
                 ORDER BY t.teamName NULLS LAST, p.discordName`,
                [id]
            );
            res.json(result.rows)
        } catch (error) {
            console.error("Error fetching players of a tournament", error);
            res.status(500).json({error: "Internal Server Error"});
        }
});

router.post("/", async (req: Request, res: Response) => {

  const body = req.body ?? {};
  const { discordId, discordName, inGameName, tournamentId } = body;

  if (!discordId || !discordName || !inGameName || !tournamentId) {
    return res.status(400).json({ error: "discordId, discordName, inGameName and tournamentId are required" });
  }

  try {
    // Check if user already signed up for this tournament
    const existingSignup = await pool.query(
      "SELECT playerId FROM players WHERE discordId = $1 AND tournamentId = $2",
      [discordId, tournamentId]
    );

    if (existingSignup.rows.length > 0) {
      return res.status(409).json({ error: "You have already signed up for this tournament" });
    }

    const result = await pool.query(
      "INSERT INTO players (discordId, discordName, inGameName, tournamentId) VALUES ($1, $2, $3, $4) RETURNING playerId, discordId, discordName, inGameName, teamId, tournamentId",
      [discordId, discordName, inGameName, tournamentId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body ?? {};
  const { discordId, discordName, inGameName, teamId, tournamentId } = body;

  if (!discordId || !discordName || !inGameName || !tournamentId) {
    return res.status(400).json({ error: "discordId, discordName, inGameName and tournamentId are required" });
  }

  try {
    const result = await pool.query(
      "UPDATE players SET discordId = $1, discordName = $2, inGameName = $3, teamId = $4, tournamentId = $5 WHERE playerId = $6 RETURNING playerId, discordId, discordName, inGameName, teamId, tournamentId",
      [discordId, discordName, inGameName, teamId, tournamentId, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating player:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM players WHERE playerid = $1", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;