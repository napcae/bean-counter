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
  const currentStreak = getCurrentStreak(data);
  const longestStreak = getLongestStreak(data);
  const totalCount = getTotalCount(data);

  const card = document.createElement('div');
  card.className = 'card bg-base-200';

  const body = document.createElement('div');
  body.className = 'card-body p-4 md:p-6';

  const title = document.createElement('div');
  title.className = 'flex items-center justify-between mb-4';
  title.innerHTML = `
    <h2 class="card-title text-lg md:text-xl">${activityName}</h2>
    ${currentStreak > 0 ? `<div class="badge badge-warning gap-1"><span>🔥</span><span>${currentStreak}d</span></div>` : ''}
  `;
  body.appendChild(title);

  const stats = document.createElement('div');
  stats.className = 'grid grid-cols-3 gap-4 mb-4';
  stats.innerHTML = `
    <div class="stat place-items-center">
      <div class="stat-title text-xs md:text-sm">Total</div>
      <div class="stat-value text-lg md:text-2xl">${totalCount}</div>
    </div>
    <div class="stat place-items-center">
      <div class="stat-title text-xs md:text-sm">Current</div>
      <div class="stat-value text-lg md:text-2xl">${currentStreak}d</div>
    </div>
    <div class="stat place-items-center">
      <div class="stat-title text-xs md:text-sm">Best</div>
      <div class="stat-value text-lg md:text-2xl">${longestStreak}d</div>
    </div>
  `;
  body.appendChild(stats);

  const grid = document.createElement('div');
  grid.className = 'heatmap-grid';

  const dates = getDateRange(WEEKS);

  for (const date of dates) {
    const dateStr = formatDate(date);
    const count = data[dateStr] || 0;
    const level = getIntensityLevel(count);

    const cell = document.createElement('div');
    cell.className = `heatmap-cell level-${level}`;
    cell.title = `${dateStr}: ${count} ${activityName.toLowerCase()}`;
    cell.setAttribute('data-date', dateStr);
    cell.setAttribute('data-count', count);

    grid.appendChild(cell);
  }

  body.appendChild(grid);
  card.appendChild(body);
  return card;
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
    placeholder.className = 'card bg-base-200';
    placeholder.innerHTML = '<div class="card-body text-center"><p class="text-base-content/60">No data yet. Syncing will happen daily.</p></div>';
    container.appendChild(placeholder);
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'solarized-dark' ? 'solarized-light' : 'solarized-dark';

  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  icon.textContent = theme === 'solarized-dark' ? '☀️' : '🌙';
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'solarized-dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

initTheme();
init();
