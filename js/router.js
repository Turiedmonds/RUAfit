const ROUTES = [
  { id: 'index', path: 'index.html', label: 'Home' },
  { id: 'programme', path: 'programme.html', label: 'Programme' },
  { id: 'sports', path: 'sports.html', label: 'Sports' },
  { id: 'venue', path: 'venue.html', label: 'Venue' },
  { id: 'gallery', path: 'gallery.html', label: 'Gallery' },
  { id: 'announcements', path: 'announcements.html', label: 'Announcements' },
  { id: 'contact', path: 'contact.html', label: 'Contact' }
];

export function getBasePath() {
  const marker = '/RUAfit/';
  return window.location.pathname.includes(marker) ? marker : '/';
}

export function toUrl(path) {
  const base = getBasePath();
  return `${window.location.origin}${base}${path}`;
}

export function navLinks() {
  return ROUTES.map((route) => ({ ...route, href: toUrl(route.path) }));
}
