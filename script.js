const WEEKS = 12;
const DAYS_PER_WEEK = 7;

async function loadActivities() {
  try {
    const response = await fetch('data/activities.json');
    return await response.json();
  } catch (error) {
    console.error('Failed to load activities:', error);
    return { github: {}, strava: {} };
  }
}

function getDateRange(weeks) {
  const dates = [];
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 1);

  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  return dates;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getIntensityLevel(count) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 7) return 3;
  return 4;
}

function getCurrentStreak(data) {
  const dates = getDateRange(52).reverse();
  let streak = 0;

  for (const date of dates) {
    const dateStr = formatDate(date);
    if ((data[dateStr] || 0) > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function getLongestStreak(data) {
  const dates = getDateRange(52);
  let currentStreak = 0;
  let longestStreak = 0;

  for (const date of dates) {
    const dateStr = formatDate(date);
    if ((data[dateStr] || 0) > 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
}

function getTotalCount(data) {
  return Object.values(data).reduce((sum, count) => sum + (count || 0), 0);
}

function renderHeatmap(data, activityName) {
  const container = document.createElement('div');
  container.className = 'activity-card';

  const currentStreak = getCurrentStreak(data);
  const longestStreak = getLongestStreak(data);
  const totalCount = getTotalCount(data);

  const title = document.createElement('div');
  title.className = 'activity-title';
  title.innerHTML = `
    <span>${activityName}</span>
    ${currentStreak > 0 ? `<span class="streak">${currentStreak} day streak 🔥</span>` : ''}
  `;
  container.appendChild(title);

  const stats = document.createElement('div');
  stats.className = 'activity-stats';
  stats.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Total</span>
      <span class="stat-value">${totalCount}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Current</span>
      <span class="stat-value">${currentStreak}d</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Best</span>
      <span class="stat-value">${longestStreak}d</span>
    </div>
  `;
  container.appendChild(stats);

  const grid = document.createElement('div');
  grid.className = 'heatmap-grid';

  const dates = getDateRange(WEEKS);

  for (const date of dates) {
    const dateStr = formatDate(date);
    const count = data[dateStr] || 0;
    const level = getIntensityLevel(count);

    const cell = document.createElement('div');
    cell.className = `heatmap-cell level-${level}`;
    cell.title = `${dateStr}: ${count} activity`;
    cell.setAttribute('data-date', dateStr);
    cell.setAttribute('data-count', count);

    grid.appendChild(cell);
  }

  container.appendChild(grid);
  return container;
}

async function init() {
  const activities = await loadActivities();
  const container = document.getElementById('activities-container');

  if (activities.github && Object.keys(activities.github).length > 0) {
    container.appendChild(renderHeatmap(activities.github, 'GitHub'));
  }

  if (activities.strava && Object.keys(activities.strava).length > 0) {
    container.appendChild(renderHeatmap(activities.strava, 'Strava'));
  }

  if (!activities.github || Object.keys(activities.github).length === 0) {
    const placeholder = document.createElement('div');
    placeholder.className = 'activity-card';
    placeholder.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No data yet. Syncing will happen daily.</p>';
    container.appendChild(placeholder);
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  html.classList.remove(currentTheme);
  html.classList.add(newTheme);

  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.classList.add(savedTheme);
  updateThemeIcon(savedTheme);
}

initTheme();
init();
