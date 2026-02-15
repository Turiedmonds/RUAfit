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

function sportLookupKey(value) {
  return String(value || '').trim().toLowerCase();
}

function dedupeTeamNames(teams) {
  if (!Array.isArray(teams)) return [];

  const seen = new Set();
  const output = [];

  teams.forEach((team) => {
    if (typeof team !== 'string') return;
    const cleaned = team.trim();
    if (!cleaned) return;

    const key = cleaned.toLocaleLowerCase();
    if (seen.has(key)) return;

    seen.add(key);
    output.push(cleaned);
  });

  return output;
}

function shuffleTeams(teams) {
  const shuffled = [...teams];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function pairTeams(teams) {
  const pairs = [];
  for (let index = 0; index < teams.length; index += 2) {
    pairs.push({ home: teams[index], away: teams[index + 1] || 'BYE' });
  }
  return pairs;
}

function sanitizeSportEntry(sport) {
  if (!sport || typeof sport !== 'object') return null;

  const code = typeof sport.code === 'string' ? sport.code.trim() : '';
  if (!code) return null;

  return {
    code,
    location: typeof sport.location === 'string' ? sport.location : '',
    notes: typeof sport.notes === 'string' ? sport.notes : ''
  };
}

function mergeSports(baseSports, userSports, teamMap, drawMap) {
  const merged = [];
  const keyIndex = new Map();

  baseSports.forEach((sport) => {
    const cleanSport = sanitizeSportEntry(sport);
    if (!cleanSport) return;

    const lookupKey = sportLookupKey(cleanSport.code);
    keyIndex.set(lookupKey, true);
    merged.push({
      ...cleanSport,
      lookupKey,
      teams: dedupeTeamNames(teamMap[lookupKey]),
      draw: Array.isArray(drawMap[lookupKey]) ? drawMap[lookupKey] : []
    });
  });

  userSports.forEach((sport) => {
    const cleanSport = sanitizeSportEntry(sport);
    if (!cleanSport) return;

    const lookupKey = sportLookupKey(cleanSport.code);
    if (!lookupKey || keyIndex.has(lookupKey)) return;

    keyIndex.set(lookupKey, true);
    merged.push({
      ...cleanSport,
      lookupKey,
      teams: dedupeTeamNames(teamMap[lookupKey]),
      draw: Array.isArray(drawMap[lookupKey]) ? drawMap[lookupKey] : []
    });
  });

  return merged;
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

function renderSports({ sports, statusMessage = '' }) {
  const optionsHtml = sports.map((sport) => `
    <option value="${escapeHtml(sport.lookupKey)}">${escapeHtml(sport.code)}</option>
  `).join('');

  app.innerHTML = `
    <h1>Sports</h1>
    <section class="card">
      <h2>Manage Teams</h2>
      <p class="small">Paste one team per line. You can select an existing sport or type a new one.</p>
      <label for="teamSportSelect">Choose sport</label>
      <select id="teamSportSelect" class="field-input">
        <option value="">Select a sport</option>
        ${optionsHtml}
      </select>
      <label for="newSportInput">Or type a new sport</label>
      <input id="newSportInput" class="field-input" type="text" placeholder="Basketball" />
      <label for="pasteTeamsInput">Paste team names (one team per line)</label>
      <textarea id="pasteTeamsInput" class="paste-textarea" rows="8" placeholder="Team A&#10;Team B"></textarea>
      <fieldset class="option-group">
        <legend>Import behavior</legend>
        <label><input type="radio" name="importMode" value="replace" checked /> Replace teams for that sport</label>
        <label><input type="radio" name="importMode" value="append" /> Add/append teams for that sport</label>
      </fieldset>
      <div class="paste-actions">
        <button type="button" id="applyTeamImportBtn" class="button">Import / Apply</button>
      </div>
      <div class="manual-team-row">
        <input id="singleTeamInput" class="field-input" type="text" placeholder="Add one team" />
        <button type="button" id="addSingleTeamBtn" class="button">Add Team</button>
      </div>
      <div class="paste-actions">
        <button type="button" id="clearSelectedSportBtn" class="button">Clear teams for selected sport</button>
        <button type="button" id="clearAllSportsDataBtn" class="button">Clear ALL imported teams + user-created sports</button>
      </div>
      <p id="sportsManageStatus" class="small" aria-live="polite">${escapeHtml(statusMessage)}</p>
    </section>
    ${sports.map((sport) => {
      const teamsHtml = sport.teams.length === 0
        ? '<p class="small">No teams yet.</p>'
        : `<h3>Teams</h3><ul>${sport.teams.map((team) => `<li>${escapeHtml(team)}</li>`).join('')}</ul>`;
      const drawHtml = sport.draw.length === 0
        ? '<p class="small">No draw generated.</p>'
        : `<h3>Draw</h3><ul>${sport.draw.map((match, index) => `<li>Match ${index + 1}: ${escapeHtml(match.home)} vs ${escapeHtml(match.away)}</li>`).join('')}</ul>`;
      return `
        <section class="card">
          <h2>${escapeHtml(sport.code)}</h2>
          <p>Location: ${escapeHtml(sport.location || '')}</p>
          <p>${escapeHtml(sport.notes || '')}</p>
          ${teamsHtml}
          <div class="draw-controls">
            <label for="drawMode-${escapeHtml(sport.lookupKey)}">Draw mode</label>
            <select id="drawMode-${escapeHtml(sport.lookupKey)}" class="field-input draw-mode" data-sport-key="${escapeHtml(sport.lookupKey)}">
              <option value="listed">As listed</option>
              <option value="random">Random</option>
            </select>
            <button type="button" class="button generate-draw-btn" data-sport-key="${escapeHtml(sport.lookupKey)}">Generate Draw</button>
            <button type="button" class="button clear-draw-btn" data-sport-key="${escapeHtml(sport.lookupKey)}">Clear Draw</button>
            <button type="button" class="button clear-sport-teams-btn" data-sport-key="${escapeHtml(sport.lookupKey)}">Clear Teams</button>
          </div>
          ${drawHtml}
        </section>
      `;
    }).join('')}
  `;
}

function setupSportsManager(baseSports) {
  let statusMessage = '';

  const getState = () => {
    const importedSportTeams = storage.getImportedSportTeams();
    const normalizedTeams = {};
    Object.entries(importedSportTeams).forEach(([sportCode, teams]) => {
      normalizedTeams[sportLookupKey(sportCode)] = dedupeTeamNames(teams);
    });

    const sportDraws = storage.getSportDraws();
    const normalizedDraws = {};
    Object.entries(sportDraws || {}).forEach(([sportCode, draw]) => {
      if (Array.isArray(draw)) normalizedDraws[sportLookupKey(sportCode)] = draw;
    });

    const userSports = storage.getUserSports()
      .map((sport) => sanitizeSportEntry(sport))
      .filter(Boolean);

    return {
      importedSportTeams: normalizedTeams,
      sportDraws: normalizedDraws,
      userSports,
      sports: mergeSports(baseSports, userSports, normalizedTeams, normalizedDraws)
    };
  };

  const saveState = ({ importedSportTeams, userSports, sportDraws }) => {
    storage.setImportedSportTeams(importedSportTeams);
    storage.setUserSports(userSports);
    storage.setSportDraws(sportDraws);
  };

  const rerender = () => {
    const state = getState();
    renderSports({ sports: state.sports, statusMessage });
    bindEvents();
  };

  const resolveSportSelection = (state) => {
    const selectedSportKey = sportLookupKey(document.getElementById('teamSportSelect')?.value);
    const typedSport = document.getElementById('newSportInput')?.value || '';
    const typedSportLabel = typedSport.trim();
    const typedSportKey = sportLookupKey(typedSportLabel);

    if (typedSportLabel) {
      const existingSport = state.sports.find((sport) => sport.lookupKey === typedSportKey);
      if (existingSport) {
        return { lookupKey: typedSportKey, displayLabel: existingSport.code, createdNewSport: false };
      }

      const nextUserSports = [...state.userSports, { code: typedSportLabel, location: '', notes: '' }];
      storage.setUserSports(nextUserSports);
      return { lookupKey: typedSportKey, displayLabel: typedSportLabel, createdNewSport: true };
    }

    if (!selectedSportKey) return null;

    const selectedSport = state.sports.find((sport) => sport.lookupKey === selectedSportKey);
    if (!selectedSport) return null;

    return { lookupKey: selectedSport.lookupKey, displayLabel: selectedSport.code, createdNewSport: false };
  };

  const bindEvents = () => {
    document.getElementById('applyTeamImportBtn')?.addEventListener('click', () => {
      const state = getState();
      const sportSelection = resolveSportSelection(state);
      if (!sportSelection) {
        statusMessage = 'Choose a sport from the dropdown or type a new sport name first.';
        rerender();
        return;
      }

      const pasteInput = document.getElementById('pasteTeamsInput');
      const importMode = document.querySelector('input[name="importMode"]:checked')?.value || 'replace';
      const rawTeams = String(pasteInput?.value || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

      if (rawTeams.length === 0) {
        statusMessage = 'No team lines found. Paste at least one team name.';
        rerender();
        return;
      }

      const existingTeams = state.importedSportTeams[sportSelection.lookupKey] || [];
      const combined = importMode === 'append' ? [...existingTeams, ...rawTeams] : rawTeams;
      const deduped = dedupeTeamNames(combined);
      const ignoredCount = combined.length - deduped.length;

      const nextImported = { ...state.importedSportTeams, [sportSelection.lookupKey]: deduped };
      const nextDraws = { ...state.sportDraws };
      delete nextDraws[sportSelection.lookupKey];

      saveState({
        importedSportTeams: nextImported,
        userSports: storage.getUserSports().map((sport) => sanitizeSportEntry(sport)).filter(Boolean),
        sportDraws: nextDraws
      });

      statusMessage = `${sportSelection.createdNewSport ? `Created new sport "${sportSelection.displayLabel}". ` : ''}Imported ${deduped.length} team(s) for ${sportSelection.displayLabel}. Ignored ${ignoredCount} duplicate line(s). Mode: ${importMode}.`;
      rerender();
    });

    document.getElementById('addSingleTeamBtn')?.addEventListener('click', () => {
      const state = getState();
      const sportSelection = resolveSportSelection(state);
      if (!sportSelection) {
        statusMessage = 'Select or type a sport before adding a team.';
        rerender();
        return;
      }

      const singleTeamInput = document.getElementById('singleTeamInput');
      const teamName = String(singleTeamInput?.value || '').trim();
      if (!teamName) {
        statusMessage = 'Enter a team name before clicking Add Team.';
        rerender();
        return;
      }

      const existingTeams = state.importedSportTeams[sportSelection.lookupKey] || [];
      const deduped = dedupeTeamNames([...existingTeams, teamName]);
      const added = deduped.length > existingTeams.length;

      const nextImported = { ...state.importedSportTeams, [sportSelection.lookupKey]: deduped };
      const nextDraws = { ...state.sportDraws };
      delete nextDraws[sportSelection.lookupKey];

      saveState({ importedSportTeams: nextImported, userSports: storage.getUserSports(), sportDraws: nextDraws });
      statusMessage = added
        ? `${sportSelection.createdNewSport ? `Created new sport "${sportSelection.displayLabel}". ` : ''}Added ${teamName} to ${sportSelection.displayLabel}.`
        : `Ignored duplicate team "${teamName}" for ${sportSelection.displayLabel}.`;
      rerender();
    });

    document.getElementById('clearSelectedSportBtn')?.addEventListener('click', () => {
      const state = getState();
      const sportSelection = resolveSportSelection(state);
      if (!sportSelection) {
        statusMessage = 'Select or type a sport to clear.';
        rerender();
        return;
      }

      const nextImported = { ...state.importedSportTeams };
      const nextDraws = { ...state.sportDraws };
      delete nextImported[sportSelection.lookupKey];
      delete nextDraws[sportSelection.lookupKey];

      saveState({ importedSportTeams: nextImported, userSports: state.userSports, sportDraws: nextDraws });
      statusMessage = `Cleared teams and draw for ${sportSelection.displayLabel}.`;
      rerender();
    });

    document.getElementById('clearAllSportsDataBtn')?.addEventListener('click', () => {
      const confirmed = window.confirm('This clears imported teams, user-created sports, and generated draws for this feature only. Continue?');
      if (!confirmed) return;

      saveState({ importedSportTeams: {}, userSports: [], sportDraws: {} });
      statusMessage = 'Cleared all imported teams, user-created sports, and generated draws.';
      rerender();
    });

    document.querySelectorAll('.generate-draw-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const sportKey = sportLookupKey(button.dataset.sportKey);
        const modeSelect = document.querySelector(`.draw-mode[data-sport-key="${sportKey}"]`);
        const mode = modeSelect?.value || 'listed';
        const state = getState();
        const sport = state.sports.find((item) => item.lookupKey === sportKey);

        if (!sport || sport.teams.length === 0) {
          statusMessage = 'No teams found for this sport. Add teams before generating a draw.';
          rerender();
          return;
        }

        const sourceTeams = mode === 'random' ? shuffleTeams(sport.teams) : sport.teams;
        const generated = pairTeams(sourceTeams);
        const nextDraws = { ...state.sportDraws, [sportKey]: generated };

        saveState({ importedSportTeams: state.importedSportTeams, userSports: state.userSports, sportDraws: nextDraws });
        statusMessage = `Generated draw for ${sport.code} (${mode === 'random' ? 'Random' : 'As listed'}).`;
        rerender();
      });
    });

    document.querySelectorAll('.clear-draw-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const sportKey = sportLookupKey(button.dataset.sportKey);
        const state = getState();
        const sport = state.sports.find((item) => item.lookupKey === sportKey);
        const nextDraws = { ...state.sportDraws };
        delete nextDraws[sportKey];

        saveState({ importedSportTeams: state.importedSportTeams, userSports: state.userSports, sportDraws: nextDraws });
        statusMessage = `Cleared draw for ${sport?.code || 'selected sport'}.`;
        rerender();
      });
    });

    document.querySelectorAll('.clear-sport-teams-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const sportKey = sportLookupKey(button.dataset.sportKey);
        const state = getState();
        const sport = state.sports.find((item) => item.lookupKey === sportKey);

        const nextImported = { ...state.importedSportTeams };
        const nextDraws = { ...state.sportDraws };
        delete nextImported[sportKey];
        delete nextDraws[sportKey];

        saveState({ importedSportTeams: nextImported, userSports: state.userSports, sportDraws: nextDraws });
        statusMessage = `Cleared teams for ${sport?.code || 'selected sport'}.`;
        rerender();
      });
    });
  };

  rerender();
}

function setupCacheResetButton() {
  const button = document.getElementById('updateCacheBtn');
  if (!button) return;

  button.addEventListener('click', async () => {
    const confirmed = window.confirm('This will refresh the app and clear cached files so you get the latest version. Your saved teams stay on this device.');
    if (!confirmed) return;

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
    }

    window.location.reload();
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
    setupCacheResetButton();

    const session = storage.getSession();
    storage.setSession({ ...session, lastVisited: new Date().toISOString(), page });

    if (page === 'index') renderHome(eventData);
    if (page === 'programme') renderProgramme(await getJson('programme.json'));
    if (page === 'sports') {
      const sports = await getJson('sports.json');
      setupSportsManager(sports);
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
