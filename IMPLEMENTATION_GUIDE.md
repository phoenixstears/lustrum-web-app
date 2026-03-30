# Discord OAuth2 Implementation Guide

## Overview
This implementation adds Discord OAuth2 authentication to your tournament signup system to prevent spam signups. Users must login with their Discord account, and the system uses their unique Discord ID to ensure they only signup once per tournament.

## Key Features
✅ Discord OAuth2 integration  
✅ Prevents duplicate signups using Discord ID  
✅ Displays Discord username in the system  
✅ Unique constraint on (discordId, tournamentId) to prevent database duplicates  
✅ User-friendly two-step signup flow  
✅ Error handling for already-signed-up users  

## Database Changes

### Updated `players` Table Schema
```sql
CREATE TABLE players (
  playerId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discordId BIGINT NOT NULL,           -- NEW: Unique Discord user ID
  discordName TEXT NOT NULL,           -- Discord username
  inGameName TEXT NOT NULL,            -- In-game player name
  tournamentId TEXT NOT NULL,          -- Tournament ID
  teamId UUID REFERENCES teams(teamId),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- NEW: Signup timestamp
  UNIQUE(discordId, tournamentId)      -- NEW: Prevents duplicate signups
)
```

### Migration for Existing Databases
If you have an existing database:
1. Run the migration script: `backend/db/migrations/001_add_discord_oauth.sql`
2. Handle any existing NULL values in the discordId column

## Backend Changes

### New Routes

#### 1. **Discord Authorization Initiation**
- **Endpoint**: `GET /api/auth/discord`
- **Purpose**: Redirects user to Discord OAuth consent screen
- **Query Params**: `state` (optional) - tournament ID to store in session
- **Redirect URL**: Discord authorization page

#### 2. **Discord OAuth Callback**
- **Endpoint**: `GET /api/auth/discord/callback`
- **Purpose**: Handles Discord OAuth callback with authorization code
- **Process**:
  - Exchanges authorization code for access token
  - Fetches user profile from Discord API
  - Redirects to frontend with user data as URL parameters
- **Returns**: Redirect with `discordId`, `discordName`, `email`, `tournamentId`

#### 3. **Check Existing Signup**
- **Endpoint**: `GET /api/auth/check-signup/:discordId/:tournamentId`
- **Purpose**: Checks if user already signed up for a tournament
- **Response**: `{ alreadySignedUp: boolean, playerId?: string }`

### Updated Routes

#### Players Signup (POST /api/players)
**Old Request:**
```json
{
  "discordname": "string",
  "ingamename": "string",
  "tournamentId": "string"
}
```

**New Request:**
```json
{
  "discordId": "string (Discord's numeric ID)",
  "discordName": "string",
  "inGameName": "string",
  "tournamentId": "string"
}
```

**Response:**
- **201 Created**: Successfully signed up
```json
{
  "playerId": "uuid",
  "discordId": "string",
  "discordName": "string",
  "inGameName": "string",
  "teamId": null,
  "tournamentId": "string"
}
```

- **409 Conflict**: Already signed up
```json
{
  "error": "You have already signed up for this tournament"
}
```

## Frontend Changes

### RegisterPage.tsx
The signup flow now has two steps:

**Step 1: Discord Login**
- User sees "Login with Discord" button
- Clicking redirects to `/api/auth/discord?state={tournamentId}`
- User authorizes the app on Discord's website

**Step 2: Complete Registration**
- After Discord auth, URL includes `discordId`, `discordName`, `email`
- Discord username is auto-filled and disabled (read-only)
- User only needs to enter in-game name
- System checks if they already signed up
- On submit, creates player with Discord ID

