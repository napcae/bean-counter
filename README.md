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
- `STRAVA_TOKEN` - Strava API refresh token
  - Go to: https://www.strava.com/settings/apps
  - Create an app with any name
  - Note your **Client ID** and **Client Secret**
  - Visit this URL in your browser (replace with your IDs):
    ```
    https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read
    ```
  - You'll get a code in the redirect URL
  - Exchange it for a token using curl:
    ```bash
    curl -X POST https://www.strava.com/api/v3/oauth/token \
      -d client_id=YOUR_CLIENT_ID \
      -d client_secret=YOUR_CLIENT_SECRET \
      -d code=YOUR_CODE \
      -d grant_type=authorization_code
    ```
  - Use the `refresh_token` from the response

### 3. Run Initial Sync

Go to **Actions → Sync Activity Data → Run workflow**

## Setting Up Strava Sync

### Quick Start
1. Go to https://www.strava.com/settings/apps and create a new app
2. Note your **Client ID** and **Client Secret**
3. Authorize your app at: `https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read`
4. Extract the `code` from the redirect URL
5. Get your refresh token:
   ```bash
   curl -X POST https://www.strava.com/api/v3/oauth/token \
     -d client_id=YOUR_CLIENT_ID \
     -d client_secret=YOUR_CLIENT_SECRET \
     -d code=YOUR_CODE \
     -d grant_type=authorization_code
   ```
6. Add the `refresh_token` from the response as `STRAVA_TOKEN` secret in your repo

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