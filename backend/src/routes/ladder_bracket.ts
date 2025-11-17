import express, { Request, Response} from "express"
import pool from "../db/index.js"

const router = express.Router()

router.get("/", async (req: Request,res: Response) => {
    try{
        const result = await pool.query('SELECT * FROM ladder_brackets');
        res.json(result.rows);
    } catch (error){
      console.error("Error fetching ladder brackets", error);
      res.status(500).json({ error: "Internal Server Error"});
    }
});

router.get("/:id", async (req: Request, res: Response) => {
        const { id } = req.params;
        try{
            const result = await pool.query('SELECT * FROM ladder_brackets WHERE bracketId = $1', [id]);
            res.json(result.rows[0]);
        } catch (error){
            console.error("Error fetching ladder bracket", error);
            res.status(500).json({ error: "Internal Sever Error"});
        }
});

// get by tournament id, only use when sure that it exists
router.get("/tournament/:id", async (req: Request, res: Response) => {
        const { id } = req.params;
        try{
            const result = await pool.query('SELECT * FROM ladder_brackets WHERE tournamentId = $1', [id]);
            res.json(result.rows[0]);
        } catch (error){
            console.error("Error fetching ladder bracket", error);
            res.status(500).json({ error: "Internal Sever Error"});
        }
});

router.post("/", async (req: Request, res: Response) => {
         const body = req.body ?? {};
         const {size, tournamentId} = body;
         if (!size){
            return res.status(400).json({ error: "size is required."});
         }
         try {
            const result = await pool.query('INSERT INTO ladder_brackets (size, tournamentId) VALUES ($1, $2) RETURNING bracketId, size, tournamentId', [size, tournamentId]);
            res.status(201).json(result.rows[0]);
         } catch (error){
            console.error("Error creating group bracket", error);
            res.status(500).json({error: "Internal Server Errorr"});
         }
});

router.put("/:id", async (req: Request, res: Response) => {
        const { id } = req.params;
        const body = req.body ?? {};
        const {size, tournamentId} = body;
        if(!size || !id){
            return res.status(400).json({ error: "size and id are required."});
        }
        try {
            const result = await pool.query ('UPDATE ladder_brackets SET size = $2, tournamentId = $3 WHERE bracketId = $1', [id,size,tournamentId]);
            res.json(result.rows[0]);
        } catch (error)
        {
            console.error("Error updating ladder bracket", error);
            res.status(500).json({ error: "Internal Server Error"});
        }
});

router.delete("/:id", async (req: Request, res: Response) => {
       const { id } = req.params;
       try {
         await pool.query('DELETE FROM ladder_brackets WHERE bracketId = $1', [id]);
         res.status(204).send();
       } catch (error){
         console.error("Error deleting ladder bracket", error);
         res.status(500).json({error: "Internal Server Error"});
       }
});

export default router;