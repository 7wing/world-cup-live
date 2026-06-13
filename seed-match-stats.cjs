/**
 * Seed match_stats for World Cup 2022 (finished matches)
 *
 * Reads API_FOOTBALL_KEY from .env
 *
 * Strategy:
 * 1. Load cached fixtures from /tmp/af_fixtures.json
 * 2. Load internal matches + team names from /tmp/matches.json + /tmp/teams.json
 * 3. Map internal IDs → fixture IDs by date + team names (32/32 names match exactly)
 * 4. Fetch stats one-by-one with 3-second delay (safe for 10/min free tier limit)
 * 5. Insert into Supabase via raw REST API (avoids @supabase/supabase-js hang on this box)
 */

const fs = require('fs');

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://lrsphlbeqdqgsxwkmrlf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc3BobGJlcWRxZ3N4d2ttcmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDMxMDIsImV4cCI6MjA5NDU3OTEwMn0.XiSHi9k_uxnB8oNjWfUc_JOzKz2ywz98W7yfgbrpNu0';
const API_KEY = (fs.readFileSync('.env', 'utf8').match(/API_FOOTBALL_KEY\s*=\s*(.+)/) || [])[1]?.trim();

if (!API_KEY) {
  console.error('Add API_FOOTBALL_KEY to .env first.');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function afFetch(path) {
  const url = 'https://v3.football.api-sports.io' + path;
  const res = await fetch(url, { headers: { 'x-apisports-key': API_KEY, 'Content-Type': 'application/json' } });
  const text = await res.text();
  if (!res.ok) throw new Error(`AF ${res.status}: ${text.slice(0, 200)}`);
  try { return JSON.parse(text); } catch { throw new Error(`AF invalid JSON: ${text.slice(0, 200)}`); }
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
  const text = await res.text();
  if (!res.ok && !text.includes(' violates ')) {
    throw new Error(`SB insert ${res.status}: ${text.slice(0, 300)}`);
  }
  return { ok: res.ok, text };
}

function norm(n) { return (n || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function parseNum(v) {
  if (v === null || v === undefined || v === 'None') return null;
  const n = Number(String(v).replace('%', ''));
  return Number.isNaN(n) ? null : n;
}

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
  console.log('Loading data...');
  const dbMatches = JSON.parse(fs.readFileSync('/tmp/matches.json')).filter(m => m.id.startsWith('of-2022'));
  const teams = JSON.parse(fs.readFileSync('/tmp/teams.json'));
  const afData = JSON.parse(fs.readFileSync('/tmp/af_fixtures.json'));
  const afFixtures = afData.response || [];

  console.log('Internal 2022 matches:', dbMatches.length);
  console.log('API-Football fixtures:', afFixtures.length);

  const teamById = new Map();
  for (const t of teams) teamById.set(t.id, t.name);

  // Build fixture lookup by date|home|away
  const fixtureMap = new Map();
  for (const f of afFixtures) {
    const d = String(f.fixture?.date || '').slice(0, 10);
    fixtureMap.set(`${d}|${norm(f.teams?.home?.name)}|${norm(f.teams?.away?.name)}`, f);
  }

  // Map internal → fixture
  const rows = [];
  for (const m of dbMatches) {
    const d = String(m.kickoff_at || '').slice(0, 10);
    const hk = norm(teamById.get(m.home_team_id));
    const ak = norm(teamById.get(m.away_team_id));
    const key = `${d}|${hk}|${ak}`;
    const f = fixtureMap.get(key);
    if (!f) {
      console.warn('Unmapped:', m.id, d, teamById.get(m.home_team_id), 'vs', teamById.get(m.away_team_id));
      continue;
    }
    rows.push({
      internalId: m.id,
      fixtureId: f.fixture.id,
      kickoff: d,
      homeName: teamById.get(m.home_team_id),
      awayName: teamById.get(m.away_team_id),
    });
  }

  console.log(`Mapped ${rows.length}/${dbMatches.length} matches.`);
  if (rows.length === 0) process.exit(1);

  // Fetch statistics
  const inserts = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    console.log(`[${i + 1}/${rows.length}] ${r.internalId} (fixture ${r.fixtureId})`);
    try {
      const statsRes = await afFetch(`/fixtures/statistics?fixture=${r.fixtureId}`);
      const teamsStats = statsRes.response || [];
      if (teamsStats.length !== 2) {
        console.warn('  Expected 2 stats, got', teamsStats.length);
        continue;
      }

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
      console.error('  Failed:', e.message);
    }
    if (i < rows.length - 1) await sleep(3000);
  }

  console.log(`\nCollected ${inserts.length} stat rows.`);
  if (inserts.length === 0) process.exit(1);

  // Batch insert (20 rows at a time)
  const BATCH = 20;
  for (let i = 0; i < inserts.length; i += BATCH) {
    const batch = inserts.slice(i, i + BATCH);
    console.log(`Inserting batch ${i + 1}–${Math.min(i + BATCH, inserts.length)} (${batch.length} rows)...`);
    try {
      const result = await sbInsert(batch);
      console.log('  OK —', result.ok ? 'merged' : 'skipped due to conflict');
    } catch (e) {
      console.error('  Batch failed:', e.message);
    }
  }

  // Verify
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/match_stats?select=count`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Prefer': 'count=exact' },
  });
  const count = countRes.headers.get('content-range');
  console.log('\nDone. match_stats content-range:', count);
}

main().catch(err => { console.error(err); process.exit(1); });
