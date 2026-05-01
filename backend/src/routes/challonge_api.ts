import { Express } from "express";
import express, { Request, Response } from "express";
import pool from "../db/index.js";
import axios from "axios";




const challonge = axios.create({
  baseURL: "https://api.challonge.com/v2.1",
  headers: {
    "Authorization": process.env.CHALLONGE_API_KEY!,
    "Authorization-Type": "v1",
    "Content-Type": "application/vnd.api+json",
    "Accept": "application/json"
  }
});

challonge.interceptors.request.use((config) => {
  console.log("➡️ REQUEST:");
  console.log("METHOD:", config.method);
  console.log("HEADERS:", config.headers);
  console.log("DATA:", config.data);
  return config;
});


const router = express.Router();


router.post("/tournament", async (req: Request, res: Response) => {
    const body = req.body ?? {};
    const {name, url, type, teamsPerGroup, teamsAdvance} = body;
    if(!name || !url || !type){
      return res.status(400).json({ error: 'missing required fields' });
    }
    const result = await createTournament(name,url,type,teamsPerGroup,teamsAdvance);
    res.status(201).json(result);
});

router.post("/players", async (req: Request, res: Response) => {
    const body = req.body ?? {};
    const {data,id} = body;
    const result = await addParticipants(data,id);
    console.log(data);
    res.status(201).json(result);
});
export async function createTournament(name: String, url: String, type: String, teamsPerGroup: number = 0, teamsAdvance: number = 0) {
    if(type == "single"){
  const res = await challonge.post("/tournaments.json", {
  "data": {
    "attributes": {
      "name": name,
      "url": url,
      "tournament_type": "single elimination",
      "game_name": name,
      "private": true
    }
  }
  });
   return res.data;
    } else if (type == "double"){
  const res = await challonge.post("/tournaments.json", {
  "data": {
    "attributes": {
      "name": name,
      "url": url,
      "tournament_type": "double elimination",
      "game_name": name,
      "private": true,
      "double_elimination_options": {
        "grand_finals_modifier": "skip"
      }
    }
  }
  });
   return res.data;
    } else if (type == "groupSingle"){
  const res = await challonge.post("/tournaments.json", {
  "data": {
    "attributes": {
      "name": name,
      "url": url,
      "tournament_type": "single elimination",
      "game_name": name,
      "private": true,
      "group_stage_enabled": true,
      "group_stage_options": {
        "group_size": teamsPerGroup,
        "participant_count_to_advance_per_group": teamsAdvance,
        "ranked_by": "match wins"
      }
    }
  }
  });
   return res.data;
    } else if (type == "groupDouble"){
  const res = await challonge.post("/tournaments.json", {
  "data": {
    "attributes": {
      "name": name,
      "url": url,
      "tournament_type": "double elimination",
      "game_name": name,
      "private": true,
      "group_stage_enabled": true,
      "group_stage_options": {
        "group_size": teamsPerGroup,
        "participant_count_to_advance_per_group": teamsAdvance,
        "ranked_by": "match wins"
      },
      "double_elimination_options": {
        "grand_finals_modifier": "skip"
      }
    }
  }
  });
   return res.data;
    } else {
        return null;
    }
}


export async function addParticipants(body:JSON, tournamentId: number) {

  const res = await challonge.post(
    `/tournaments/${tournamentId}/participants/bulk_add.json`,
    body
  );
  return res.data;
}
export default router;