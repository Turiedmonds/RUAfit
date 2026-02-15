const PREFIX = 'ruafit:';

function key(name) {
  return `${PREFIX}${name}`;
}

function read(name, fallback) {
  try {
    const value = window.localStorage.getItem(key(name));
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(name, value) {
  try {
    window.localStorage.setItem(key(name), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const storage = {
  getSettings() {
    return read('settings', {});
  },
  setSettings(settings) {
    return write('settings', settings);
  },
  getSession() {
    return read('session', { lastVisited: null });
  },
  setSession(session) {
    return write('session', session);
  },
  getCachedData() {
    return read('cachedData', {});
  },
  setCachedData(payload) {
    return write('cachedData', payload);
  }
};
