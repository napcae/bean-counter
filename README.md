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

- `GITHUB_USERNAME` - Your GitHub username
- `GH_SYNC_TOKEN` - GitHub personal access token (with `repo` and `read:user` scopes)
- `STRAVA_TOKEN` - Strava API token (optional)

### 3. Run Initial Sync

Go to **Actions → Sync Activity Data → Run workflow**

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