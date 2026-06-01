#!/usr/bin/env python3
"""Sync GitHub and Strava activity data."""

import os
import json
import requests
from datetime import datetime, timedelta

DATA_FILE = 'data/activities.json'

def load_activities():
    """Load existing activity data."""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {'github': {}, 'strava': {}}

def save_activities(data):
    """Save activity data."""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def sync_github(username, token):
    """Fetch GitHub contributions for the past 12 weeks."""
    if not username or not token:
        print('Skipping GitHub sync: username or token not set')
        return {}

    activities = {}

    # Get commits for the past 12 weeks
    weeks = 12
    start_date = datetime.now() - timedelta(days=weeks*7)

    # Use GitHub API to get commits
    headers = {'Authorization': f'token {token}'}

    # Query: commits by this user in the past 12 weeks
    query = f'author:{username} committer-date:>={start_date.strftime("%Y-%m-%d")}'
    url = 'https://api.github.com/search/commits'

    try:
        params = {'q': query, 'per_page': 100, 'sort': 'committer-date'}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        commits = response.json().get('items', [])

        # Count commits by date
        for commit in commits:
            commit_date = commit['commit']['committer']['date'].split('T')[0]
            activities[commit_date] = activities.get(commit_date, 0) + 1

        print(f'GitHub: synced {len(commits)} commits')
    except Exception as e:
        print(f'GitHub sync failed: {e}')

    return activities

def sync_strava(refresh_token):
    """Fetch Strava activities for the past 12 weeks."""
    if not refresh_token:
        print('Skipping Strava sync: refresh token not set')
        return {}

    activities = {}

    client_id = os.getenv('STRAVA_CLIENT_ID')
    client_secret = os.getenv('STRAVA_CLIENT_SECRET')

    if not client_id or not client_secret:
        print('Skipping Strava sync: STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET not set')
        return {}

    try:
        # Refresh the access token
        token_url = 'https://www.strava.com/api/v3/oauth/token'
        token_params = {
            'client_id': client_id,
            'client_secret': client_secret,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token'
        }
        token_response = requests.post(token_url, params=token_params)
        token_response.raise_for_status()
        access_token = token_response.json()['access_token']

        # Fetch activities with fresh access token
        weeks = 12
        after = int((datetime.now() - timedelta(days=weeks*7)).timestamp())

        url = 'https://www.strava.com/api/v3/athlete/activities'
        headers = {'Authorization': f'Bearer {access_token}'}

        params = {'after': after, 'per_page': 200}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        strava_activities = response.json()

        # Count activities by date
        for activity in strava_activities:
            activity_date = activity['start_date'].split('T')[0]
            activities[activity_date] = activities.get(activity_date, 0) + 1

        print(f'Strava: synced {len(strava_activities)} activities')
    except Exception as e:
        print(f'Strava sync failed: {e}')

    return activities

def main():
    """Main sync function."""
    print('Starting sync...')

    data = load_activities()

    # GitHub sync
    github_username = os.getenv('GITHUB_USERNAME')
    github_token = os.getenv('GITHUB_TOKEN')
    if github_username and github_token:
        data['github'] = sync_github(github_username, github_token)

    # Strava sync
    strava_refresh_token = os.getenv('STRAVA_REFRESH_TOKEN')
    if strava_refresh_token:
        data['strava'] = sync_strava(strava_refresh_token)

    save_activities(data)
    print('Sync complete.')

if __name__ == '__main__':
    main()
