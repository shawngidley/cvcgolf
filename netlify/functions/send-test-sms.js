// Netlify function - Send a test SMS via Twilio (commissioner only)
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { phone_number } = JSON.parse(event.body);

    if (!phone_number) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Phone number required' }) };
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Twilio credentials not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to Netlify environment variables.' }) };
    }

    const twilio = require('twilio')(accountSid, authToken);

    await twilio.messages.create({
      body: '⛳ CVC Fantasy Golf — Test message! Twilio SMS is working correctly.',
      from: twilioPhone,
      to: phone_number
    });

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: `Test SMS sent to ${phone_number}` }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
