# Discord OAuth2 Quick Start Checklist

## ✅ Pre-Setup
- [ ] Have a Discord account
- [ ] Node.js and npm installed
- [ ] PostgreSQL running
- [ ] Clone/download the code changes

## 🔐 Step 1: Create Discord Application (5-10 minutes)

1. Go to: https://discord.com/developers/applications
2. Click "New Application" → Name it "LustrumTournament"
3. Go to "General Information" tab → Copy **Client ID**
4. Go to "OAuth2" tab → Click "Reset Secret" → Copy **Client Secret**
5. Go to "OAuth2 > Redirects"
6. Add this redirect URI:
   ```
   http://localhost:5000/api/auth/discord/callback
   ```
7. Click Save

**Save these values** - you'll need them in Step 2!

---

## 🔧 Step 2: Configure Environment Variables (2 minutes)

1. Open `backend/.env` (create if doesn't exist)
2. Add these lines with your values from Step 1:
   ```env
   DISCORD_CLIENT_ID=paste_your_client_id_here
   DISCORD_CLIENT_SECRET=paste_your_client_secret_here
   DISCORD_REDIRECT_URI=http://localhost:5000/api/auth/discord/callback
   FRONTEND_URL=http://localhost:5173
   PORT=5000
   ```
3. Save the file

---

## 📦 Step 3: Update Database (3-5 minutes)

### For NEW installations:
✓ Already done! Schema in `backend/db/init/006_player.sql` is updated

### For EXISTING installations:
1. Connect to your PostgreSQL database
2. Run this migration:
   ```bash
   psql -U postgres -d your_database_name -f backend/db/migrations/001_add_discord_oauth.sql
   ```
3. If you get unique constraint error, existing data has duplicates. Contact us for cleanup.

---

## 🚀 Step 4: Start Services (1 minute)

### Terminal 1 - Backend:
```bash
cd backend
npm install
npm start
```
Should see: `Server running on port 5000`

### Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm run dev
```
Should see: `http://localhost:5173`

---

## 🧪 Step 5: Test It (2-3 minutes)

1. Open http://localhost:5173 in browser
2. Click "Register for Tournament" for any tournament
3. Click "🔗 Login with Discord"
4. Approve permissions on Discord
5. You'll return with your Discord name auto-filled
6. Enter in-game name and submit
7. ✅ Success! You should see confirmation
8. Try to sign up again with same tournament - should get "already signed up" error

---

## 📋 What Was Changed

### Database
- Added `discordId` field (Discord's numeric ID) - **REQUIRED**
- Made `discordId + tournamentId` unique - prevents duplicates
- Added `createdAt` timestamp

### Backend
- New file: `src/routes/auth.ts` - Discord OAuth endpoints
- Updated: `src/routes/players.ts` - uses discordId instead of just discordName
- Updated: `src/index.ts` - added auth route
- New migration: `db/migrations/001_add_discord_oauth.sql`

### Frontend
- Updated: `src/registerPage.tsx` - two-step signup with Discord login
- Updated: `src/registerPage.css` - Discord button styling

---

## 🐛 Troubleshooting

### "Invalid authorization code" or "Redirect URI mismatch"
- ✓ Check Discord app settings → OAuth2 > Redirects
- ✓ Must be exactly: `http://localhost:5000/api/auth/discord/callback`

### User can sign up multiple times
- ✓ Database migration not completed
- ✓ Run: `psql -U postgres -d your_db_name -f backend/db/migrations/001_add_discord_oauth.sql`

### "Cannot GET /api/auth/discord"
- ✓ Backend didn't restart after code changes
- ✓ Restart: `npm start` in backend folder

### Button shows but page doesn't redirect to Discord
- ✓ Check DISCORD_CLIENT_ID in `.env` is correct
- ✓ Check `.env` file is in `backend/` folder (not root)
- ✓ Backend logs should show what's wrong

### Blank screen after Discord approval
- ✓ Check FRONTEND_URL in `.env` is `http://localhost:5173`
- ✓ Frontend must be running: `npm run dev`

---

## 📚 Documentation Files

- `DISCORD_OAUTH_SETUP.md` - Detailed Discord app setup guide
- `IMPLEMENTATION_GUIDE.md` - Complete technical documentation
- `backend/.env.example` - Example environment variables

---

## ✨ Features Now Enabled

✅ Users must login with Discord  
✅ Cannot sign up twice for same tournament  
✅ Spam signups prevented (verified Discord identity)  
✅ Tournament has real Discord usernames  
✅ Can still edit in-game name later  
✅ Two-factor verification ready for future (email, etc.)  

---

## 🎉 Next Steps

1. **Immediate**: Get Discord app setup and test locally (30 mins total)
2. **Soon**: Deploy to production with correct URLs
3. **Future**: Add admin panel to manage/remove signups
4. **Future**: Add email verification as optional second factor

---

## Questions?

Check the detailed docs:
1. `DISCORD_OAUTH_SETUP.md` - Discord side setup
2. `IMPLEMENTATION_GUIDE.md` - Code & API reference
3. Comment/function names in code have inline documentation
