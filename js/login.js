// CVC Fantasy Golf 2026 - Login Page

document.addEventListener('DOMContentLoaded', async () => {
  // If already logged in, redirect
  const existing = localStorage.getItem('cvc_golf_player');
  if (existing) {
    window.location.href = 'standings.html';
    return;
  }

  await loadPlayers();

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
});

async function loadPlayers() {
  const { data: players } = await supabaseClient
    .from('players')
    .select('id, name')
    .order('name');

  const select = document.getElementById('playerName');
  if (players) {
    players.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      select.appendChild(opt);
    });
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const playerId = document.getElementById('playerName').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('loginError');

  if (!playerId || !password) {
    errorEl.textContent = 'Please select your name and enter your password.';
    errorEl.style.display = 'block';
    return;
  }

  const { data: player, error } = await supabaseClient
    .from('players')
    .select('*')
    .eq('id', playerId)
    .eq('password', password)
    .single();

  if (error || !player) {
    errorEl.textContent = 'Invalid password. Please try again.';
    errorEl.style.display = 'block';
    return;
  }

  // Store session
  localStorage.setItem('cvc_golf_player', JSON.stringify({
    id: player.id,
    name: player.name,
    is_commissioner: player.is_commissioner
  }));

  window.location.href = 'standings.html';
}
