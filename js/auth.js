// CVC Fantasy Golf 2026 - Auth (session via localStorage)

function getCurrentPlayer() {
  const stored = localStorage.getItem('cvc_golf_player');
  return stored ? JSON.parse(stored) : null;
}

function requireLogin() {
  const player = getCurrentPlayer();
  if (!player) {
    window.location.href = 'index.html';
    return null;
  }
  return player;
}

function setupNav() {
  const player = getCurrentPlayer();
  if (!player) return;

  // Show admin link if commissioner
  const adminLink = document.getElementById('adminLink');
  if (adminLink && player.is_commissioner) {
    adminLink.style.display = '';
  }

  // Setup logout
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('cvc_golf_player');
      window.location.href = 'index.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Don't require login on login page
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    return;
  }
  const player = requireLogin();
  if (player) setupNav();
});
