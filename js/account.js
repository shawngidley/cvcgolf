// CVC Fantasy Golf 2026 - Account Page

document.addEventListener('DOMContentLoaded', async () => {
  const player = getCurrentPlayer();
  if (!player) return;

  document.getElementById('playerName').textContent = player.name;
  await loadPreferences();

  document.getElementById('savePassword').addEventListener('click', savePassword);
  document.getElementById('savePreferences').addEventListener('click', savePreferences);
  document.getElementById('phoneNumber').addEventListener('input', formatPhone);
});

async function savePassword() {
  const player = getCurrentPlayer();
  const msg = document.getElementById('passwordMsg');
  const current = document.getElementById('currentPassword').value;
  const newPw = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmPassword').value;

  msg.textContent = '';
  msg.className = 'account-msg';

  if (!current || !newPw || !confirm) {
    msg.textContent = 'Please fill in all fields.';
    msg.className = 'account-msg error';
    return;
  }

  if (newPw !== confirm) {
    msg.textContent = 'New passwords do not match.';
    msg.className = 'account-msg error';
    return;
  }

  if (newPw.length < 4) {
    msg.textContent = 'Password must be at least 4 characters.';
    msg.className = 'account-msg error';
    return;
  }

  // Verify current password
  const { data: check } = await supabaseClient
    .from('players')
    .select('id')
    .eq('id', player.id)
    .eq('password', current)
    .single();

  if (!check) {
    msg.textContent = 'Current password is incorrect.';
    msg.className = 'account-msg error';
    return;
  }

  // Update password
  const { error } = await supabaseClient
    .from('players')
    .update({ password: newPw })
    .eq('id', player.id);

  if (error) {
    msg.textContent = 'Error updating password: ' + error.message;
    msg.className = 'account-msg error';
  } else {
    msg.textContent = 'Password updated successfully!';
    msg.className = 'account-msg success';
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  }
}

async function loadPreferences() {
  const player = getCurrentPlayer();

  const { data: prefs } = await supabaseClient
    .from('player_preferences')
    .select('*')
    .eq('player_id', player.id)
    .single();

  if (prefs) {
    document.getElementById('phoneNumber').value = prefs.phone_number || '';
    document.getElementById('remindersEnabled').checked = prefs.reminders_enabled || false;
    document.getElementById('reminderDay').value = prefs.reminder_day || 'Wednesday';
    document.getElementById('reminderTime').value = prefs.reminder_time || '9am';
    document.getElementById('timezone').value = prefs.timezone || 'ET';
  }
}

async function savePreferences() {
  const player = getCurrentPlayer();
  const msg = document.getElementById('prefsMsg');

  const prefs = {
    player_id: player.id,
    phone_number: document.getElementById('phoneNumber').value,
    reminders_enabled: document.getElementById('remindersEnabled').checked,
    reminder_day: document.getElementById('reminderDay').value,
    reminder_time: document.getElementById('reminderTime').value,
    timezone: document.getElementById('timezone').value,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseClient
    .from('player_preferences')
    .upsert(prefs, { onConflict: 'player_id' });

  if (error) {
    msg.textContent = 'Error saving preferences: ' + error.message;
    msg.className = 'account-msg error';
  } else {
    msg.textContent = 'Preferences saved!';
    msg.className = 'account-msg success';
  }
}

function formatPhone(e) {
  let val = e.target.value.replace(/\D/g, '');
  if (val.length > 10) val = val.slice(0, 10);
  if (val.length >= 7) {
    val = `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6)}`;
  } else if (val.length >= 4) {
    val = `(${val.slice(0, 3)}) ${val.slice(3)}`;
  } else if (val.length >= 1) {
    val = `(${val}`;
  }
  e.target.value = val;
}
