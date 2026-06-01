#!/usr/bin/env python3
"""Sync GitHub and Strava activity data."""

import os
import sys
import json
import requests
from datetime import datetime, timedelta

DATA_FILE = 'data/activities.json'
STRAVA_TOKEN_FILE = 'data/.strava-token.json'

def load_activities():
    """Load existing activity data."""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {'github': {}, 'strava': {}}

def load_strava_token():
    """Load persisted Strava refresh token from file or environment."""
    # Try file first (from previous sync)
    if os.path.exists(STRAVA_TOKEN_FILE):
        with open(STRAVA_TOKEN_FILE, 'r') as f:
            data = json.load(f)
            return data.get('refresh_token')
    # Fall back to environment variable
    return os.getenv('STRAVA_REFRESH_TOKEN')

def save_strava_token(refresh_token):
    """Persist new Strava refresh token to file."""
    os.makedirs('data', exist_ok=True)
    with open(STRAVA_TOKEN_FILE, 'w') as f:
        json.dump({'refresh_token': refresh_token}, f)

def save_activities(data):
    """Save activity data."""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def sync_github(username, token):
    """Fetch GitHub contributions for the past 12 weeks."""
    if not username or not token:
        raise ValueError('GitHub username or token not configured')

    activities = {}

    # Get commits for the past 12 weeks
    weeks = 12
    start_date = datetime.now() - timedelta(days=weeks*7)

    # Use GitHub API to get commits
    headers = {'Authorization': f'token {token}'}

    # Query: commits by this user in the past 12 weeks
    query = f'author:{username} committer-date:>={start_date.strftime("%Y-%m-%d")}'
    url = 'https://api.github.com/search/commits'

    params = {'q': query, 'per_page': 100, 'sort': 'committer-date'}
    response = requests.get(url, headers=headers, params=params)
    try:
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f'GitHub API request failed with status {response.status_code}: {e}')

    commits = response.json().get('items', [])

    # Count commits by date
    for commit in commits:
        commit_date = commit['commit']['committer']['date'].split('T')[0]
        activities[commit_date] = activities.get(commit_date, 0) + 1

    print(f'GitHub: synced {len(commits)} commits')
    return activities

def sync_strava(refresh_token):
    """Fetch Strava activities for the past 12 weeks."""
    if not refresh_token:
        raise ValueError('Strava refresh token not configured')

    activities = {}

    client_id = os.getenv('STRAVA_CLIENT_ID')
    client_secret = os.getenv('STRAVA_CLIENT_SECRET')

    if not client_id or not client_secret:
        raise ValueError('Strava client credentials not configured')

    # Refresh the access token
    token_url = 'https://www.strava.com/api/v3/oauth/token'
    token_params = {
        'client_id': client_id,
        'client_secret': client_secret,
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token'
    }
    try:
        token_response = requests.post(token_url, data=token_params)
        token_response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f'Failed to refresh Strava token: {e}. Response: {token_response.text}')

    token_data = token_response.json()
    if 'access_token' not in token_data:
        raise RuntimeError(f'Strava token response missing access_token: {token_data}')

    access_token = token_data['access_token']

    # Save the new refresh token for next run
    if 'refresh_token' in token_data:
        save_strava_token(token_data['refresh_token'])

    # Fetch activities with fresh access token
    weeks = 12
    after = int((datetime.now() - timedelta(days=weeks*7)).timestamp())

    url = 'https://www.strava.com/api/v3/athlete/activities'
    headers = {'Authorization': f'Bearer {access_token}'}

    params = {'after': after, 'per_page': 200}
    response = requests.get(url, headers=headers, params=params)
    try:
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f'Strava API request failed with status {response.status_code}: {e}')

    strava_activities = response.json()

    # Count activities by date
    for activity in strava_activities:
        activity_date = activity['start_date'].split('T')[0]
        activities[activity_date] = activities.get(activity_date, 0) + 1

    print(f'Strava: synced {len(strava_activities)} activities')
    return activities

def main():
    """Main sync function."""
    print('Starting sync...')

    data = load_activities()
    sync_failed = False

    # GitHub sync
    github_username = os.getenv('GITHUB_USERNAME')
    github_token = os.getenv('GITHUB_TOKEN')
    if github_username and github_token:
        try:
            data['github'] = sync_github(github_username, github_token)
        except Exception as e:
            print(f'Fatal: GitHub sync failed with error: {e}')
            sync_failed = True
    else:
        print('Skipping GitHub sync: credentials not configured')

    # Strava sync
    strava_refresh_token = load_strava_token()
    if strava_refresh_token:
        try:
            data['strava'] = sync_strava(strava_refresh_token)
        except Exception as e:
            print(f'Fatal: Strava sync failed with error: {e}')
            sync_failed = True
    else:
        print('Skipping Strava sync: refresh token not configured')

    if not sync_failed:
        save_activities(data)
        print('Sync complete.')
        return 0
    else:
        print('Sync failed: one or more sources had errors.')
        return 1

if __name__ == '__main__':
    sys.exit(main())