### Updated UI Elements
- Discord login button (Discord purple color: #5865F2)
- Two-step signup flow with clear instructions
- Auto-detection of duplicate signups
- Better error messaging

## Setup Instructions

### Step 1: Create Discord Application
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Fill in app name: "LustrumTournament" (or your choice)
4. Go to "OAuth2 > General"
5. Copy **Client ID**
6. Click "Reset Secret" and copy **Client Secret**

### Step 2: Configure OAuth2 Redirect URIs
1. In Discord app settings, go to "OAuth2 > Redirects"
2. Add redirect URI: `http://localhost:5000/api/auth/discord/callback`
3. For production, add: `https://yourdomain.com/api/auth/discord/callback`

### Step 3: Environment Variables
Create `.env` in `backend/` directory:
```env
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:5000/api/auth/discord/callback
FRONTEND_URL=http://localhost:5173
PORT=5000
```

### Step 4: Database Migration
If upgrading existing database:
```bash
# Connect to your PostgreSQL database and run:
psql -U postgres -d your_db_name -f backend/db/migrations/001_add_discord_oauth.sql
```

For new installations, the schema is already updated in `backend/db/init/006_player.sql`

### Step 5: Start Services
```bash
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

## Security Considerations

### ✅ What's Protected
- Discord ID is verified from Discord API
- Unique constraint prevents database-level duplicates
- Session-based flow (no storage of user state on server)
- CORS configured for frontend origin

### ⚠️ Future Enhancements (Optional)
- Implement JWT tokens for session management
- Add refresh token logic
- Store Discord refresh tokens for account linking
- Add email verification as secondary check
- Rate limiting on signup endpoint
- Admin moderation panel for removal

## Testing Workflow

### Local Testing
1. Create a Discord test server
2. Configure the app in Discord Developer Portal
3. Set redirect URI to `http://localhost:5000/api/auth/discord/callback`
4. Use test Discord account to signup

### Test Cases
- ✓ Fresh user signup → Should succeed
- ✓ Same user, same tournament → Should prevent (409 error)
- ✓ Same user, different tournament → Should allow
- ✓ OAuth error handling → Should show error message
- ✓ Different user signup → Should succeed

## Troubleshooting

### "Invalid Client ID" Error
- Verify Client ID in `.env` matches Discord app
- Check .env file is in `backend/` directory

### "Redirect URI mismatch" Error
- Ensure redirect URI in Discord app exactly matches:
  - `http://localhost:5000/api/auth/discord/callback` (for local)
  - `https://yourdomain.com/api/auth/discord/callback` (for production)

### User Can Signup Multiple Times
- Database was not migrated
- Run migration script: `backend/db/migrations/001_add_discord_oauth.sql`
- Ensure UNIQUE constraint is created

### "Cannot GET /api/auth/discord" Error
- Auth routes not imported in `backend/src/index.ts`
- Verify authRouter is added: `app.use('/api/auth', authRouter);`

### User Redirected to Home Instead of Signup
- Check `FRONTEND_URL` environment variable
- For development, should be `http://localhost:5173`

## API Reference

### GET /api/auth/discord
```
Purpose: Initiate Discord OAuth flow
Query: ?state=tournamentId (optional)
Redirects to: https://discord.com/api/oauth2/authorize?...
```

### GET /api/auth/discord/callback
```
Purpose: Handle Discord OAuth callback
Query: ?code=XXXXX
Returns: Redirect to {FRONTEND_URL}/register?discordId=XXX&discordName=XXX&tournamentId=XXX
```

### GET /api/auth/check-signup/:discordId/:tournamentId
```
Response: {
  "alreadySignedUp": boolean,
  "playerId": "uuid or null"
}
```

### POST /api/players
```
Body: {
  "discordId": "string",
  "discordName": "string",
  "inGameName": "string",
  "tournamentId": "string"
}

Success (201): Returns created player object
Conflict (409): Already signed up
```

## Files Changed

### Backend
- `src/index.ts` - Added auth routes
- `src/routes/auth.ts` - NEW: Discord OAuth endpoints
- `src/routes/players.ts` - Updated to use discordId
- `db/init/006_player.sql` - Updated schema
- `db/migrations/001_add_discord_oauth.sql` - NEW: Migration script
- `.env.example` - NEW: Environment variable template

### Frontend
- `src/registerPage.tsx` - Two-step OAuth flow
- `src/registerPage.css` - Discord button styling

## Next Steps

1. ✅ Create Discord app in Developer Portal
2. ✅ Set environment variables in `.env`
3. ✅ Run database migration (if existing DB)
4. ✅ Start backend and frontend services
5. ✅ Test signup flow with Discord account
6. ✅ Deploy to production with correct URLs

## Support

For issues:
1. Check Discord app configuration
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Check server logs for API errors
5. Ensure database migration ran successfully
