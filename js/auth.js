// CVC Fantasy Golf 2026 - Auth (session via localStorage)

function getCurrentPlayer() {
  const stored = localStorage.getItem('cvc_golf_player');
  return stored ? JSON.parse(stored) : null;
}

function isGuest() {
  const player = getCurrentPlayer();
  return player?.is_guest === true;
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

  // Show admin link if commissioner (never for guests)
  const adminLink = document.getElementById('adminLink');
  if (adminLink && player.is_commissioner && !player.is_guest) {
    adminLink.style.display = '';
  }

  // Hide account link for guests
  const accountLink = document.getElementById('accountLink');
  if (accountLink && player.is_guest) {
    accountLink.style.display = 'none';
  }

  // Show Guest Mode badge
  if (player.is_guest) {
    const logo = document.querySelector('.nav-logo');
    if (logo) {
      const badge = document.createElement('span');
      badge.textContent = 'Guest';
      badge.style.cssText = 'background:var(--gold); color:var(--dark-green); padding:0.1rem 0.4rem; border-radius:var(--radius); font-size:0.65rem; font-weight:700; margin-left:0.4rem; text-transform:uppercase;';
      logo.appendChild(badge);
    }
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

// Toast message for guest actions
function showGuestToast() {
  let toast = document.getElementById('guestToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'guestToast';
    toast.style.cssText = 'position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%); background:var(--red); color:#fff; padding:0.6rem 1.2rem; border-radius:var(--radius); font-size:0.85rem; font-weight:600; z-index:9999; opacity:0; transition:opacity 0.3s;';
    document.body.appendChild(toast);
  }
  toast.textContent = 'Guest accounts are read-only';
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
  // Don't require login on login page
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    return;
  }
  const player = requireLogin();
  if (player) {
    setupNav();

    // Block guest from admin page
    if (player.is_guest && window.location.pathname.includes('admin.html')) {
      window.location.href = 'standings.html';
      return;
    }
  }
});
