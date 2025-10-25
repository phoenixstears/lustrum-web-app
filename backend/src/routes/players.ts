import express, { Request, Response, Router } from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "../index.js";

dotenv.config();

const router = express.Router();
router.use(cors());
router.use(express.json());

router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT playerid, discordname, ingamename, teamid FROM players");
    res.json(result.rows);
    } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/", async (req: Request, res: Response) => {
  const { discordname, ingamename, teamid } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO players (discordname, ingamename, teamid) VALUES ($1, $2, $3) RETURNING playerid, discordname, ingamename, teamid",
      [discordname, ingamename, teamid]
    );
    res.status(201).json(result.rows[0]);
  }
  catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM players WHERE playerid = $1", [id]);
    res.status(204).send();
  }
  catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } 
});

router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { discordname, ingamename, teamid } = req.body;
  try {
    const result = await pool.query(  
      "UPDATE players SET discordname = $1, ingamename = $2, teamid = $3 WHERE playerid = $4 RETURNING playerid, discordname, ingamename, teamid",
      [discordname, ingamename, teamid, id]
    );
    res.json(result.rows[0]);
  }
  catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;