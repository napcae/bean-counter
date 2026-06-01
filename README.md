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
3. Save your **Client ID** and **Client Secret**

### Step 2: Get Refresh Token
1. Visit this URL (replace with your Client ID):
   ```
   https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read
   ```
2. Authorize the app - you'll be redirected to `http://localhost?code=XXXXXX`
3. Extract the `code` from the URL
4. Exchange it for tokens:
   ```bash
   curl -X POST https://www.strava.com/api/v3/oauth/token \
     -d client_id=YOUR_CLIENT_ID \
     -d client_secret=YOUR_CLIENT_SECRET \
     -d code=YOUR_CODE \
     -d grant_type=authorization_code
   ```
5. Copy the `refresh_token` from the response

### Step 3: Add to Repository Secrets
Add these three secrets to your repo (Settings → Secrets and variables → Actions):
- `STRAVA_CLIENT_ID` - Your app's Client ID
- `STRAVA_CLIENT_SECRET` - Your app's Client Secret
- `STRAVA_REFRESH_TOKEN` - The refresh token from step 2

The sync script will use these to automatically get a fresh access token on each run.

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