import { getBasePath, navLinks } from './router.js';
import { storage } from './storage.js';

const page = document.body.dataset.page || 'index';
const app = document.getElementById('app');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getDataBasePath() {
  return window.location.pathname.startsWith('/RUAfit/') ? '/RUAfit/' : '/';
}

async function getJson(path) {
  const base = getDataBasePath();
  const response = await fetch(`${base}data/${path}`);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

function renderShell(eventData) {
  const links = navLinks();
  const linksHtml = links.map((link) => `<a href="${link.href}">${link.label}</a>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `
    <header class="site-header">
      <div class="header-inner">
        <strong>${escapeHtml(eventData.name || 'RUAfit')}</strong>
        <button type="button" id="navToggle" class="nav-toggle" aria-label="Open menu">☰</button>
        <nav class="primary-nav">${linksHtml}</nav>
      </div>
      <nav id="mobileNav" class="mobile-nav">${linksHtml}</nav>
    </header>
  `);

  document.body.insertAdjacentHTML('beforeend', `
    <footer class="site-footer">
      <div>${escapeHtml(eventData.name || 'Event')}</div>
      <div>${escapeHtml(eventData.dates || '')}</div>
      <div>Contact: ${escapeHtml(eventData.contact?.email || '')}</div>
    </footer>
  `);

  const btn = document.getElementById('navToggle');
  const mobile = document.getElementById('mobileNav');
  btn?.addEventListener('click', () => mobile?.classList.toggle('open'));
  mobile?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => mobile.classList.remove('open')));
}

function renderHome(eventData) {
  app.innerHTML = `
    <section class="card">
      <h1>${escapeHtml(eventData.name || '')}</h1>
      <p class="small">${escapeHtml(eventData.dates || '')}</p>
      <p class="small">${escapeHtml(eventData.location || '')}</p>
    </section>
    <section class="grid two home-links">
      <a class="link-button" href="${getBasePath()}programme.html">Programme</a>
      <a class="link-button" href="${getBasePath()}sports.html">Sports</a>
      <a class="link-button" href="${getBasePath()}venue.html">Venue</a>
      <a class="link-button" href="${getBasePath()}gallery.html">Gallery</a>
      <a class="link-button" href="${getBasePath()}announcements.html">Announcements</a>
      <a class="link-button" href="${getBasePath()}contact.html">Contact</a>
    </section>
  `;
}

function renderProgramme(programme) {
  app.innerHTML = `<h1>Programme</h1>${programme.map((day) => `
    <section class="card">
      <h2>${escapeHtml(day.day)}</h2>
      <p class="small">${escapeHtml(day.date)}</p>
      <ul>${day.items.map((item) => `<li><strong>${escapeHtml(item.time)}</strong> — ${escapeHtml(item.activity)}</li>`).join('')}</ul>
    </section>
  `).join('')}`;
}

function renderSports(sports) {
  app.innerHTML = `<h1>Sports</h1>${sports.map((sport) => {
    const teams = Array.isArray(sport.teams) ? sport.teams : [];
    const teamsHtml = teams.length === 0
      ? ''
      : `<h3>Teams</h3><ul>${teams.map((team) => `<li>${escapeHtml(team)}</li>`).join('')}</ul>`;

    return `
      <section class="card">
        <h2>${escapeHtml(sport.code)}</h2>
        <p>Location: ${escapeHtml(sport.location)}</p>
        <p>${escapeHtml(sport.notes)}</p>
        <a href="${escapeHtml(sport.drawUrl)}" target="_blank" rel="noreferrer">View draw</a>
        ${teamsHtml}
      </section>
    `;
  }).join('')}`;
}

function normalizeTeams(teams) {
  if (!Array.isArray(teams)) return [];

  const seen = new Set();
  const normalized = [];

  teams.forEach((team) => {
    if (typeof team !== 'string') return;
    const cleaned = team.trim();
    if (!cleaned) return;

    const key = cleaned.toLowerCase();
    if (seen.has(key)) return;

    seen.add(key);
    normalized.push(cleaned);
  });

  return normalized;
}

function applyTeamOverrides(sports, teamOverrides) {
  if (!teamOverrides || typeof teamOverrides !== 'object') return sports;

  return sports.map((sport) => {
    if (!Object.prototype.hasOwnProperty.call(teamOverrides, sport.code)) return sport;

    return {
      ...sport,
      teams: normalizeTeams(teamOverrides[sport.code])
    };
  });
}

function parseTeamImport(rawText) {
  const parsed = JSON.parse(rawText);
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('Invalid format. Use { "Sport Code": ["Team A", "Team B"] }.');
  }

  const normalized = {};
  Object.entries(parsed).forEach(([sportCode, teams]) => {
    if (typeof sportCode !== 'string') return;
    const code = sportCode.trim();
    if (!code) return;
    normalized[code] = normalizeTeams(teams);
  });

  return normalized;
}

function setupTeamImport({ sports, onImportComplete }) {
  const importButton = document.getElementById('importTeamsBtn');
  const fileInput = document.getElementById('importTeamsInput');
  const status = document.getElementById('importTeamsStatus');

  if (!importButton || !fileInput || !status) return;

  const sportCodes = new Set(sports.map((sport) => sport.code));

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.style.color = isError ? '#b00020' : '';
  };

  importButton.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const [file] = fileInput.files || [];
    if (!file) return;

    try {
      const text = await file.text();
      const importedMap = parseTeamImport(text);
      const existing = storage.getImportedSportTeams();
      const nextOverrides = { ...existing };

      let matched = 0;
      Object.entries(importedMap).forEach(([sportCode, teams]) => {
        if (!sportCodes.has(sportCode)) return;
        nextOverrides[sportCode] = teams;
        matched += 1;
      });

      storage.setImportedSportTeams(nextOverrides);
      onImportComplete(nextOverrides);

      if (matched === 0) {
        setStatus('No matching sports found in file.');
      } else {
        setStatus('Imported. Saved on this device.');
      }
    } catch (error) {
      setStatus(error?.message || 'Import failed. Check your JSON file.', true);
    } finally {
      fileInput.value = '';
    }
  });
}

function renderVenue(eventData) {
  app.innerHTML = `
    <section class="card">
      <h1>Venue</h1>
      <p>${escapeHtml(eventData.location || '')}</p>
      <p class="small">Add maps, parking info, kai stalls, medical assistance, and other venue details here.</p>
      <iframe title="Venue map" style="width:100%;height:260px;border:0;border-radius:10px;" src="https://www.google.com/maps/embed?pb=" loading="lazy"></iframe>
    </section>
  `;
}

function renderGallery(gallery) {
  app.innerHTML = `<h1>Gallery</h1><div class="grid two gallery">${gallery.map((photo) => `
    <figure class="card">
      <img src="${escapeHtml(photo.image)}" alt="${escapeHtml(photo.caption)}" />
      <figcaption>${escapeHtml(photo.caption)}</figcaption>
    </figure>
  `).join('')}</div>`;
}

function renderAnnouncements(items) {
  const sorted = [...items].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  app.innerHTML = `<h1>Announcements</h1>${sorted.length === 0 ? '<p>No announcements yet.</p>' : sorted.map((item) => `
    <section class="card">
      <p>${escapeHtml(item.message)}</p>
      <p class="small">${escapeHtml(new Date(item.timestamp).toLocaleString())}</p>
    </section>
  `).join('')}`;
}

function renderContact(eventData) {
  app.innerHTML = `
    <section class="card">
      <h1>Contact</h1>
      <p>Email: ${escapeHtml(eventData.contact?.email || '')}</p>
      <p>Phone: ${escapeHtml(eventData.contact?.phone || '')}</p>
    </section>
  `;
}

function renderOffline() {
  app.innerHTML = `
    <section class="card">
      <h1>You're offline</h1>
      <p>It looks like you don't have an internet connection right now.</p>
      <button type="button" id="retryBtn" class="button">Try again</button>
    </section>
  `;
  document.getElementById('retryBtn')?.addEventListener('click', () => window.location.reload());
}

async function main() {
  try {
    const eventData = await getJson('event.json');
    renderShell(eventData);

    const session = storage.getSession();
    storage.setSession({ ...session, lastVisited: new Date().toISOString(), page });

    if (page === 'index') renderHome(eventData);
    if (page === 'programme') renderProgramme(await getJson('programme.json'));
    if (page === 'sports') {
      const sports = await getJson('sports.json');
      const overrides = storage.getImportedSportTeams();
      let mergedSports = applyTeamOverrides(sports, overrides);

      renderSports(mergedSports);

      setupTeamImport({
        sports,
        onImportComplete(nextOverrides) {
          mergedSports = applyTeamOverrides(sports, nextOverrides);
          renderSports(mergedSports);
        }
      });
    }
    if (page === 'venue') renderVenue(eventData);
    if (page === 'gallery') renderGallery(await getJson('gallery.json'));
    if (page === 'announcements') renderAnnouncements(await getJson('announcements.json'));
    if (page === 'contact') renderContact(eventData);
    if (page === 'offline') renderOffline();
    if (page === '404') app.innerHTML = `<section class="card"><h1>Page Not Found</h1><p>The page you're looking for does not exist.</p><a class="link-button" href="${getBasePath()}index.html">Go back home</a></section>`;

    storage.setCachedData({ loadedAt: Date.now(), page });
  } catch (error) {
    app.innerHTML = `<section class="card"><h1>Unable to load app content</h1><p>${escapeHtml(error.message)}</p></section>`;
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${getBasePath()}service-worker.js`).catch(() => {});

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SERVICE_WORKER_UPDATED') {
        window.location.reload();
      }
    });
  });
}

main();
