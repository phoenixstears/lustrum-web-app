# Discord OAuth2 Setup Guide

## Creating a Discord Application

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Log in with your Discord account

2. **Create New Application**
   - Click "New Application"
   - Enter name: "LustrumTournament" (or your preferred name)
   - Accept Terms and Create

3. **Get Client ID and Secret**
   - Go to "General Information" tab
   - Copy your **Client ID**
   - Click "Reset Secret" under CLIENT SECRET
   - Copy your **Client Secret** (keep this safe!)

4. **Set Redirect URLs**
   - Go to "OAuth2" tab
   - Click "Add Redirect"
   - Add these redirect URIs:
     - `http://localhost:5000/api/auth/discord/callback` (for local development)
     - `https://yourdomain.com/api/auth/discord/callback` (for production)

5. **Configure OAuth2 Scopes**
   - Under "OAuth2 > Scopes", select:
     - ✓ `identify`
     - ✓ `email` (optional, for email verification)

6. **Add Environment Variables**
   - Create `.env` file in `backend/` directory with:
   ```
   DISCORD_CLIENT_ID=your_client_id_here
   DISCORD_CLIENT_SECRET=your_client_secret_here
   DISCORD_REDIRECT_URI=http://localhost:5000/api/auth/discord/callback
   FRONTEND_URL=http://localhost:5173
   ```
   
   - For production:
   ```
   DISCORD_CLIENT_ID=your_client_id_here
   DISCORD_CLIENT_SECRET=your_client_secret_here
   DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/discord/callback
   FRONTEND_URL=https://yourdomain.com
   ```

7. **Save and Verify**
   - Once configured, you're ready to proceed with the implementation!

## Testing Your OAuth Setup

After implementation:
1. Start the backend server
2. Click "Login with Discord" on the signup page
3. You should be redirected to Discord authorization
4. After approving, you'll return to the app with your Discord data
