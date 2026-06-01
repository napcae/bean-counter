# Bean Counter

Your consistency streak tracker. Track GitHub commits, Strava activities, and more with a GitHub contribution heatmap-style visualization.

## Features

- 📊 Heatmap visualization of your daily activity
- 🔥 Streak tracking (current, longest, total)
- 🌙 Dark and light themes (Solarized-inspired, saturated geometric)
- 📱 Mobile-first responsive design
- ⚙️ Automatic daily sync via GitHub Actions
- 📝 Flat file data (JSON) for simplicity

## Setup

### 1. Enable GitHub Pages

1. Go to **Settings → Pages**
2. Set **Build and deployment** → **Source** to `GitHub Actions`

### 2. Configure Secrets

Add these to your repo secrets (Settings → Secrets and variables → Actions):

#### GitHub
- `GITHUB_USERNAME` - Your GitHub username
- `GH_SYNC_TOKEN` - GitHub personal access token with `repo` and `read:user` scopes
  - Generate at: https://github.com/settings/tokens/new

#### Strava (Optional)
- `STRAVA_CLIENT_ID` - From https://www.strava.com/settings/apps
- `STRAVA_CLIENT_SECRET` - From https://www.strava.com/settings/apps
- `STRAVA_REFRESH_TOKEN` - Generated via OAuth flow (see below)

### 3. Run Initial Sync

Go to **Actions → Sync Activity Data → Run workflow**

## Setting Up Strava Sync

### Step 1: Create a Strava App
1. Go to https://www.strava.com/settings/apps
2. Create a new app (fill in any name/description)
3. Copy your **Client ID** and **Client Secret** to a safe place

### Step 2: Get Refresh Token
Strava requires OAuth to get a refresh token. Use this script:

1. Save this as `get_strava_token.sh` and run it:
   ```bash
   #!/bin/bash
   CLIENT_ID="YOUR_CLIENT_ID"
   
   # Step A: Visit this URL in your browser
   echo "Visit this URL and authorize:"
   echo "https://www.strava.com/oauth/authorize?client_id=$CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read_all"
   
   # Step B: Paste the code from the redirect URL
   read -p "Paste the CODE from the URL: " CODE
   
   # Step C: Exchange code for tokens
   CLIENT_SECRET="YOUR_CLIENT_SECRET"
   curl -X POST https://www.strava.com/api/v3/oauth/token \
     -d client_id=$CLIENT_ID \
     -d client_secret=$CLIENT_SECRET \
     -d code=$CODE \
     -d grant_type=authorization_code
   ```

2. Replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with values from step 1
3. Run the script and copy the `refresh_token` from the output

### Step 3: Add to Repository Secrets
Add these to your repo (Settings → Secrets and variables → Actions):
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`  
- `STRAVA_REFRESH_TOKEN`

The sync script will use these to automatically refresh your access token on each run.

### What Gets Synced
- **GitHub**: Commit count per day (past 12 weeks)
- **Strava**: Activity count per day (past 12 weeks)
- Counts are shown as intensity levels on the heatmap

## How It Works

- **Daily sync**: GitHub Actions runs `sync.py` every day at 2 AM UTC
- **Data**: Counts commits and activities per day, stored in `data/activities.json`
- **Display**: Heatmap shows intensity (0-4 levels) based on count
- **Streaks**: Current and longest consecutive days with activity

## Development

Open `index.html` in a browser to view locally. Data will load from `data/activities.json`.

## Themes

- **Dark**: Saturated oranges, teals, and blues on dark background
- **Light**: Warm tones and cool accents on light background

Toggle with the theme button (top right).

## Adding More Activities

1. Create a new sync function in `sync.py` for your data source
2. Update `data/activities.json` structure as needed
3. Heatmaps will render automatically