import express, { Request, Response } from "express";
import pool from "../db/index.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  email?: string;
}

// Step 1: Redirect user to Discord OAuth
router.get("/discord", (req: Request, res: Response) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    process.env.DISCORD_REDIRECT_URI || "http://localhost:5000/api/auth/discord/callback"
  );
  const scope = encodeURIComponent("identify email");
  const state = req.query.state as string || ""; // Capture tournament ID passed from frontend
  
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
  
  res.redirect(discordAuthUrl);
});

// Step 2: Handle Discord OAuth callback
router.get("/discord/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const tournamentId = req.query.state as string;

  if (!code) {
    return res.status(400).json({ error: "No authorization code provided" });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || "",
        client_secret: process.env.DISCORD_CLIENT_SECRET || "",
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI || "http://localhost:5000/api/auth/discord/callback",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Discord
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch Discord user");
    }

    const discordUser: DiscordUser = await userResponse.json();

    // Store Discord user info in session/return to frontend
    const userData = {
      discordId: discordUser.id,
      discordName: discordUser.username,
      email: discordUser.email,
    };

    // Redirect to frontend with user data in the correct URL structure
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const params = new URLSearchParams({
      discordId: userData.discordId,
      discordName: userData.discordName,
      email: userData.email || "",
      tournamentId: tournamentId || "",
    });

    // Include tournament ID in the path if available
    const redirectPath = tournamentId 
      ? `${frontendUrl}/tournament/${tournamentId}/register?${params.toString()}`
      : `${frontendUrl}/register?${params.toString()}`;
    
    res.redirect(redirectPath);
  } catch (error) {
    console.error("OAuth callback error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/register?error=${encodeURIComponent("Failed to authenticate with Discord")}`);
  }
});

// Step 3: Check if user already signed up for a tournament
router.get("/check-signup/:discordId/:tournamentId", async (req: Request, res: Response) => {
  const { discordId, tournamentId } = req.params;

  try {
    const result = await pool.query(
      "SELECT playerId FROM players WHERE discordId = $1 AND tournamentId = $2",
      [discordId, tournamentId]
    );

    if (result.rows.length > 0) {
      return res.json({ alreadySignedUp: true, playerId: result.rows[0].playerid });
    }

    res.json({ alreadySignedUp: false });
  } catch (error) {
    console.error("Error checking signup:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
