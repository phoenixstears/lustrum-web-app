import express, { Request, Response } from "express";
import pool from "../db/index.js";

const router = express.Router();

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
  console.log("POST /api/players headers:", req.headers);
  console.log("POST /api/players body:", req.body);

  const body = req.body ?? {};
  const { discordname, ingamename} = body;

  if (!discordname || !ingamename) {
    return res.status(400).json({ error: "discordname, ingamename and teamid are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO players (discordname, ingamename) VALUES ($1, $2) RETURNING playerid, discordname, ingamename, teamid",
      [discordname, ingamename]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body ?? {};
  const { discordname, ingamename, teamid } = body;

  if (!discordname || !ingamename || teamid == null) {
    return res.status(400).json({ error: "discordname, ingamename and teamid are required" });
  }

  try {
    const result = await pool.query(
      "UPDATE players SET discordname = $1, ingamename = $2, teamid = $3 WHERE playerid = $4 RETURNING playerid, discordname, ingamename, teamid",
      [discordname, ingamename, teamid, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
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