import express, {Request, Response} from "express";
import pool from "../db/index.js" 

const router = express.Router()



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
        const result = await pool.query("INSERT INTO teams (teamName) VALUES ($1) RETURNING teamId", [teamName]);
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

router.delete("/:id", async (req: Request, res:Response) => {
       const {teamId} = req.params
       try {
           await pool.query("DELETE FROM teams WHERE teamId = $1", [teamId]);
           res.status(204).send();
       } catch (error) {
         console.error("error deleting team", error);
         res.status(500).json({error: "Internal Server Error"});
       }
});


export default router;