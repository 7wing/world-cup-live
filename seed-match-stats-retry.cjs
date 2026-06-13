/**
 * Retry match_stats for failed/fetch-limited 2022 matches.
 *
 * Strategy:
 * - Load already-inserted records from match_stats
 * - Only fetch what’s missing
 * - 8-second sleep between API calls (safe for 7.5/min = well under 10/min)
 * - Track call count and stop if we approach daily limit (95/100)
 * - Resume-safe: run this script multiple times until all 64 matches are seeded
 */

const fs = require('fs');

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://lrsphlbeqdqgsxwkmrlf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc3BobGJlcWRxZ3N4d2ttcmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDMxMDIsImV4cCI6MjA5NDU3OTEwMn0.XiSHi9k_uxnB8oNjWfUc_JOzKz2ywz98W7yfgbrpNu0';
const API_KEY = (fs.readFileSync('.env', 'utf8').match(/API_FOOTBALL_KEY\s*=\s*(.+)/) || [])[1]?.trim();

if (!API_KEY) { console.error('Missing API_FOOTBALL_KEY'); process.exit(1); }

// Track API calls made by this script
let callsThisRun = 0;
const HARD_MAX = 43; // conservative — first run used ~70 calls, limit is 100/day

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function afFetch(path) {
  callsThisRun++;
  const url = 'https://v3.football.api-sports.io' + path;
  const res = await fetch(url, { headers: { 'x-apisports-key': API_KEY, 'Content-Type': 'application/json' } });
  const text = await res.text();
  if (!res.ok) throw new Error(`AF ${res.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text);
}

async function sbGet(path) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
  });
  return res.json();
}

async function sbInsert(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/match_stats`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`SB ${res.status}: ${await res.text()}`);
}

function norm(n) { return (n || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function parseNum(v) { return v === null || v === undefined || v === 'None' ? null : Number(String(v).replace('%', '')) || null; }

function extractStats(statistics) {
  const find = (type) => statistics.find(s => s.type === type)?.value;
  return {
    shots: parseNum(find('Total Shots')),
    shots_on_target: parseNum(find('Shots on Goal')),
    corners: parseNum(find('Corner Kicks')),
    fouls: parseNum(find('Fouls')),
    yellow_cards: parseNum(find('Yellow Cards')),
    red_cards: parseNum(find('Red Cards')),
    passes: parseNum(find('Total passes')),
    pass_accuracy: parseNum(find('Passes %')),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Checking already-seeded matches...');
  const seededIds = new Set((await sbGet('/rest/v1/match_stats?select=match_id&limit=100'))?.map(r => r.match_id) || []);
  console.log('Already seeded:', seededIds.size);

  const dbMatches = JSON.parse(fs.readFileSync('/tmp/matches.json')).filter(m => m.id.startsWith('of-2022'));
  const teams = JSON.parse(fs.readFileSync('/tmp/teams.json'));
  const afData = JSON.parse(fs.readFileSync('/tmp/af_fixtures.json'));
  const afFixtures = afData.response || [];
  const teamById = new Map();
  for (const t of teams) teamById.set(t.id, t.name);

  const fixtureMap = new Map();
  for (const f of afFixtures) {
    const d = String(f.fixture?.date || '').slice(0, 10);
    fixtureMap.set(`${d}|${norm(f.teams?.home?.name)}|${norm(f.teams?.away?.name)}`, f);
  }

  // Build list of missing matches
  const missing = [];
  for (const m of dbMatches) {
    if (seededIds.has(m.id)) continue;
    const d = String(m.kickoff_at || '').slice(0, 10);
    const hk = norm(teamById.get(m.home_team_id));
    const ak = norm(teamById.get(m.away_team_id));
    const f = fixtureMap.get(`${d}|${hk}|${ak}`);
    if (!f) { console.warn('Unmapped:', m.id); continue; }
    missing.push({ internalId: m.id, fixtureId: f.fixture.id, homeName: teamById.get(m.home_team_id), awayName: teamById.get(m.away_team_id) });
  }

  console.log(`Missing stats: ${missing.length} matches`);
  if (missing.length === 0) { console.log('All done!'); return; }

  const inserts = [];
  for (let i = 0; i < missing.length; i++) {
    if (callsThisRun >= HARD_MAX) {
      console.log(`\nStopping — approaching daily API limit (${callsThisRun}/${HARD_MAX}). Run again tomorrow.`);
      break;
    }

    const r = missing[i];
    console.log(`[${i + 1}/${missing.length}] ${r.internalId} (fixture ${r.fixtureId})`);
    try {
      const statsRes = await afFetch(`/fixtures/statistics?fixture=${r.fixtureId}`);
      const teamsStats = statsRes.response || [];
      if (teamsStats.length !== 2) { console.warn('  Got', teamsStats.length, 'stat entries'); continue; }

      const homeEntry = teamsStats.find(s => norm(s.team?.name) === norm(r.homeName)) || teamsStats[0];
      const awayEntry = teamsStats.find(s => norm(s.team?.name) === norm(r.awayName)) || teamsStats[1];
      const home = extractStats(homeEntry.statistics || []);
      const away = extractStats(awayEntry.statistics || []);

      inserts.push({
        match_id: r.internalId,
        home_shots: home.shots,
        away_shots: away.shots,
        home_shots_on_target: home.shots_on_target,
        away_shots_on_target: away.shots_on_target,
        home_corners: home.corners,
        away_corners: away.corners,
        home_fouls: home.fouls,
        away_fouls: away.fouls,
        home_yellow_cards: home.yellow_cards,
        away_yellow_cards: away.yellow_cards,
        home_red_cards: home.red_cards,
        away_red_cards: away.red_cards,
        home_passes: home.passes,
        away_passes: away.passes,
        home_pass_accuracy: home.pass_accuracy,
        away_pass_accuracy: away.pass_accuracy,
      });
      console.log('  OK');
    } catch (e) {
      console.error('  SKIPPED:', e.message);
    }

    if (i < missing.length - 1) await sleep(8000);
  }

  if (inserts.length > 0) {
    console.log(`\nInserting ${inserts.length} rows...`);
    for (let i = 0; i < inserts.length; i += 20) {
      const batch = inserts.slice(i, i + 20);
      console.log(`  batch ${i + 1}–${Math.min(i + 20, inserts.length)}`);
      try { await sbInsert(batch); } catch (e) { console.error('  Batch failed:', e.message); }
    }
  }

  const final = await sbGet('/rest/v1/match_stats?select=count');
  console.log('\nFinal seeded count:', final.length, '(content-range header unavailable)');
  console.log('API calls used this run:', callsThisRun);
  console.log('Remaining missing:', Math.max(0, missing.length - inserts.length));
}

main().catch(err => { console.error(err); process.exit(1); });
