import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import playerRouter from "./routes/players.js";
import tournamentRouter from "./routes/tournaments.js";
import groupBracketRouter from "./routes/group_bracket.js";
import pool from "./db/index.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/players", playerRouter);
app.use("/api/tournaments", tournamentRouter);
app.use("/api/group_bracket", groupBracketRouter);

app.get("/api", async (_req: Request, res: Response) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ time: result.rows[0] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));