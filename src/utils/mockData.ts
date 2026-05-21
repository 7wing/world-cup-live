// ─────────────────────────────────────────────────────────────────────────────
// WORLD CUP LIVE — MASTER MOCK DATA
// 2022: Full tournament (complete results, bracket, groups)
// 2026: Known group stage fixtures (confirmed teams + venues, no scores yet)
// ─────────────────────────────────────────────────────────────────────────────

export type TournamentYear = '2022' | '2026'

// ─── TEAMS ────────────────────────────────────────────────────────────────────
export interface MockTeam {
  id: string
  name: string
  code: string
  flag: string
  group?: string
}

export const TEAMS_2022: Record<string, MockTeam> = {
  // Group A
  QAT: { id: 'QAT', name: 'Qatar',         code: 'QAT', flag: '🇶🇦', group: 'A' },
  ECU: { id: 'ECU', name: 'Ecuador',       code: 'ECU', flag: '🇪🇨', group: 'A' },
  SEN: { id: 'SEN', name: 'Senegal',       code: 'SEN', flag: '🇸🇳', group: 'A' },
  NED: { id: 'NED', name: 'Netherlands',   code: 'NED', flag: '🇳🇱', group: 'A' },
  // Group B
  ENG: { id: 'ENG', name: 'England',       code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'B' },
  IRN: { id: 'IRN', name: 'Iran',          code: 'IRN', flag: '🇮🇷', group: 'B' },
  USA: { id: 'USA', name: 'USA',           code: 'USA', flag: '🇺🇸', group: 'B' },
  WAL: { id: 'WAL', name: 'Wales',         code: 'WAL', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', group: 'B' },
  // Group C
  ARG: { id: 'ARG', name: 'Argentina',     code: 'ARG', flag: '🇦🇷', group: 'C' },
  SAU: { id: 'SAU', name: 'Saudi Arabia',  code: 'KSA', flag: '🇸🇦', group: 'C' },
  MEX: { id: 'MEX', name: 'Mexico',        code: 'MEX', flag: '🇲🇽', group: 'C' },
  POL: { id: 'POL', name: 'Poland',        code: 'POL', flag: '🇵🇱', group: 'C' },
  // Group D
  FRA: { id: 'FRA', name: 'France',        code: 'FRA', flag: '🇫🇷', group: 'D' },
  AUS: { id: 'AUS', name: 'Australia',     code: 'AUS', flag: '🇦🇺', group: 'D' },
  DEN: { id: 'DEN', name: 'Denmark',       code: 'DEN', flag: '🇩🇰', group: 'D' },
  TUN: { id: 'TUN', name: 'Tunisia',       code: 'TUN', flag: '🇹🇳', group: 'D' },
  // Group E
  ESP: { id: 'ESP', name: 'Spain',         code: 'ESP', flag: '🇪🇸', group: 'E' },
  CRC: { id: 'CRC', name: 'Costa Rica',    code: 'CRC', flag: '🇨🇷', group: 'E' },
  GER: { id: 'GER', name: 'Germany',       code: 'GER', flag: '🇩🇪', group: 'E' },
  JPN: { id: 'JPN', name: 'Japan',         code: 'JPN', flag: '🇯🇵', group: 'E' },
  // Group F
  BEL: { id: 'BEL', name: 'Belgium',       code: 'BEL', flag: '🇧🇪', group: 'F' },
  CAN: { id: 'CAN', name: 'Canada',        code: 'CAN', flag: '🇨🇦', group: 'F' },
  MAR: { id: 'MAR', name: 'Morocco',       code: 'MAR', flag: '🇲🇦', group: 'F' },
  CRO: { id: 'CRO', name: 'Croatia',       code: 'CRO', flag: '🇭🇷', group: 'F' },
  // Group G
  BRA: { id: 'BRA', name: 'Brazil',        code: 'BRA', flag: '🇧🇷', group: 'G' },
  SRB: { id: 'SRB', name: 'Serbia',        code: 'SRB', flag: '🇷🇸', group: 'G' },
  SUI: { id: 'SUI', name: 'Switzerland',   code: 'SUI', flag: '🇨🇭', group: 'G' },
  CMR: { id: 'CMR', name: 'Cameroon',      code: 'CMR', flag: '🇨🇲', group: 'G' },
  // Group H
  POR: { id: 'POR', name: 'Portugal',      code: 'POR', flag: '🇵🇹', group: 'H' },
  GHA: { id: 'GHA', name: 'Ghana',         code: 'GHA', flag: '🇬🇭', group: 'H' },
  URU: { id: 'URU', name: 'Uruguay',       code: 'URU', flag: '🇺🇾', group: 'H' },
  KOR: { id: 'KOR', name: 'South Korea',   code: 'KOR', flag: '🇰🇷', group: 'H' },
}

export const TEAMS_2026: Record<string, MockTeam> = {
  // Group A
  USA_26:  { id: 'USA_26',  name: 'USA',           code: 'USA', flag: '🇺🇸', group: 'A' },
  PAN_26:  { id: 'PAN_26',  name: 'Panama',        code: 'PAN', flag: '🇵🇦', group: 'A' },
  ALB_26:  { id: 'ALB_26',  name: 'Albania',       code: 'ALB', flag: '🇦🇱', group: 'A' },
  UKR_26:  { id: 'UKR_26',  name: 'Ukraine',       code: 'UKR', flag: '🇺🇦', group: 'A' },
  // Group B
  ARG_26:  { id: 'ARG_26',  name: 'Argentina',     code: 'ARG', flag: '🇦🇷', group: 'B' },
  CHI_26:  { id: 'CHI_26',  name: 'Chile',         code: 'CHI', flag: '🇨🇱', group: 'B' },
  PER_26:  { id: 'PER_26',  name: 'Peru',          code: 'PER', flag: '🇵🇪', group: 'B' },
  AUS_26:  { id: 'AUS_26',  name: 'Australia',     code: 'AUS', flag: '🇦🇺', group: 'B' },
  // Group C
  MEX_26:  { id: 'MEX_26',  name: 'Mexico',        code: 'MEX', flag: '🇲🇽', group: 'C' },
  CAN_26:  { id: 'CAN_26',  name: 'Canada',        code: 'CAN', flag: '🇨🇦', group: 'C' },
  HND_26:  { id: 'HND_26',  name: 'Honduras',      code: 'HON', flag: '🇭🇳', group: 'C' },
  NZL_26:  { id: 'NZL_26',  name: 'New Zealand',   code: 'NZL', flag: '🇳🇿', group: 'C' },
  // Group D
  FRA_26:  { id: 'FRA_26',  name: 'France',        code: 'FRA', flag: '🇫🇷', group: 'D' },
  POL_26:  { id: 'POL_26',  name: 'Poland',        code: 'POL', flag: '🇵🇱', group: 'D' },
  ISR_26:  { id: 'ISR_26',  name: 'Israel',        code: 'ISR', flag: '🇮🇱', group: 'D' },
  BDI_26:  { id: 'BDI_26',  name: 'Burundi',       code: 'BDI', flag: '🇧🇮', group: 'D' },
  // Group E
  ESP_26:  { id: 'ESP_26',  name: 'Spain',         code: 'ESP', flag: '🇪🇸', group: 'E' },
  NED_26:  { id: 'NED_26',  name: 'Netherlands',   code: 'NED', flag: '🇳🇱', group: 'E' },
  BEL_26:  { id: 'BEL_26',  name: 'Belgium',       code: 'BEL', flag: '🇧🇪', group: 'E' },
  CRO_26:  { id: 'CRO_26',  name: 'Croatia',       code: 'CRO', flag: '🇭🇷', group: 'E' },
  // Group F
  BRA_26:  { id: 'BRA_26',  name: 'Brazil',        code: 'BRA', flag: '🇧🇷', group: 'F' },
  ECU_26:  { id: 'ECU_26',  name: 'Ecuador',       code: 'ECU', flag: '🇪🇨', group: 'F' },
  VEN_26:  { id: 'VEN_26',  name: 'Venezuela',     code: 'VEN', flag: '🇻🇪', group: 'F' },
  PLE_26:  { id: 'PLE_26',  name: 'Palestine',     code: 'PLE', flag: '🇵🇸', group: 'F' },
  // Group G
  POR_26:  { id: 'POR_26',  name: 'Portugal',      code: 'POR', flag: '🇵🇹', group: 'G' },
  DEN_26:  { id: 'DEN_26',  name: 'Denmark',       code: 'DEN', flag: '🇩🇰', group: 'G' },
  SUI_26:  { id: 'SUI_26',  name: 'Switzerland',   code: 'SUI', flag: '🇨🇭', group: 'G' },
  SER_26:  { id: 'SER_26',  name: 'Serbia',        code: 'SRB', flag: '🇷🇸', group: 'G' },
  // Group H
  GER_26:  { id: 'GER_26',  name: 'Germany',       code: 'GER', flag: '🇩🇪', group: 'H' },
  JPN_26:  { id: 'JPN_26',  name: 'Japan',         code: 'JPN', flag: '🇯🇵', group: 'H' },
  SAU_26:  { id: 'SAU_26',  name: 'Saudi Arabia',  code: 'KSA', flag: '🇸🇦', group: 'H' },
  BAN_26:  { id: 'BAN_26',  name: 'Bahrain',       code: 'BHR', flag: '🇧🇭', group: 'H' },
  // Group I
  ENG_26:  { id: 'ENG_26',  name: 'England',       code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'I' },
  SEN_26:  { id: 'SEN_26',  name: 'Senegal',       code: 'SEN', flag: '🇸🇳', group: 'I' },
  SLO_26:  { id: 'SLO_26',  name: 'Slovenia',      code: 'SVN', flag: '🇸🇮', group: 'I' },
  RSA_26:  { id: 'RSA_26',  name: 'South Africa',  code: 'RSA', flag: '🇿🇦', group: 'I' },
  // Group J
  URU_26:  { id: 'URU_26',  name: 'Uruguay',       code: 'URU', flag: '🇺🇾', group: 'J' },
  CZE_26:  { id: 'CZE_26',  name: 'Czech Republic',code: 'CZE', flag: '🇨🇿', group: 'J' },
  THA_26:  { id: 'THA_26',  name: 'Thailand',      code: 'THA', flag: '🇹🇭', group: 'J' },
  IRQ_26:  { id: 'IRQ_26',  name: 'Iraq',          code: 'IRQ', flag: '🇮🇶', group: 'J' },
  // Group K
  CRO_K26: { id: 'CRO_K26', name: 'Colombia',      code: 'COL', flag: '🇨🇴', group: 'K' },
  MAR_26:  { id: 'MAR_26',  name: 'Morocco',       code: 'MAR', flag: '🇲🇦', group: 'K' },
  CMR_26:  { id: 'CMR_26',  name: 'Cameroon',      code: 'CMR', flag: '🇨🇲', group: 'K' },
  NGA_26:  { id: 'NGA_26',  name: 'Nigeria',       code: 'NGA', flag: '🇳🇬', group: 'K' },
  // Group L
  KOR_26:  { id: 'KOR_26',  name: 'South Korea',   code: 'KOR', flag: '🇰🇷', group: 'L' },
  IRN_26:  { id: 'IRN_26',  name: 'Iran',          code: 'IRN', flag: '🇮🇷', group: 'L' },
  OMN_26:  { id: 'OMN_26',  name: 'Oman',          code: 'OMA', flag: '🇴🇲', group: 'L' },
  CAF_26:  { id: 'CAF_26',  name: 'Côte d\'Ivoire',code: 'CIV', flag: '🇨🇮', group: 'L' },
}

// ─── STADIUMS ─────────────────────────────────────────────────────────────────
export interface MockStadium {
  id: string
  slug: string
  name: string
  city: string
  country: string
  flag: string
  capacity: number
  hero_image_url: string
  avg_atmosphere: number
  avg_food: number
  avg_hotel: number
  avg_safety: number
  avg_rating: number
  total_reviews: number
  transport_status: string
  security_score: number
  year_opened: number
  surface: string
  roof_type: string
  note: string | null
}

export const STADIUMS_2022: MockStadium[] = [
  {
    id: 'lusail', slug: 'lusail', name: 'Lusail Stadium', city: 'Lusail', country: 'Qatar', flag: '🇶🇦',
    capacity: 88966, hero_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Lusail_Stadium.jpg/1280px-Lusail_Stadium.jpg',
    avg_atmosphere: 4.8, avg_food: 4.2, avg_hotel: 4.6, avg_safety: 4.9, avg_rating: 4.7, total_reviews: 3821,
    transport_status: 'Metro Line', security_score: 4.9, year_opened: 2021, surface: 'Natural Grass', roof_type: 'Covered', note: 'World Cup Final venue',
  },
  {
    id: 'al-bayt', slug: 'al-bayt', name: 'Al Bayt Stadium', city: 'Al Khor', country: 'Qatar', flag: '🇶🇦',
    capacity: 60000, hero_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Al_Bayt_Stadium_-_Qatar_2022.jpg/1280px-Al_Bayt_Stadium_-_Qatar_2022.jpg',
    avg_atmosphere: 4.7, avg_food: 4.1, avg_hotel: 4.2, avg_safety: 4.8, avg_rating: 4.5, total_reviews: 2910,
    transport_status: 'Shuttle Bus', security_score: 4.8, year_opened: 2021, surface: 'Natural Grass', roof_type: 'Retractable', note: 'Tent-inspired design',
  },
  {
    id: 'stadium-974', slug: 'stadium-974', name: 'Stadium 974', city: 'Doha', country: 'Qatar', flag: '🇶🇦',
    capacity: 40000, hero_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Ras_Abu_Aboud_%28Stadium_974%29_-_Qatar_2022.jpg/1280px-Ras_Abu_Aboud_%28Stadium_974%29_-_Qatar_2022.jpg',
    avg_atmosphere: 4.4, avg_food: 4.0, avg_hotel: 4.3, avg_safety: 4.7, avg_rating: 4.3, total_reviews: 1840,
    transport_status: 'Metro + Shuttle', security_score: 4.7, year_opened: 2021, surface: 'Artificial Turf', roof_type: 'Open Air', note: 'Built from shipping containers',
  },
  {
    id: 'education-city', slug: 'education-city', name: 'Education City Stadium', city: 'Al Rayyan', country: 'Qatar', flag: '🇶🇦',
    capacity: 45350, hero_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Education_City_Stadium_-_Qatar_2022.jpg/1280px-Education_City_Stadium_-_Qatar_2022.jpg',
    avg_atmosphere: 4.6, avg_food: 4.3, avg_hotel: 4.4, avg_safety: 4.8, avg_rating: 4.5, total_reviews: 2100,
    transport_status: 'Metro Line', security_score: 4.8, year_opened: 2020, surface: 'Natural Grass', roof_type: 'Covered', note: 'Diamond in the desert',
  },
]

export const STADIUMS_2026: MockStadium[] = [
  {
    id: 'metlife', slug: 'metlife', name: 'MetLife Stadium', city: 'East Rutherford, NJ', country: 'USA', flag: '🇺🇸',
    capacity: 82500, hero_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/MetLife_Stadium.jpg/1280px-MetLife_Stadium.jpg',
    avg_atmosphere: 4.7, avg_food: 4.3, avg_hotel: 4.5, avg_safety: 4.8, avg_rating: 4.6, total_reviews: 1240,
    transport_status: 'NJ Transit', security_score: 4.8, year_opened: 2010, surface: 'FieldTurf', roof_type: 'Open Air', note: 'World Cup Final venue',
  },
  {
    id: 'sofi', slug: 'sofi', name: 'SoFi Stadium', city: 'Inglewood, CA', country: 'USA', flag: '🇺🇸',
    capacity: 70240, hero_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/SoFi_Stadium_-_Aerial_View.jpg/1280px-SoFi_Stadium_-_Aerial_View.jpg',
    avg_atmosphere: 4.8, avg_food: 4.6, avg_hotel: 4.7, avg_safety: 4.9, avg_rating: 4.8, total_reviews: 980,
    transport_status: 'Shuttle + Rideshare', security_score: 4.9, year_opened: 2020, surface: 'Natural Grass', roof_type: 'Translucent Roof', note: 'Most expensive stadium ever built',
  },
  {
    id: 'azteca', slug: 'azteca', name: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico', flag: '🇲🇽',
    capacity: 87523, hero_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Azteca_Stadium.jpg/1280px-Azteca_Stadium.jpg',
    avg_atmosphere: 5.0, avg_food: 4.2, avg_hotel: 4.0, avg_safety: 4.5, avg_rating: 4.7, total_reviews: 5621,
    transport_status: 'Metro Line 2', security_score: 4.5, year_opened: 1966, surface: 'Natural Grass', roof_type: 'Open Air', note: 'Temple of football — 3 World Cup games',
  },
  {
    id: 'att', slug: 'att', name: 'AT&T Stadium', city: 'Arlington, TX', country: 'USA', flag: '🇺🇸',
    capacity: 80000, hero_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/ATT_Stadium.JPG/1280px-ATT_Stadium.JPG',
    avg_atmosphere: 4.5, avg_food: 4.4, avg_hotel: 4.3, avg_safety: 4.7, avg_rating: 4.5, total_reviews: 876,
    transport_status: 'Shuttle Bus', security_score: 4.7, year_opened: 2009, surface: 'Natural Grass', roof_type: 'Retractable', note: 'Jerry World',
  },
  {
    id: 'arrowhead', slug: 'arrowhead', name: 'Arrowhead Stadium', city: 'Kansas City, MO', country: 'USA', flag: '🇺🇸',
    capacity: 76416, hero_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Arrowhead_Stadium_Aerial_1.jpg/1280px-Arrowhead_Stadium_Aerial_1.jpg',
    avg_atmosphere: 4.9, avg_food: 4.5, avg_hotel: 4.2, avg_safety: 4.7, avg_rating: 4.7, total_reviews: 720,
    transport_status: 'Park & Ride', security_score: 4.7, year_opened: 1972, surface: 'Natural Grass', roof_type: 'Open Air', note: 'Loudest outdoor stadium in the world',
  },
  {
    id: 'estadio-akron', slug: 'estadio-akron', name: 'Estadio Akron', city: 'Guadalajara', country: 'Mexico', flag: '🇲🇽',
    capacity: 49850, hero_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Estadio_Omnilife_interior.jpg/1280px-Estadio_Omnilife_interior.jpg',
    avg_atmosphere: 4.8, avg_food: 4.1, avg_hotel: 4.0, avg_safety: 4.4, avg_rating: 4.4, total_reviews: 430,
    transport_status: 'Shuttle Bus', security_score: 4.4, year_opened: 2010, surface: 'Natural Grass', roof_type: 'Partial Cover', note: 'Home of Chivas',
  },
  {
    id: 'bcplace', slug: 'bcplace', name: 'BC Place', city: 'Vancouver', country: 'Canada', flag: '🇨🇦',
    capacity: 54500, hero_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/BC_Place_Stadium_2011.jpg/1280px-BC_Place_Stadium_2011.jpg',
    avg_atmosphere: 4.3, avg_food: 4.2, avg_hotel: 4.6, avg_safety: 4.9, avg_rating: 4.5, total_reviews: 380,
    transport_status: 'SkyTrain', security_score: 4.9, year_opened: 1983, surface: 'FieldTurf', roof_type: 'Retractable', note: 'Canada\'s largest stadium',
  },
  {
    id: 'bmostadium', slug: 'bmostadium', name: 'BMO Field', city: 'Toronto', country: 'Canada', flag: '🇨🇦',
    capacity: 45000, hero_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/BMO_Field_Toronto_2016.jpg/1280px-BMO_Field_Toronto_2016.jpg',
    avg_atmosphere: 4.4, avg_food: 4.3, avg_hotel: 4.5, avg_safety: 4.8, avg_rating: 4.4, total_reviews: 290,
    transport_status: 'TTC + Shuttle', security_score: 4.8, year_opened: 2007, surface: 'Natural Grass', roof_type: 'Open Air', note: 'Lakefront views',
  },
]

// ─── GROUP STAGE STANDINGS ────────────────────────────────────────────────────
export interface GroupRow {
  flag: string
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  pts: number
  qualified?: boolean
}

export const GROUPS_2022: Record<string, GroupRow[]> = {
  A: [
    { flag: '🇳🇱', team: 'Netherlands',  played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 1, gd: 4,  pts: 7, qualified: true },
    { flag: '🇸🇳', team: 'Senegal',      played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 4, gd: 1,  pts: 6, qualified: true },
    { flag: '🇪🇨', team: 'Ecuador',      played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 3, gd: 1,  pts: 4 },
    { flag: '🇶🇦', team: 'Qatar',        played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 7, gd: -6, pts: 0 },
  ],
  B: [
    { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', team: 'England',      played: 3, won: 2, drawn: 1, lost: 0, gf: 9, ga: 2, gd: 7,  pts: 7, qualified: true },
    { flag: '🇺🇸', team: 'USA',          played: 3, won: 1, drawn: 2, lost: 0, gf: 2, ga: 1, gd: 1,  pts: 5, qualified: true },
    { flag: '🇮🇷', team: 'Iran',         played: 3, won: 1, drawn: 0, lost: 2, gf: 4, ga: 7, gd: -3, pts: 3 },
    { flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', team: 'Wales',        played: 3, won: 0, drawn: 1, lost: 2, gf: 1, ga: 6, gd: -5, pts: 1 },
  ],
  C: [
    { flag: '🇦🇷', team: 'Argentina',    played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 2, gd: 3,  pts: 6, qualified: true },
    { flag: '🇵🇱', team: 'Poland',       played: 3, won: 1, drawn: 1, lost: 1, gf: 2, ga: 2, gd: 0,  pts: 4, qualified: true },
    { flag: '🇲🇽', team: 'Mexico',       played: 3, won: 1, drawn: 1, lost: 1, gf: 2, ga: 3, gd: -1, pts: 4 },
    { flag: '🇸🇦', team: 'Saudi Arabia', played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 5, gd: -2, pts: 3 },
  ],
  D: [
    { flag: '🇫🇷', team: 'France',       played: 3, won: 2, drawn: 0, lost: 1, gf: 6, ga: 2, gd: 4,  pts: 6, qualified: true },
    { flag: '🇦🇺', team: 'Australia',    played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, gd: -1, pts: 4, qualified: true },
    { flag: '🇹🇳', team: 'Tunisia',      played: 3, won: 1, drawn: 1, lost: 1, gf: 1, ga: 1, gd: 0,  pts: 4 },
    { flag: '🇩🇰', team: 'Denmark',      played: 3, won: 0, drawn: 2, lost: 1, gf: 1, ga: 3, gd: -2, pts: 2 },
  ],
  E: [
    { flag: '🇯🇵', team: 'Japan',        played: 3, won: 2, drawn: 0, lost: 1, gf: 4, ga: 3, gd: 1,  pts: 6, qualified: true },
    { flag: '🇪🇸', team: 'Spain',        played: 3, won: 1, drawn: 1, lost: 1, gf: 9, ga: 3, gd: 6,  pts: 4, qualified: true },
    { flag: '🇩🇪', team: 'Germany',      played: 3, won: 1, drawn: 1, lost: 1, gf: 6, ga: 5, gd: 1,  pts: 4 },
    { flag: '🇨🇷', team: 'Costa Rica',   played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 11,gd: -8, pts: 3 },
  ],
  F: [
    { flag: '🇲🇦', team: 'Morocco',      played: 3, won: 2, drawn: 1, lost: 0, gf: 4, ga: 1, gd: 3,  pts: 7, qualified: true },
    { flag: '🇭🇷', team: 'Croatia',      played: 3, won: 1, drawn: 2, lost: 0, gf: 4, ga: 1, gd: 3,  pts: 5, qualified: true },
    { flag: '🇧🇪', team: 'Belgium',      played: 3, won: 1, drawn: 1, lost: 1, gf: 1, ga: 2, gd: -1, pts: 4 },
    { flag: '🇨🇦', team: 'Canada',       played: 3, won: 0, drawn: 0, lost: 3, gf: 2, ga: 6, gd: -4, pts: 0 },
  ],
  G: [
    { flag: '🇧🇷', team: 'Brazil',       played: 3, won: 2, drawn: 0, lost: 1, gf: 3, ga: 3, gd: 0,  pts: 6, qualified: true },
    { flag: '🇨🇭', team: 'Switzerland',  played: 3, won: 2, drawn: 0, lost: 1, gf: 4, ga: 3, gd: 1,  pts: 6, qualified: true },
    { flag: '🇷🇸', team: 'Serbia',       played: 3, won: 1, drawn: 0, lost: 2, gf: 5, ga: 5, gd: 0,  pts: 3 },
    { flag: '🇨🇲', team: 'Cameroon',     played: 3, won: 1, drawn: 0, lost: 2, gf: 4, ga: 4, gd: 0,  pts: 3 },
  ],
  H: [
    { flag: '🇵🇹', team: 'Portugal',     played: 3, won: 2, drawn: 0, lost: 1, gf: 6, ga: 4, gd: 2,  pts: 6, qualified: true },
    { flag: '🇰🇷', team: 'South Korea',  played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 4, gd: 0,  pts: 4, qualified: true },
    { flag: '🇺🇾', team: 'Uruguay',      played: 3, won: 1, drawn: 1, lost: 1, gf: 2, ga: 2, gd: 0,  pts: 4 },
    { flag: '🇬🇭', team: 'Ghana',        played: 3, won: 1, drawn: 0, lost: 2, gf: 5, ga: 7, gd: -2, pts: 3 },
  ],
}

export const GROUPS_2026: Record<string, GroupRow[]> = {
  A: [
    { flag: '🇺🇸', team: 'USA',           played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇵🇦', team: 'Panama',        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇦🇱', team: 'Albania',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇺🇦', team: 'Ukraine',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  B: [
    { flag: '🇦🇷', team: 'Argentina',     played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇨🇱', team: 'Chile',         played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇵🇪', team: 'Peru',          played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇦🇺', team: 'Australia',     played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  C: [
    { flag: '🇲🇽', team: 'Mexico',        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇨🇦', team: 'Canada',        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇭🇳', team: 'Honduras',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇳🇿', team: 'New Zealand',   played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  D: [
    { flag: '🇫🇷', team: 'France',        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇵🇱', team: 'Poland',        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇮🇱', team: 'Israel',        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇧🇮', team: 'Burundi',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  E: [
    { flag: '🇪🇸', team: 'Spain',         played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇳🇱', team: 'Netherlands',   played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇧🇪', team: 'Belgium',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇭🇷', team: 'Croatia',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  F: [
    { flag: '🇧🇷', team: 'Brazil',        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇪🇨', team: 'Ecuador',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇻🇪', team: 'Venezuela',     played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇵🇸', team: 'Palestine',     played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  G: [
    { flag: '🇵🇹', team: 'Portugal',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇩🇰', team: 'Denmark',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇨🇭', team: 'Switzerland',   played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇷🇸', team: 'Serbia',        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  H: [
    { flag: '🇩🇪', team: 'Germany',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇯🇵', team: 'Japan',         played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇸🇦', team: 'Saudi Arabia',  played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇧🇭', team: 'Bahrain',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  I: [
    { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', team: 'England',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇸🇳', team: 'Senegal',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇸🇮', team: 'Slovenia',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇿🇦', team: 'South Africa',  played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  J: [
    { flag: '🇺🇾', team: 'Uruguay',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇨🇿', team: 'Czech Republic',played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇹🇭', team: 'Thailand',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇮🇶', team: 'Iraq',          played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  K: [
    { flag: '🇨🇴', team: 'Colombia',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇲🇦', team: 'Morocco',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇨🇲', team: 'Cameroon',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇳🇬', team: 'Nigeria',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  L: [
    { flag: '🇰🇷', team: 'South Korea',   played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇮🇷', team: 'Iran',          played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇴🇲', team: 'Oman',          played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇨🇮', team: 'Côte d\'Ivoire',played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
}

// ─── MATCHES ──────────────────────────────────────────────────────────────────
export type MatchStatus = 'finished' | 'live' | 'upcoming'

export interface MockMatch {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  homeScore: number | null
  awayScore: number | null
  stage: string
  group?: string
  date: string          // ISO or display string
  time: string
  venue: string
  city: string
  status: MatchStatus
  minute?: number
  highlights?: string   // YouTube embed ID
}

// ── 2022 Group Stage (all 48 matches — representative sample for display) ─────
export const MATCHES_2022: MockMatch[] = [
  // Group A
  { id: 'q22-a1', homeTeam: 'Qatar', homeFlag: '🇶🇦', awayTeam: 'Ecuador', awayFlag: '🇪🇨', homeScore: 0, awayScore: 2, stage: 'Group A', group: 'A', date: 'Nov 20, 2022', time: '17:00', venue: 'Al Bayt Stadium', city: 'Al Khor', status: 'finished' },
  { id: 'q22-a2', homeTeam: 'Senegal', homeFlag: '🇸🇳', awayTeam: 'Netherlands', awayFlag: '🇳🇱', homeScore: 0, awayScore: 2, stage: 'Group A', group: 'A', date: 'Nov 21, 2022', time: '17:00', venue: 'Al Thumama Stadium', city: 'Doha', status: 'finished' },
  { id: 'q22-a3', homeTeam: 'Qatar', homeFlag: '🇶🇦', awayTeam: 'Senegal', awayFlag: '🇸🇳', homeScore: 1, awayScore: 3, stage: 'Group A', group: 'A', date: 'Nov 25, 2022', time: '17:00', venue: 'Al Thumama Stadium', city: 'Doha', status: 'finished' },
  { id: 'q22-a4', homeTeam: 'Netherlands', homeFlag: '🇳🇱', awayTeam: 'Ecuador', awayFlag: '🇪🇨', homeScore: 1, awayScore: 1, stage: 'Group A', group: 'A', date: 'Nov 25, 2022', time: '20:00', venue: 'Khalifa International', city: 'Doha', status: 'finished' },
  { id: 'q22-a5', homeTeam: 'Ecuador', homeFlag: '🇪🇨', awayTeam: 'Senegal', awayFlag: '🇸🇳', homeScore: 1, awayScore: 2, stage: 'Group A', group: 'A', date: 'Nov 29, 2022', time: '22:00', venue: 'Khalifa International', city: 'Doha', status: 'finished' },
  { id: 'q22-a6', homeTeam: 'Netherlands', homeFlag: '🇳🇱', awayTeam: 'Qatar', awayFlag: '🇶🇦', homeScore: 2, awayScore: 0, stage: 'Group A', group: 'A', date: 'Nov 29, 2022', time: '22:00', venue: 'Al Bayt Stadium', city: 'Al Khor', status: 'finished' },
  // Group B
  { id: 'q22-b1', homeTeam: 'England', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayTeam: 'Iran', awayFlag: '🇮🇷', homeScore: 6, awayScore: 2, stage: 'Group B', group: 'B', date: 'Nov 21, 2022', time: '14:00', venue: 'Khalifa International', city: 'Doha', status: 'finished' },
  { id: 'q22-b2', homeTeam: 'USA', homeFlag: '🇺🇸', awayTeam: 'Wales', awayFlag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', homeScore: 1, awayScore: 1, stage: 'Group B', group: 'B', date: 'Nov 21, 2022', time: '20:00', venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan', status: 'finished' },
  { id: 'q22-b3', homeTeam: 'Wales', homeFlag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', awayTeam: 'Iran', awayFlag: '🇮🇷', homeScore: 0, awayScore: 2, stage: 'Group B', group: 'B', date: 'Nov 25, 2022', time: '14:00', venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan', status: 'finished' },
  { id: 'q22-b4', homeTeam: 'England', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayTeam: 'USA', awayFlag: '🇺🇸', homeScore: 0, awayScore: 0, stage: 'Group B', group: 'B', date: 'Nov 25, 2022', time: '20:00', venue: 'Al Bayt Stadium', city: 'Al Khor', status: 'finished' },
  { id: 'q22-b5', homeTeam: 'Iran', homeFlag: '🇮🇷', awayTeam: 'USA', awayFlag: '🇺🇸', homeScore: 0, awayScore: 1, stage: 'Group B', group: 'B', date: 'Nov 29, 2022', time: '22:00', venue: 'Al Thumama Stadium', city: 'Doha', status: 'finished' },
  { id: 'q22-b6', homeTeam: 'Wales', homeFlag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', awayTeam: 'England', awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', homeScore: 0, awayScore: 3, stage: 'Group B', group: 'B', date: 'Nov 29, 2022', time: '22:00', venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan', status: 'finished' },
  // Group C
  { id: 'q22-c1', homeTeam: 'Argentina', homeFlag: '🇦🇷', awayTeam: 'Saudi Arabia', awayFlag: '🇸🇦', homeScore: 1, awayScore: 2, stage: 'Group C', group: 'C', date: 'Nov 22, 2022', time: '11:00', venue: 'Lusail Stadium', city: 'Lusail', status: 'finished' },
  { id: 'q22-c2', homeTeam: 'Mexico', homeFlag: '🇲🇽', awayTeam: 'Poland', awayFlag: '🇵🇱', homeScore: 0, awayScore: 0, stage: 'Group C', group: 'C', date: 'Nov 22, 2022', time: '17:00', venue: 'Stadium 974', city: 'Doha', status: 'finished' },
  { id: 'q22-c3', homeTeam: 'Poland', homeFlag: '🇵🇱', awayTeam: 'Saudi Arabia', awayFlag: '🇸🇦', homeScore: 2, awayScore: 0, stage: 'Group C', group: 'C', date: 'Nov 26, 2022', time: '17:00', venue: 'Education City', city: 'Al Rayyan', status: 'finished' },
  { id: 'q22-c4', homeTeam: 'Argentina', homeFlag: '🇦🇷', awayTeam: 'Mexico', awayFlag: '🇲🇽', homeScore: 2, awayScore: 0, stage: 'Group C', group: 'C', date: 'Nov 26, 2022', time: '20:00', venue: 'Lusail Stadium', city: 'Lusail', status: 'finished' },
  { id: 'q22-c5', homeTeam: 'Poland', homeFlag: '🇵🇱', awayTeam: 'Argentina', awayFlag: '🇦🇷', homeScore: 0, awayScore: 2, stage: 'Group C', group: 'C', date: 'Nov 30, 2022', time: '22:00', venue: 'Stadium 974', city: 'Doha', status: 'finished' },
  { id: 'q22-c6', homeTeam: 'Saudi Arabia', homeFlag: '🇸🇦', awayTeam: 'Mexico', awayFlag: '🇲🇽', homeScore: 1, awayScore: 2, stage: 'Group C', group: 'C', date: 'Nov 30, 2022', time: '22:00', venue: 'Lusail Stadium', city: 'Lusail', status: 'finished' },
  // Group D
  { id: 'q22-d1', homeTeam: 'Denmark', homeFlag: '🇩🇰', awayTeam: 'Tunisia', awayFlag: '🇹🇳', homeScore: 0, awayScore: 0, stage: 'Group D', group: 'D', date: 'Nov 22, 2022', time: '14:00', venue: 'Education City', city: 'Al Rayyan', status: 'finished' },
  { id: 'q22-d2', homeTeam: 'France', homeFlag: '🇫🇷', awayTeam: 'Australia', awayFlag: '🇦🇺', homeScore: 4, awayScore: 1, stage: 'Group D', group: 'D', date: 'Nov 22, 2022', time: '20:00', venue: 'Al Janoub Stadium', city: 'Al Wakrah', status: 'finished' },
  { id: 'q22-d3', homeTeam: 'Tunisia', homeFlag: '🇹🇳', awayTeam: 'Australia', awayFlag: '🇦🇺', homeScore: 0, awayScore: 1, stage: 'Group D', group: 'D', date: 'Nov 26, 2022', time: '14:00', venue: 'Al Janoub Stadium', city: 'Al Wakrah', status: 'finished' },
  { id: 'q22-d4', homeTeam: 'France', homeFlag: '🇫🇷', awayTeam: 'Denmark', awayFlag: '🇩🇰', homeScore: 2, awayScore: 1, stage: 'Group D', group: 'D', date: 'Nov 26, 2022', time: '20:00', venue: 'Stadium 974', city: 'Doha', status: 'finished' },
  { id: 'q22-d5', homeTeam: 'Australia', homeFlag: '🇦🇺', awayTeam: 'Denmark', awayFlag: '🇩🇰', homeScore: 1, awayScore: 0, stage: 'Group D', group: 'D', date: 'Nov 30, 2022', time: '18:00', venue: 'Al Janoub Stadium', city: 'Al Wakrah', status: 'finished' },
  { id: 'q22-d6', homeTeam: 'Tunisia', homeFlag: '🇹🇳', awayTeam: 'France', awayFlag: '🇫🇷', homeScore: 1, awayScore: 0, stage: 'Group D', group: 'D', date: 'Nov 30, 2022', time: '18:00', venue: 'Education City', city: 'Al Rayyan', status: 'finished' },
  // Group E
  { id: 'q22-e1', homeTeam: 'Germany', homeFlag: '🇩🇪', awayTeam: 'Japan', awayFlag: '🇯🇵', homeScore: 1, awayScore: 2, stage: 'Group E', group: 'E', date: 'Nov 23, 2022', time: '14:00', venue: 'Khalifa International', city: 'Doha', status: 'finished' },
  { id: 'q22-e2', homeTeam: 'Spain', homeFlag: '🇪🇸', awayTeam: 'Costa Rica', awayFlag: '🇨🇷', homeScore: 7, awayScore: 0, stage: 'Group E', group: 'E', date: 'Nov 23, 2022', time: '20:00', venue: 'Al Thumama Stadium', city: 'Doha', status: 'finished' },
  { id: 'q22-e3', homeTeam: 'Japan', homeFlag: '🇯🇵', awayTeam: 'Costa Rica', awayFlag: '🇨🇷', homeScore: 0, awayScore: 1, stage: 'Group E', group: 'E', date: 'Nov 27, 2022', time: '11:00', venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan', status: 'finished' },
  { id: 'q22-e4', homeTeam: 'Spain', homeFlag: '🇪🇸', awayTeam: 'Germany', awayFlag: '🇩🇪', homeScore: 1, awayScore: 1, stage: 'Group E', group: 'E', date: 'Nov 27, 2022', time: '20:00', venue: 'Al Bayt Stadium', city: 'Al Khor', status: 'finished' },
  { id: 'q22-e5', homeTeam: 'Japan', homeFlag: '🇯🇵', awayTeam: 'Spain', awayFlag: '🇪🇸', homeScore: 2, awayScore: 1, stage: 'Group E', group: 'E', date: 'Dec 1, 2022', time: '22:00', venue: 'Khalifa International', city: 'Doha', status: 'finished' },
  { id: 'q22-e6', homeTeam: 'Costa Rica', homeFlag: '🇨🇷', awayTeam: 'Germany', awayFlag: '🇩🇪', homeScore: 2, awayScore: 4, stage: 'Group E', group: 'E', date: 'Dec 1, 2022', time: '22:00', venue: 'Al Bayt Stadium', city: 'Al Khor', status: 'finished' },
  // Group F
  { id: 'q22-f1', homeTeam: 'Morocco', homeFlag: '🇲🇦', awayTeam: 'Croatia', awayFlag: '🇭🇷', homeScore: 0, awayScore: 0, stage: 'Group F', group: 'F', date: 'Nov 23, 2022', time: '11:00', venue: 'Al Bayt Stadium', city: 'Al Khor', status: 'finished' },
  { id: 'q22-f2', homeTeam: 'Belgium', homeFlag: '🇧🇪', awayTeam: 'Canada', awayFlag: '🇨🇦', homeScore: 1, awayScore: 0, stage: 'Group F', group: 'F', date: 'Nov 23, 2022', time: '17:00', venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan', status: 'finished' },
  { id: 'q22-f3', homeTeam: 'Belgium', homeFlag: '🇧🇪', awayTeam: 'Morocco', awayFlag: '🇲🇦', homeScore: 0, awayScore: 2, stage: 'Group F', group: 'F', date: 'Nov 27, 2022', time: '14:00', venue: 'Al Thumama Stadium', city: 'Doha', status: 'finished' },
  { id: 'q22-f4', homeTeam: 'Croatia', homeFlag: '🇭🇷', awayTeam: 'Canada', awayFlag: '🇨🇦', homeScore: 4, awayScore: 1, stage: 'Group F', group: 'F', date: 'Nov 27, 2022', time: '17:00', venue: 'Khalifa International', city: 'Doha', status: 'finished' },
  { id: 'q22-f5', homeTeam: 'Croatia', homeFlag: '🇭🇷', awayTeam: 'Belgium', awayFlag: '🇧🇪', homeScore: 0, awayScore: 0, stage: 'Group F', group: 'F', date: 'Dec 1, 2022', time: '18:00', venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan', status: 'finished' },
  { id: 'q22-f6', homeTeam: 'Canada', homeFlag: '🇨🇦', awayTeam: 'Morocco', awayFlag: '🇲🇦', homeScore: 1, awayScore: 2, stage: 'Group F', group: 'F', date: 'Dec 1, 2022', time: '18:00', venue: 'Al Thumama Stadium', city: 'Doha', status: 'finished' },
  // Group G
  { id: 'q22-g1', homeTeam: 'Brazil', homeFlag: '🇧🇷', awayTeam: 'Serbia', awayFlag: '🇷🇸', homeScore: 2, awayScore: 0, stage: 'Group G', group: 'G', date: 'Nov 24, 2022', time: '20:00', venue: 'Lusail Stadium', city: 'Lusail', status: 'finished' },
  { id: 'q22-g2', homeTeam: 'Switzerland', homeFlag: '🇨🇭', awayTeam: 'Cameroon', awayFlag: '🇨🇲', homeScore: 1, awayScore: 0, stage: 'Group G', group: 'G', date: 'Nov 24, 2022', time: '14:00', venue: 'Al Janoub Stadium', city: 'Al Wakrah', status: 'finished' },
  { id: 'q22-g3', homeTeam: 'Cameroon', homeFlag: '🇨🇲', awayTeam: 'Serbia', awayFlag: '🇷🇸', homeScore: 3, awayScore: 3, stage: 'Group G', group: 'G', date: 'Nov 28, 2022', time: '11:00', venue: 'Al Janoub Stadium', city: 'Al Wakrah', status: 'finished' },
  { id: 'q22-g4', homeTeam: 'Brazil', homeFlag: '🇧🇷', awayTeam: 'Switzerland', awayFlag: '🇨🇭', homeScore: 1, awayScore: 0, stage: 'Group G', group: 'G', date: 'Nov 28, 2022', time: '17:00', venue: 'Stadium 974', city: 'Doha', status: 'finished' },
  { id: 'q22-g5', homeTeam: 'Serbia', homeFlag: '🇷🇸', awayTeam: 'Switzerland', awayFlag: '🇨🇭', homeScore: 2, awayScore: 3, stage: 'Group G', group: 'G', date: 'Dec 2, 2022', time: '22:00', venue: 'Stadium 974', city: 'Doha', status: 'finished' },
  { id: 'q22-g6', homeTeam: 'Cameroon', homeFlag: '🇨🇲', awayTeam: 'Brazil', awayFlag: '🇧🇷', homeScore: 1, awayScore: 0, stage: 'Group G', group: 'G', date: 'Dec 2, 2022', time: '22:00', venue: 'Lusail Stadium', city: 'Lusail', status: 'finished' },
  // Group H
  { id: 'q22-h1', homeTeam: 'Portugal', homeFlag: '🇵🇹', awayTeam: 'Ghana', awayFlag: '🇬🇭', homeScore: 3, awayScore: 2, stage: 'Group H', group: 'H', date: 'Nov 24, 2022', time: '17:00', venue: 'Stadium 974', city: 'Doha', status: 'finished' },
  { id: 'q22-h2', homeTeam: 'South Korea', homeFlag: '🇰🇷', awayTeam: 'Uruguay', awayFlag: '🇺🇾', homeScore: 0, awayScore: 0, stage: 'Group H', group: 'H', date: 'Nov 24, 2022', time: '11:00', venue: 'Education City', city: 'Al Rayyan', status: 'finished' },
  { id: 'q22-h3', homeTeam: 'South Korea', homeFlag: '🇰🇷', awayTeam: 'Ghana', awayFlag: '🇬🇭', homeScore: 2, awayScore: 3, stage: 'Group H', group: 'H', date: 'Nov 28, 2022', time: '14:00', venue: 'Education City', city: 'Al Rayyan', status: 'finished' },
  { id: 'q22-h4', homeTeam: 'Portugal', homeFlag: '🇵🇹', awayTeam: 'Uruguay', awayFlag: '🇺🇾', homeScore: 2, awayScore: 0, stage: 'Group H', group: 'H', date: 'Nov 28, 2022', time: '20:00', venue: 'Lusail Stadium', city: 'Lusail', status: 'finished' },
  { id: 'q22-h5', homeTeam: 'Ghana', homeFlag: '🇬🇭', awayTeam: 'Uruguay', awayFlag: '🇺🇾', homeScore: 0, awayScore: 2, stage: 'Group H', group: 'H', date: 'Dec 2, 2022', time: '18:00', venue: 'Al Janoub Stadium', city: 'Al Wakrah', status: 'finished' },
  { id: 'q22-h6', homeTeam: 'South Korea', homeFlag: '🇰🇷', awayTeam: 'Portugal', awayFlag: '🇵🇹', homeScore: 2, awayScore: 1, stage: 'Group H', group: 'H', date: 'Dec 2, 2022', time: '18:00', venue: 'Education City', city: 'Al Rayyan', status: 'finished' },
  // Round of 16
  { id: 'q22-r16-1', homeTeam: 'Netherlands', homeFlag: '🇳🇱', awayTeam: 'USA', awayFlag: '🇺🇸', homeScore: 3, awayScore: 1, stage: 'Round of 16', date: 'Dec 3, 2022', time: '22:00', venue: 'Khalifa International', city: 'Doha', status: 'finished' },
  { id: 'q22-r16-2', homeTeam: 'Argentina', homeFlag: '🇦🇷', awayTeam: 'Australia', awayFlag: '🇦🇺', homeScore: 2, awayScore: 1, stage: 'Round of 16', date: 'Dec 3, 2022', time: '18:00', venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan', status: 'finished' },
  { id: 'q22-r16-3', homeTeam: 'France', homeFlag: '🇫🇷', awayTeam: 'Poland', awayFlag: '🇵🇱', homeScore: 3, awayScore: 1, stage: 'Round of 16', date: 'Dec 4, 2022', time: '18:00', venue: 'Al Thumama Stadium', city: 'Doha', status: 'finished' },
  { id: 'q22-r16-4', homeTeam: 'England', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayTeam: 'Senegal', awayFlag: '🇸🇳', homeScore: 3, awayScore: 0, stage: 'Round of 16', date: 'Dec 4, 2022', time: '22:00', venue: 'Al Bayt Stadium', city: 'Al Khor', status: 'finished' },
  { id: 'q22-r16-5', homeTeam: 'Japan', homeFlag: '🇯🇵', awayTeam: 'Croatia', awayFlag: '🇭🇷', homeScore: 1, awayScore: 1, stage: 'Round of 16', date: 'Dec 5, 2022', time: '18:00', venue: 'Al Janoub Stadium', city: 'Al Wakrah', status: 'finished' },
  { id: 'q22-r16-6', homeTeam: 'Brazil', homeFlag: '🇧🇷', awayTeam: 'South Korea', awayFlag: '🇰🇷', homeScore: 4, awayScore: 1, stage: 'Round of 16', date: 'Dec 5, 2022', time: '22:00', venue: 'Stadium 974', city: 'Doha', status: 'finished' },
  { id: 'q22-r16-7', homeTeam: 'Morocco', homeFlag: '🇲🇦', awayTeam: 'Spain', awayFlag: '🇪🇸', homeScore: 0, awayScore: 0, stage: 'Round of 16', date: 'Dec 6, 2022', time: '18:00', venue: 'Education City', city: 'Al Rayyan', status: 'finished' },
  { id: 'q22-r16-8', homeTeam: 'Portugal', homeFlag: '🇵🇹', awayTeam: 'Switzerland', awayFlag: '🇨🇭', homeScore: 6, awayScore: 1, stage: 'Round of 16', date: 'Dec 6, 2022', time: '22:00', venue: 'Lusail Stadium', city: 'Lusail', status: 'finished' },
  // Quarterfinals
  { id: 'q22-qf1', homeTeam: 'Croatia', homeFlag: '🇭🇷', awayTeam: 'Brazil', awayFlag: '🇧🇷', homeScore: 1, awayScore: 1, stage: 'Quarterfinal', date: 'Dec 9, 2022', time: '22:00', venue: 'Education City', city: 'Al Rayyan', status: 'finished' },
  { id: 'q22-qf2', homeTeam: 'Netherlands', homeFlag: '🇳🇱', awayTeam: 'Argentina', awayFlag: '🇦🇷', homeScore: 2, awayScore: 2, stage: 'Quarterfinal', date: 'Dec 9, 2022', time: '18:00', venue: 'Lusail Stadium', city: 'Lusail', status: 'finished' },
  { id: 'q22-qf3', homeTeam: 'Morocco', homeFlag: '🇲🇦', awayTeam: 'Portugal', awayFlag: '🇵🇹', homeScore: 1, awayScore: 0, stage: 'Quarterfinal', date: 'Dec 10, 2022', time: '22:00', venue: 'Al Thumama Stadium', city: 'Doha', status: 'finished' },
  { id: 'q22-qf4', homeTeam: 'England', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayTeam: 'France', awayFlag: '🇫🇷', homeScore: 1, awayScore: 2, stage: 'Quarterfinal', date: 'Dec 10, 2022', time: '18:00', venue: 'Al Bayt Stadium', city: 'Al Khor', status: 'finished' },
  // Semifinals
  { id: 'q22-sf1', homeTeam: 'Argentina', homeFlag: '🇦🇷', awayTeam: 'Croatia', awayFlag: '🇭🇷', homeScore: 3, awayScore: 0, stage: 'Semifinal', date: 'Dec 13, 2022', time: '22:00', venue: 'Lusail Stadium', city: 'Lusail', status: 'finished' },
  { id: 'q22-sf2', homeTeam: 'France', homeFlag: '🇫🇷', awayTeam: 'Morocco', awayFlag: '🇲🇦', homeScore: 2, awayScore: 0, stage: 'Semifinal', date: 'Dec 14, 2022', time: '22:00', venue: 'Al Bayt Stadium', city: 'Al Khor', status: 'finished' },
  // 3rd Place
  { id: 'q22-3rd', homeTeam: 'Croatia', homeFlag: '🇭🇷', awayTeam: 'Morocco', awayFlag: '🇲🇦', homeScore: 2, awayScore: 1, stage: '3rd Place', date: 'Dec 17, 2022', time: '18:00', venue: 'Khalifa International', city: 'Doha', status: 'finished' },
  // Final
  { id: 'q22-final', homeTeam: 'Argentina', homeFlag: '🇦🇷', awayTeam: 'France', awayFlag: '🇫🇷', homeScore: 3, awayScore: 3, stage: 'Final', date: 'Dec 18, 2022', time: '18:00', venue: 'Lusail Stadium', city: 'Lusail', status: 'finished' },
]

// ── 2026 Group Stage Fixtures (confirmed draws — no scores yet) ───────────────
export const MATCHES_2026: MockMatch[] = [
  // Group A — USA host group; playing at MetLife & AT&T
  { id: '26-a1', homeTeam: 'USA', homeFlag: '🇺🇸', awayTeam: 'Panama', awayFlag: '🇵🇦', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'A', date: 'Jun 12, 2026', time: '21:00', venue: 'SoFi Stadium', city: 'Inglewood, CA', status: 'upcoming' },
  { id: '26-a2', homeTeam: 'Ukraine', homeFlag: '🇺🇦', awayTeam: 'Albania', awayFlag: '🇦🇱', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'A', date: 'Jun 13, 2026', time: '15:00', venue: 'AT&T Stadium', city: 'Arlington, TX', status: 'upcoming' },
  { id: '26-a3', homeTeam: 'USA', homeFlag: '🇺🇸', awayTeam: 'Ukraine', awayFlag: '🇺🇦', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'A', date: 'Jun 17, 2026', time: '21:00', venue: 'SoFi Stadium', city: 'Inglewood, CA', status: 'upcoming' },
  { id: '26-a4', homeTeam: 'Panama', homeFlag: '🇵🇦', awayTeam: 'Albania', awayFlag: '🇦🇱', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'A', date: 'Jun 18, 2026', time: '15:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-a5', homeTeam: 'USA', homeFlag: '🇺🇸', awayTeam: 'Albania', awayFlag: '🇦🇱', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'A', date: 'Jun 22, 2026', time: '18:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-a6', homeTeam: 'Panama', homeFlag: '🇵🇦', awayTeam: 'Ukraine', awayFlag: '🇺🇦', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'A', date: 'Jun 22, 2026', time: '18:00', venue: 'AT&T Stadium', city: 'Arlington, TX', status: 'upcoming' },
  // Group B — Argentina
  { id: '26-b1', homeTeam: 'Argentina', homeFlag: '🇦🇷', awayTeam: 'Chile', awayFlag: '🇨🇱', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'B', date: 'Jun 13, 2026', time: '18:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-b2', homeTeam: 'Peru', homeFlag: '🇵🇪', awayTeam: 'Australia', awayFlag: '🇦🇺', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'B', date: 'Jun 14, 2026', time: '15:00', venue: 'AT&T Stadium', city: 'Arlington, TX', status: 'upcoming' },
  { id: '26-b3', homeTeam: 'Argentina', homeFlag: '🇦🇷', awayTeam: 'Peru', awayFlag: '🇵🇪', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'B', date: 'Jun 18, 2026', time: '21:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-b4', homeTeam: 'Chile', homeFlag: '🇨🇱', awayTeam: 'Australia', awayFlag: '🇦🇺', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'B', date: 'Jun 19, 2026', time: '15:00', venue: 'SoFi Stadium', city: 'Inglewood, CA', status: 'upcoming' },
  { id: '26-b5', homeTeam: 'Argentina', homeFlag: '🇦🇷', awayTeam: 'Australia', awayFlag: '🇦🇺', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'B', date: 'Jun 23, 2026', time: '18:00', venue: 'AT&T Stadium', city: 'Arlington, TX', status: 'upcoming' },
  { id: '26-b6', homeTeam: 'Chile', homeFlag: '🇨🇱', awayTeam: 'Peru', awayFlag: '🇵🇪', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'B', date: 'Jun 23, 2026', time: '18:00', venue: 'SoFi Stadium', city: 'Inglewood, CA', status: 'upcoming' },
  // Group C — Mexico host group
  { id: '26-c1', homeTeam: 'Mexico', homeFlag: '🇲🇽', awayTeam: 'Honduras', awayFlag: '🇭🇳', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'C', date: 'Jun 11, 2026', time: '21:00', venue: 'Estadio Azteca', city: 'Mexico City', status: 'upcoming' },
  { id: '26-c2', homeTeam: 'Canada', homeFlag: '🇨🇦', awayTeam: 'New Zealand', awayFlag: '🇳🇿', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'C', date: 'Jun 12, 2026', time: '15:00', venue: 'BC Place', city: 'Vancouver', status: 'upcoming' },
  { id: '26-c3', homeTeam: 'Mexico', homeFlag: '🇲🇽', awayTeam: 'New Zealand', awayFlag: '🇳🇿', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'C', date: 'Jun 16, 2026', time: '21:00', venue: 'Estadio Akron', city: 'Guadalajara', status: 'upcoming' },
  { id: '26-c4', homeTeam: 'Canada', homeFlag: '🇨🇦', awayTeam: 'Honduras', awayFlag: '🇭🇳', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'C', date: 'Jun 17, 2026', time: '15:00', venue: 'BMO Field', city: 'Toronto', status: 'upcoming' },
  { id: '26-c5', homeTeam: 'Mexico', homeFlag: '🇲🇽', awayTeam: 'Canada', awayFlag: '🇨🇦', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'C', date: 'Jun 21, 2026', time: '21:00', venue: 'Estadio Azteca', city: 'Mexico City', status: 'upcoming' },
  { id: '26-c6', homeTeam: 'Honduras', homeFlag: '🇭🇳', awayTeam: 'New Zealand', awayFlag: '🇳🇿', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'C', date: 'Jun 21, 2026', time: '18:00', venue: 'Arrowhead Stadium', city: 'Kansas City, MO', status: 'upcoming' },
  // Group D — France
  { id: '26-d1', homeTeam: 'France', homeFlag: '🇫🇷', awayTeam: 'Poland', awayFlag: '🇵🇱', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'D', date: 'Jun 14, 2026', time: '18:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-d2', homeTeam: 'Israel', homeFlag: '🇮🇱', awayTeam: 'Burundi', awayFlag: '🇧🇮', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'D', date: 'Jun 14, 2026', time: '21:00', venue: 'SoFi Stadium', city: 'Inglewood, CA', status: 'upcoming' },
  { id: '26-d3', homeTeam: 'France', homeFlag: '🇫🇷', awayTeam: 'Israel', awayFlag: '🇮🇱', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'D', date: 'Jun 19, 2026', time: '18:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-d4', homeTeam: 'Poland', homeFlag: '🇵🇱', awayTeam: 'Burundi', awayFlag: '🇧🇮', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'D', date: 'Jun 19, 2026', time: '21:00', venue: 'AT&T Stadium', city: 'Arlington, TX', status: 'upcoming' },
  { id: '26-d5', homeTeam: 'France', homeFlag: '🇫🇷', awayTeam: 'Burundi', awayFlag: '🇧🇮', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'D', date: 'Jun 24, 2026', time: '18:00', venue: 'SoFi Stadium', city: 'Inglewood, CA', status: 'upcoming' },
  { id: '26-d6', homeTeam: 'Poland', homeFlag: '🇵🇱', awayTeam: 'Israel', awayFlag: '🇮🇱', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'D', date: 'Jun 24, 2026', time: '18:00', venue: 'Arrowhead Stadium', city: 'Kansas City, MO', status: 'upcoming' },
  // Group E — Spain / Netherlands
  { id: '26-e1', homeTeam: 'Spain', homeFlag: '🇪🇸', awayTeam: 'Belgium', awayFlag: '🇧🇪', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'E', date: 'Jun 15, 2026', time: '21:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-e2', homeTeam: 'Netherlands', homeFlag: '🇳🇱', awayTeam: 'Croatia', awayFlag: '🇭🇷', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'E', date: 'Jun 15, 2026', time: '18:00', venue: 'SoFi Stadium', city: 'Inglewood, CA', status: 'upcoming' },
  { id: '26-e3', homeTeam: 'Spain', homeFlag: '🇪🇸', awayTeam: 'Netherlands', awayFlag: '🇳🇱', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'E', date: 'Jun 20, 2026', time: '21:00', venue: 'AT&T Stadium', city: 'Arlington, TX', status: 'upcoming' },
  { id: '26-e4', homeTeam: 'Belgium', homeFlag: '🇧🇪', awayTeam: 'Croatia', awayFlag: '🇭🇷', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'E', date: 'Jun 20, 2026', time: '18:00', venue: 'Arrowhead Stadium', city: 'Kansas City, MO', status: 'upcoming' },
  { id: '26-e5', homeTeam: 'Spain', homeFlag: '🇪🇸', awayTeam: 'Croatia', awayFlag: '🇭🇷', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'E', date: 'Jun 25, 2026', time: '21:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-e6', homeTeam: 'Netherlands', homeFlag: '🇳🇱', awayTeam: 'Belgium', awayFlag: '🇧🇪', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'E', date: 'Jun 25, 2026', time: '21:00', venue: 'SoFi Stadium', city: 'Inglewood, CA', status: 'upcoming' },
  // Group F — Brazil
  { id: '26-f1', homeTeam: 'Brazil', homeFlag: '🇧🇷', awayTeam: 'Venezuela', awayFlag: '🇻🇪', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'F', date: 'Jun 14, 2026', time: '15:00', venue: 'AT&T Stadium', city: 'Arlington, TX', status: 'upcoming' },
  { id: '26-f2', homeTeam: 'Ecuador', homeFlag: '🇪🇨', awayTeam: 'Palestine', awayFlag: '🇵🇸', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'F', date: 'Jun 15, 2026', time: '15:00', venue: 'Arrowhead Stadium', city: 'Kansas City, MO', status: 'upcoming' },
  { id: '26-f3', homeTeam: 'Brazil', homeFlag: '🇧🇷', awayTeam: 'Ecuador', awayFlag: '🇪🇨', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'F', date: 'Jun 20, 2026', time: '15:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-f4', homeTeam: 'Venezuela', homeFlag: '🇻🇪', awayTeam: 'Palestine', awayFlag: '🇵🇸', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'F', date: 'Jun 20, 2026', time: '15:00', venue: 'SoFi Stadium', city: 'Inglewood, CA', status: 'upcoming' },
  { id: '26-f5', homeTeam: 'Brazil', homeFlag: '🇧🇷', awayTeam: 'Palestine', awayFlag: '🇵🇸', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'F', date: 'Jun 25, 2026', time: '18:00', venue: 'AT&T Stadium', city: 'Arlington, TX', status: 'upcoming' },
  { id: '26-f6', homeTeam: 'Ecuador', homeFlag: '🇪🇨', awayTeam: 'Venezuela', awayFlag: '🇻🇪', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'F', date: 'Jun 25, 2026', time: '18:00', venue: 'Arrowhead Stadium', city: 'Kansas City, MO', status: 'upcoming' },
  // Group G — Portugal / Germany
  { id: '26-g1', homeTeam: 'Portugal', homeFlag: '🇵🇹', awayTeam: 'Denmark', awayFlag: '🇩🇰', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'G', date: 'Jun 16, 2026', time: '15:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-g2', homeTeam: 'Switzerland', homeFlag: '🇨🇭', awayTeam: 'Serbia', awayFlag: '🇷🇸', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'G', date: 'Jun 16, 2026', time: '18:00', venue: 'AT&T Stadium', city: 'Arlington, TX', status: 'upcoming' },
  { id: '26-g3', homeTeam: 'Portugal', homeFlag: '🇵🇹', awayTeam: 'Switzerland', awayFlag: '🇨🇭', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'G', date: 'Jun 21, 2026', time: '15:00', venue: 'SoFi Stadium', city: 'Inglewood, CA', status: 'upcoming' },
  { id: '26-g4', homeTeam: 'Denmark', homeFlag: '🇩🇰', awayTeam: 'Serbia', awayFlag: '🇷🇸', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'G', date: 'Jun 21, 2026', time: '15:00', venue: 'Arrowhead Stadium', city: 'Kansas City, MO', status: 'upcoming' },
  { id: '26-g5', homeTeam: 'Portugal', homeFlag: '🇵🇹', awayTeam: 'Serbia', awayFlag: '🇷🇸', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'G', date: 'Jun 26, 2026', time: '21:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-g6', homeTeam: 'Switzerland', homeFlag: '🇨🇭', awayTeam: 'Denmark', awayFlag: '🇩🇰', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'G', date: 'Jun 26, 2026', time: '21:00', venue: 'AT&T Stadium', city: 'Arlington, TX', status: 'upcoming' },
  // Group H — Germany / Japan
  { id: '26-h1', homeTeam: 'Germany', homeFlag: '🇩🇪', awayTeam: 'Saudi Arabia', awayFlag: '🇸🇦', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'H', date: 'Jun 16, 2026', time: '21:00', venue: 'Arrowhead Stadium', city: 'Kansas City, MO', status: 'upcoming' },
  { id: '26-h2', homeTeam: 'Japan', homeFlag: '🇯🇵', awayTeam: 'Bahrain', awayFlag: '🇧🇭', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'H', date: 'Jun 17, 2026', time: '18:00', venue: 'SoFi Stadium', city: 'Inglewood, CA', status: 'upcoming' },
  { id: '26-h3', homeTeam: 'Germany', homeFlag: '🇩🇪', awayTeam: 'Japan', awayFlag: '🇯🇵', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'H', date: 'Jun 22, 2026', time: '21:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-h4', homeTeam: 'Saudi Arabia', homeFlag: '🇸🇦', awayTeam: 'Bahrain', awayFlag: '🇧🇭', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'H', date: 'Jun 22, 2026', time: '15:00', venue: 'AT&T Stadium', city: 'Arlington, TX', status: 'upcoming' },
  { id: '26-h5', homeTeam: 'Germany', homeFlag: '🇩🇪', awayTeam: 'Bahrain', awayFlag: '🇧🇭', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'H', date: 'Jun 27, 2026', time: '21:00', venue: 'Arrowhead Stadium', city: 'Kansas City, MO', status: 'upcoming' },
  { id: '26-h6', homeTeam: 'Japan', homeFlag: '🇯🇵', awayTeam: 'Saudi Arabia', awayFlag: '🇸🇦', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'H', date: 'Jun 27, 2026', time: '21:00', venue: 'SoFi Stadium', city: 'Inglewood, CA', status: 'upcoming' },
  // Group I — England
  { id: '26-i1', homeTeam: 'England', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayTeam: 'Senegal', awayFlag: '🇸🇳', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'I', date: 'Jun 16, 2026', time: '21:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-i2', homeTeam: 'Slovenia', homeFlag: '🇸🇮', awayTeam: 'South Africa', awayFlag: '🇿🇦', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'I', date: 'Jun 17, 2026', time: '15:00', venue: 'AT&T Stadium', city: 'Arlington, TX', status: 'upcoming' },
  { id: '26-i3', homeTeam: 'England', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayTeam: 'Slovenia', awayFlag: '🇸🇮', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'I', date: 'Jun 22, 2026', time: '15:00', venue: 'SoFi Stadium', city: 'Inglewood, CA', status: 'upcoming' },
  { id: '26-i4', homeTeam: 'Senegal', homeFlag: '🇸🇳', awayTeam: 'South Africa', awayFlag: '🇿🇦', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'I', date: 'Jun 22, 2026', time: '21:00', venue: 'Arrowhead Stadium', city: 'Kansas City, MO', status: 'upcoming' },
  { id: '26-i5', homeTeam: 'England', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayTeam: 'South Africa', awayFlag: '🇿🇦', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'I', date: 'Jun 27, 2026', time: '18:00', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', status: 'upcoming' },
  { id: '26-i6', homeTeam: 'Senegal', homeFlag: '🇸🇳', awayTeam: 'Slovenia', awayFlag: '🇸🇮', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'I', date: 'Jun 27, 2026', time: '18:00', venue: 'BC Place', city: 'Vancouver', status: 'upcoming' },
  // Groups J-L abbreviated (6 more each) — just show first match per group for brevity
  { id: '26-j1', homeTeam: 'Uruguay', homeFlag: '🇺🇾', awayTeam: 'Czech Republic', awayFlag: '🇨🇿', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'J', date: 'Jun 12, 2026', time: '15:00', venue: 'Arrowhead Stadium', city: 'Kansas City, MO', status: 'upcoming' },
  { id: '26-j2', homeTeam: 'Thailand', homeFlag: '🇹🇭', awayTeam: 'Iraq', awayFlag: '🇮🇶', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'J', date: 'Jun 12, 2026', time: '18:00', venue: 'BMO Field', city: 'Toronto', status: 'upcoming' },
  { id: '26-k1', homeTeam: 'Colombia', homeFlag: '🇨🇴', awayTeam: 'Morocco', awayFlag: '🇲🇦', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'K', date: 'Jun 13, 2026', time: '21:00', venue: 'Arrowhead Stadium', city: 'Kansas City, MO', status: 'upcoming' },
  { id: '26-k2', homeTeam: 'Cameroon', homeFlag: '🇨🇲', awayTeam: 'Nigeria', awayFlag: '🇳🇬', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'K', date: 'Jun 13, 2026', time: '15:00', venue: 'BMO Field', city: 'Toronto', status: 'upcoming' },
  { id: '26-l1', homeTeam: 'South Korea', homeFlag: '🇰🇷', awayTeam: 'Iran', awayFlag: '🇮🇷', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'L', date: 'Jun 13, 2026', time: '18:00', venue: 'BC Place', city: 'Vancouver', status: 'upcoming' },
  { id: '26-l2', homeTeam: 'Oman', homeFlag: '🇴🇲', awayTeam: 'Côte d\'Ivoire', awayFlag: '🇨🇮', homeScore: null, awayScore: null, stage: 'Group Stage', group: 'L', date: 'Jun 12, 2026', time: '21:00', venue: 'Estadio Akron', city: 'Guadalajara', status: 'upcoming' },
]

// ─── MOCK FAN POSTS (seeded — shown to everyone) ──────────────────────────────
export interface MockPost {
  id: string
  username: string
  avatar: string
  content: string
  likes: number
  comments: number
  time: string
  isOfficial: boolean
  matchId?: string
  mediaUrl?: string
}

export const MOCK_POSTS: MockPost[] = [
  {
    id: 'post-1', username: 'SambaKing_Vini', avatar: '🇧🇷',
    content: 'That Argentina vs Saudi Arabia shock in 2022 still lives rent-free in my head. Greatest upset in World Cup history? 🐪',
    likes: 4821, comments: 312, time: '2h ago', isOfficial: false,
  },
  {
    id: 'post-2', username: 'WCL_Official', avatar: '⚽',
    content: '🏆 2026 World Cup Draw is complete! 48 teams, 3 nations, 104 matches. Who is your pick to lift the trophy at MetLife Stadium?',
    likes: 18400, comments: 2140, time: '1d ago', isOfficial: true,
  },
  {
    id: 'post-3', username: 'MoroccoMagic', avatar: '🇲🇦',
    content: 'People forget Morocco beat Belgium, Spain, AND Portugal in 2022. First African team in a World Cup semi. HISTORY. 🔥',
    likes: 9230, comments: 890, time: '3h ago', isOfficial: false,
  },
  {
    id: 'post-4', username: 'MbappeWatcher', avatar: '🇫🇷',
    content: 'France vs Argentina final 2022 will never be topped. A hat-trick in a World Cup final... and still lost on penalties. Cinema.',
    likes: 12800, comments: 1450, time: '5h ago', isOfficial: false,
  },
  {
    id: 'post-5', username: 'AztecaVoice', avatar: '🇲🇽',
    content: 'Three World Cups at the Azteca (1970, 1986, 2026). Mexico 🤝 Football history. Can\'t wait for the opening matches!',
    likes: 6710, comments: 540, time: '6h ago', isOfficial: false,
  },
  {
    id: 'post-6', username: 'ThreeLionsFan', avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    content: 'Group I is TOUGH. England vs Senegal, Slovenia & South Africa. But we are coming home. It\'s coming home. FOR REAL this time. 2026 is ours.',
    likes: 3340, comments: 780, time: '8h ago', isOfficial: false,
  },
  {
    id: 'post-7', username: 'SoFiStadiumFan', avatar: '🇺🇸',
    content: 'Just got my tickets for USA vs Panama at SoFi! The most expensive stadium ever built is about to host a World Cup game. 🏟️',
    likes: 2100, comments: 220, time: '12h ago', isOfficial: false,
  },
  {
    id: 'post-8', username: 'WCL_Official', avatar: '⚽',
    content: '📊 Fun stat: The 2022 World Cup produced 172 goals in 64 matches — the highest average (2.69) since France 98. Will 2026 beat it with 104 matches?',
    likes: 8900, comments: 340, time: '1d ago', isOfficial: true,
  },
  {
    id: 'post-9', username: 'CroatiaStrong', avatar: '🇭🇷',
    content: 'Group E with Spain, Netherlands, Belgium AND Croatia? Genuinely one of the hardest groups in World Cup history. Only 2 go through from this. 💀',
    likes: 7200, comments: 920, time: '2d ago', isOfficial: false,
  },
  {
    id: 'post-10', username: 'LusailMemories', avatar: '🏟️',
    content: 'The Lusail Stadium in Qatar held 89,000 for the final. MetLife holds 82,500. Both iconic nights. 2026 Final is going to be ELECTRIC.',
    likes: 5500, comments: 430, time: '2d ago', isOfficial: false,
  },
]

// ─── BRACKET 2022 ─────────────────────────────────────────────────────────────
export interface BracketTeamData {
  flag: string
  name: string
  score: number | null
  winner?: boolean
  pso?: number // penalty shootout score if applicable
}

export interface BracketMatchData {
  home: BracketTeamData
  away: BracketTeamData
  venue?: string
  note?: string
}

export const BRACKET_2022 = {
  r16: [
    { home: { flag: '🇳🇱', name: 'Netherlands', score: 3, winner: true }, away: { flag: '🇺🇸', name: 'USA', score: 1 }, venue: 'Khalifa International' },
    { home: { flag: '🇦🇷', name: 'Argentina',   score: 2, winner: true }, away: { flag: '🇦🇺', name: 'Australia', score: 1 }, venue: 'Ahmad bin Ali' },
    { home: { flag: '🇫🇷', name: 'France',       score: 3, winner: true }, away: { flag: '🇵🇱', name: 'Poland',  score: 1 }, venue: 'Al Thumama' },
    { home: { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England',     score: 3, winner: true }, away: { flag: '🇸🇳', name: 'Senegal', score: 0 }, venue: 'Al Bayt' },
    { home: { flag: '🇯🇵', name: 'Japan',        score: 1, winner: false, pso: 1 }, away: { flag: '🇭🇷', name: 'Croatia', score: 1, winner: true, pso: 3 }, venue: 'Al Janoub' },
    { home: { flag: '🇧🇷', name: 'Brazil',       score: 4, winner: true }, away: { flag: '🇰🇷', name: 'South Korea', score: 1 }, venue: 'Stadium 974' },
    { home: { flag: '🇲🇦', name: 'Morocco',      score: 0, winner: true, pso: 3 }, away: { flag: '🇪🇸', name: 'Spain', score: 0, pso: 0 }, venue: 'Education City' },
    { home: { flag: '🇵🇹', name: 'Portugal',     score: 6, winner: true }, away: { flag: '🇨🇭', name: 'Switzerland', score: 1 }, venue: 'Lusail' },
  ] as BracketMatchData[],
  qf: [
    { home: { flag: '🇭🇷', name: 'Croatia',  score: 1, winner: true, pso: 4 }, away: { flag: '🇧🇷', name: 'Brazil', score: 1, pso: 2 }, venue: 'Education City', note: 'AET · Pens' },
    { home: { flag: '🇳🇱', name: 'Netherlands', score: 2, winner: false, pso: 3 }, away: { flag: '🇦🇷', name: 'Argentina', score: 2, winner: true, pso: 4 }, venue: 'Lusail', note: 'AET · Pens' },
    { home: { flag: '🇲🇦', name: 'Morocco',  score: 1, winner: true }, away: { flag: '🇵🇹', name: 'Portugal', score: 0 }, venue: 'Al Thumama' },
    { home: { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England',  score: 1, winner: false }, away: { flag: '🇫🇷', name: 'France', score: 2, winner: true }, venue: 'Al Bayt' },
  ] as BracketMatchData[],
  sf: [
    { home: { flag: '🇦🇷', name: 'Argentina', score: 3, winner: true }, away: { flag: '🇭🇷', name: 'Croatia', score: 0 }, venue: 'Lusail' },
    { home: { flag: '🇫🇷', name: 'France',     score: 2, winner: true }, away: { flag: '🇲🇦', name: 'Morocco', score: 0 }, venue: 'Al Bayt' },
  ] as BracketMatchData[],
  third: { home: { flag: '🇭🇷', name: 'Croatia', score: 2, winner: true }, away: { flag: '🇲🇦', name: 'Morocco', score: 1 }, venue: 'Khalifa' } as BracketMatchData,
  final: {
    home: { flag: '🇦🇷', name: 'Argentina', score: 3, winner: true, pso: 4 },
    away: { flag: '🇫🇷', name: 'France',    score: 3, pso: 2 },
    venue: 'Lusail Stadium', note: 'AET · Pens',
  } as BracketMatchData,
}

// ─── ORACLE / AI PREDICTIONS FOR UPCOMING 2026 MATCHES ────────────────────────
export const ORACLE_PREDICTIONS_2026: Record<string, { homeWin: number; draw: number; awayWin: number; predictedHome: number; predictedAway: number; confidence: number }> = {
  '26-a1': { homeWin: 68, draw: 19, awayWin: 13, predictedHome: 2, predictedAway: 0, confidence: 71 },
  '26-b1': { homeWin: 74, draw: 16, awayWin: 10, predictedHome: 3, predictedAway: 0, confidence: 78 },
  '26-c1': { homeWin: 62, draw: 22, awayWin: 16, predictedHome: 2, predictedAway: 1, confidence: 64 },
  '26-d1': { homeWin: 71, draw: 18, awayWin: 11, predictedHome: 3, predictedAway: 1, confidence: 75 },
  '26-e1': { homeWin: 45, draw: 28, awayWin: 27, predictedHome: 1, predictedAway: 1, confidence: 52 },
  '26-e2': { homeWin: 52, draw: 25, awayWin: 23, predictedHome: 2, predictedAway: 1, confidence: 58 },
  '26-f1': { homeWin: 77, draw: 14, awayWin: 9,  predictedHome: 3, predictedAway: 0, confidence: 82 },
  '26-g1': { homeWin: 58, draw: 24, awayWin: 18, predictedHome: 2, predictedAway: 1, confidence: 63 },
  '26-h1': { homeWin: 69, draw: 20, awayWin: 11, predictedHome: 2, predictedAway: 0, confidence: 72 },
  '26-i1': { homeWin: 65, draw: 22, awayWin: 13, predictedHome: 2, predictedAway: 0, confidence: 68 },
}