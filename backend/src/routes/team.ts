import express, {Request, Response} from "express";
import pool from "../db/index.js" 

const router = express.Router()

// Helper function to generate a unique 6-digit code
async function generateUniqueJoinCode(): Promise<string> {
    for (let i = 0; i < 10; i++) {
        const code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
        const result = await pool.query("SELECT teamId FROM teams WHERE joinCode = $1", [code]);
        if (result.rows.length === 0) {
            return code;
        }
    }
    throw new Error("Failed to generate unique join code");
}

router.get("/", async (req: Request, res: Response) => {
     try {
        const result = await pool.query("SELECT * FROM teams");
        res.json(result.rows);
     } catch (error){
        console.error("error fetching teams", error);
        res.status(500).json({error: "Internal Server Error"});
     }
});

router.post("/", async (req: Request, res: Response) => {
    const { teamName } = req.body;
    if (!teamName) {
        return res.status(400).json({ error: "teamName is required" });
    }
    try {
        const joinCode = await generateUniqueJoinCode();
        const result = await pool.query(
            "INSERT INTO teams (teamName, joinCode) VALUES ($1, $2) RETURNING teamId, teamName, joinCode",
            [teamName, joinCode]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("error creating team", error);
        res.status(500).json({error: "Internal Server Error"});
    }
})

router.put("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { teamName } = req.body;
    if (!teamName) {
        return res.status(400).json({ error: "teamName is required" });
    }
    try {
        await pool.query("UPDATE teams SET teamName = $1 WHERE teamId = $2", [teamName, id]);
        res.status(200).json({ message: "Team updated successfully" });
    } catch (error) {
        console.error("error updating team", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

// Get team with member count
router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const teamResult = await pool.query("SELECT * FROM teams WHERE teamId = $1", [id]);
        if (teamResult.rows.length === 0) {
            return res.status(404).json({ error: "Team not found" });
        }

        const membersResult = await pool.query("SELECT COUNT(*) FROM players WHERE teamId = $1", [id]);
        const memberCount = parseInt(membersResult.rows[0].count);

        res.json({ ...teamResult.rows[0], memberCount });
    } catch (error) {
        console.error("error fetching team", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get team members
router.get("/:id/members", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "SELECT playerId, discordName, inGameName FROM players WHERE teamId = $1",
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("error fetching team members", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Join team with code
router.post("/:teamId/join", async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { playerId, joinCode, tournamentId } = req.body;

    if (!playerId || !joinCode || !tournamentId) {
        return res.status(400).json({ 
            error: "playerId, joinCode, and tournamentId are required" 
        });
    }

    try {
        // Verify join code
        const codeResult = await pool.query(
            "SELECT joinCode FROM teams WHERE teamId = $1",
            [teamId]
        );

        if (codeResult.rows.length === 0) {
            return res.status(404).json({ error: "Team not found" });
        }

        if (codeResult.rows[0].joincode !== joinCode) {
            return res.status(401).json({ error: "Invalid join code" });
        }

        // Check if player already has a team in this tournament
        const existingTeamResult = await pool.query(
            `SELECT teamId FROM players 
             WHERE playerId = $1 AND tournamentId = $2`,
            [playerId, tournamentId]
        );

        if (existingTeamResult.rows.length > 0 && existingTeamResult.rows[0].teamid !== teamId) {
            return res.status(409).json({ 
                error: "Player already joined a different team in this tournament" 
            });
        }

        // Update player's team
        await pool.query(
            "UPDATE players SET teamId = $1 WHERE playerId = $2",
            [teamId, playerId]
        );

        res.json({ message: "Successfully joined team" });
    } catch (error) {
        console.error("error joining team", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Leave team - deletes player from tournament
router.post("/:teamId/leave", async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
        return res.status(400).json({ error: "playerId is required" });
    }

    try {
        // Delete player from tournament (leaves team)
        const result = await pool.query(
            "DELETE FROM players WHERE playerId = $1 AND teamId = $2 RETURNING playerId",
            [playerId, teamId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Player not in this team" });
        }

        // Check if team is now empty and delete it
        const teamMembersResult = await pool.query(
            "SELECT COUNT(*) FROM players WHERE teamId = $1",
            [teamId]
        );

        if (parseInt(teamMembersResult.rows[0].count) === 0) {
            await pool.query("DELETE FROM teams WHERE teamId = $1", [teamId]);
        }

        res.json({ message: "Successfully left team and deregistered from tournament" });
    } catch (error) {
        console.error("error leaving team", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get join code (only for team members)
router.get("/:teamId/join-code", async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { playerId } = req.query;

    if (!playerId) {
        return res.status(400).json({ error: "playerId is required" });
    }

    try {
        // Verify player is in the team
        const playerResult = await pool.query(
            "SELECT teamId FROM players WHERE playerId = $1 AND teamId = $2",
            [playerId, teamId]
        );

        if (playerResult.rows.length === 0) {
            return res.status(403).json({ error: "Not authorized to view team code" });
        }

        // Get join code
        const codeResult = await pool.query(
            "SELECT joinCode FROM teams WHERE teamId = $1",
            [teamId]
        );

        if (codeResult.rows.length === 0) {
            return res.status(404).json({ error: "Team not found" });
        }

        res.json({ joinCode: codeResult.rows[0].joincode });
    } catch (error) {
        console.error("error fetching join code", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/:id", async (req: Request, res:Response) => {
       const {id} = req.params
       try {
           // Check if team has any members
           const membersResult = await pool.query(
               "SELECT COUNT(*) FROM players WHERE teamId = $1",
               [id]
           );
           
           if (parseInt(membersResult.rows[0].count) > 0) {
               return res.status(409).json({ 
                   error: "Cannot delete team with members. Members must leave first." 
               });
           }

           await pool.query("DELETE FROM teams WHERE teamId = $1", [id]);
           res.status(204).send();
       } catch (error) {
         console.error("error deleting team", error);
         res.status(500).json({error: "Internal Server Error"});
       }
});

// Clean up empty teams
router.post("/cleanup/empty-teams", async (req: Request, res: Response) => {
    try {
        // Delete all teams with no members
        const result = await pool.query(`
            DELETE FROM teams 
            WHERE teamId NOT IN (
                SELECT DISTINCT teamId FROM players WHERE teamId IS NOT NULL
            )
        `);

        res.json({ 
            message: "Cleanup complete",
            deletedTeams: result.rowCount
        });
    } catch (error) {
        console.error("error cleaning up teams", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;