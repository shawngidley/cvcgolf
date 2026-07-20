// CVC Fantasy Golf 2026 - Supabase Client
console.log('[supabase-client] script loaded, initializing...');

// Hardcoded (not env vars) since this is a static site with no build step -
// the anon key is safe to expose client-side, RLS policies do the real work.
const SUPABASE_URL = 'https://iqahjyoytzhhkvwmujha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYWhqeW95dHpoaGt2d211amhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NjkwNTgsImV4cCI6MjA5MTE0NTA1OH0.kki64pr4YG3aQufc3n4nn2KDpmzURYDLx7_zYneoyKY';

let supabaseClient = null;

function showConnectionBanner(message) {
  let banner = document.getElementById('supabaseErrorBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'supabaseErrorBanner';
    banner.style.cssText = 'position:fixed; top:0; left:0; right:0; z-index:99999; background:#c0392b; color:#fff; padding:0.6rem 1rem; text-align:center; font-family:-apple-system,BlinkMacSystemFont,sans-serif; font-size:0.85rem; font-weight:600; box-shadow:0 2px 8px rgba(0,0,0,0.3);';
    const attach = () => document.body && document.body.prepend(banner);
    if (document.body) attach(); else document.addEventListener('DOMContentLoaded', attach);
  }
  banner.textContent = message;
}

function hideConnectionBanner() {
  const banner = document.getElementById('supabaseErrorBanner');
  if (banner) banner.remove();
}

// Dynamically (re)loads the Supabase JS SDK from the CDN. Used for retries
// when the original <script> tag failed to fetch - e.g. a flaky connection
// right after opening the PWA from the iOS home screen.
function loadSupabaseScript(onDone) {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = () => onDone(true);
  script.onerror = () => onDone(false);
  document.head.appendChild(script);
}

function initSupabaseClient(attempt) {
  attempt = attempt || 1;
  const MAX_ATTEMPTS = 5;

  if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log(`[supabase-client] Supabase client initialized successfully (attempt ${attempt})`);
      hideConnectionBanner();
      window.dispatchEvent(new Event('supabase-ready'));
      return;
    } catch (e) {
      console.error('[supabase-client] createClient() threw:', e);
    }
  }

  if (attempt >= MAX_ATTEMPTS) {
    console.error(`[supabase-client] Giving up after ${MAX_ATTEMPTS} attempts - Supabase SDK never became available`);
    showConnectionBanner('Unable to connect. Pull down to refresh, or close and reopen the app.');
    return;
  }

  console.warn(`[supabase-client] Supabase SDK not ready (attempt ${attempt}/${MAX_ATTEMPTS}) - retrying...`);
  showConnectionBanner('Connecting...');
  setTimeout(() => {
    loadSupabaseScript(() => initSupabaseClient(attempt + 1));
  }, 400 * attempt);
}

initSupabaseClient();

// Safety net for the rare case a page script runs and tries to use
// supabaseClient before the retry above finishes - surfaces a clear message
// instead of a silent, permanent "Loading..." spinner, and recovers on its
// own by reloading once the client comes online.
window.addEventListener('error', () => {
  if (!supabaseClient) {
    showConnectionBanner('Reconnecting...');
    window.addEventListener('supabase-ready', () => window.location.reload(), { once: true });
  }
});

function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateRange(start, end) {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }
});
