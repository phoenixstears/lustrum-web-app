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

export default router;