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

    try {
        const result = await pool.query("INSERT INTO teams RETURNING teamId");
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("error creating team", error);
        res.status(500).json({error: "Internal Server Error"});
    }
})

router.delete(":/id", async (req: Request, res:Response) => {
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