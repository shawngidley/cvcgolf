// Netlify scheduled function - Send SMS lineup reminders via Twilio
// Runs daily — checks each player's reminder preferences against current day/time
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://iqahjyoytzhhkvwmujha.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

// Map timezone abbreviations to IANA timezone names
const TZ_MAP = {
  ET: 'America/New_York',
  CT: 'America/Chicago',
  MT: 'America/Denver',
  PT: 'America/Los_Angeles'
};

// Map reminder time codes to { hour, minute } values
const TIME_MAP = {
  '6am': { hour: 6, minute: 0 },
  '7am': { hour: 7, minute: 0 },
  '8am': { hour: 8, minute: 0 },
  '9am': { hour: 9, minute: 0 },
  '10am': { hour: 10, minute: 0 },
  '11am': { hour: 11, minute: 0 },
  '12pm': { hour: 12, minute: 0 },
  '3pm': { hour: 15, minute: 0 },
  '6pm': { hour: 18, minute: 0 },
  '1130pm': { hour: 23, minute: 30 }
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Twilio credentials not configured' }) };
    }

    const twilio = require('twilio')(accountSid, authToken);

    // Get current tournament
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('is_current', true)
      .single();

    if (!tournament) {
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'No active tournament' }) };
    }

    // Calculate deadline day name from tournament start_date
    const startDate = new Date(tournament.start_date + 'T00:00:00');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const deadlineDay = days[startDate.getDay()];

    // Get all players with reminders enabled
    const { data: prefs } = await supabase
      .from('player_preferences')
      .select('*')
      .eq('reminders_enabled', true);

    if (!prefs || prefs.length === 0) {
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'No reminders to send' }) };
    }

    let sent = 0;
    const now = new Date();

    for (const pref of prefs) {
      if (!pref.phone_e164) continue;

      const tz = TZ_MAP[pref.timezone] || TZ_MAP.ET;
      const localNow = new Date(now.toLocaleString('en-US', { timeZone: tz }));
      const currentDay = days[localNow.getDay()];
      const currentHour = localNow.getHours();

      // Check both reminder slots
      const reminders = [
        { day: pref.reminder1_day, time: pref.reminder1_time },
        { day: pref.reminder2_day, time: pref.reminder2_time }
      ];

      for (const reminder of reminders) {
        if (!reminder.day || !reminder.time) continue;

        // Thursday reminders are always 6am ET regardless of user timezone
        const checkDay = reminder.day;
        const checkTime = TIME_MAP[reminder.time];
        if (!checkTime) continue;

        if (reminder.day === 'Thursday') {
          // Force ET for Thursday
          const etNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
          if (days[etNow.getDay()] !== 'Thursday' || etNow.getHours() !== 6) continue;
        } else {
          const currentMinute = localNow.getMinutes();
          // Allow a 14-minute window past the target minute to handle cron drift
          const minuteDiff = currentMinute - checkTime.minute;
          if (currentDay !== checkDay || currentHour !== checkTime.hour || minuteDiff < 0 || minuteDiff > 14) continue;
        }

        const message = `⛳ CVC Fantasy Golf — ${tournament.name} lineup deadline is ${deadlineDay} by first tee time. Submit at golf.cvcfantasysports.com`;

        await twilio.messages.create({
          body: message,
          from: twilioPhone,
          to: pref.phone_e164
        });

        sent++;
        break; // Only send one message per player per run
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, sent }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
