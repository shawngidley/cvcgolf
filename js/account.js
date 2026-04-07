// CVC Fantasy Golf 2026 - Account Page

document.addEventListener('DOMContentLoaded', async () => {
  const player = getCurrentPlayer();
  if (!player) return;

  document.getElementById('playerName').textContent = player.name;
  await loadPreferences();

  document.getElementById('savePassword').addEventListener('click', savePassword);
  document.getElementById('savePreferences').addEventListener('click', savePreferences);
  document.getElementById('phoneNumber').addEventListener('input', formatPhone);
  document.getElementById('reminder1Day').addEventListener('change', enforceThursdayLock);
  document.getElementById('reminder2Day').addEventListener('change', enforceThursdayLock);
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
    document.getElementById('timezone').value = prefs.timezone || 'ET';
    document.getElementById('reminder1Day').value = prefs.reminder1_day || 'Tuesday';
    document.getElementById('reminder1Time').value = prefs.reminder1_time || '1130pm';
    document.getElementById('reminder2Day').value = prefs.reminder2_day || 'Wednesday';
    document.getElementById('reminder2Time').value = prefs.reminder2_time || '9am';
  }
  enforceThursdayLock();
}

async function savePreferences() {
  const player = getCurrentPlayer();
  const msg = document.getElementById('prefsMsg');

  // Build +1 formatted phone for Twilio
  const rawPhone = document.getElementById('phoneNumber').value.replace(/\D/g, '');
  const twilioPhone = rawPhone.length === 10 ? '+1' + rawPhone : '';

  const prefs = {
    player_id: player.id,
    phone_number: document.getElementById('phoneNumber').value,
    phone_e164: twilioPhone,
    reminders_enabled: document.getElementById('remindersEnabled').checked,
    timezone: document.getElementById('timezone').value,
    reminder1_day: document.getElementById('reminder1Day').value,
    reminder1_time: document.getElementById('reminder1Time').value,
    reminder2_day: document.getElementById('reminder2Day').value,
    reminder2_time: document.getElementById('reminder2Time').value,
    updated_at: new Date().toISOString()
  };

  if (prefs.reminders_enabled && !twilioPhone) {
    msg.textContent = 'Please enter a valid 10-digit phone number.';
    msg.className = 'account-msg error';
    return;
  }

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

function enforceThursdayLock() {
  const normalTimes = '<option value="6am">6:00 AM</option><option value="7am">7:00 AM</option><option value="8am">8:00 AM</option><option value="9am">9:00 AM</option><option value="10am">10:00 AM</option><option value="11am">11:00 AM</option><option value="12pm">12:00 PM</option><option value="3pm">3:00 PM</option><option value="6pm">6:00 PM</option><option value="1130pm">11:30 PM</option>';
  const thursdayTimes = '<option value="6am" selected>6:00 AM ET</option>';

  [1, 2].forEach(n => {
    const dayEl = document.getElementById(`reminder${n}Day`);
    const timeEl = document.getElementById(`reminder${n}Time`);
    const prev = timeEl.value;
    if (dayEl.value === 'Thursday') {
      timeEl.innerHTML = thursdayTimes;
      timeEl.disabled = true;
    } else {
      if (timeEl.disabled || timeEl.options.length <= 1) {
        timeEl.innerHTML = normalTimes;
        timeEl.value = prev === '6am' ? '9am' : prev;
      }
      timeEl.disabled = false;
    }
  });
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
