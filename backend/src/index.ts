import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import userRouter from "./routes/players.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/players", userRouter);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;

app.get("/api", async (_req: Request, res: Response) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ time: result.rows[0] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));