// src/assets/stadiums/index.ts
// Vite statically imports each image at build time — fingerprinted & bundled.
// Filenames match exactly what lives in src/assets/stadiums/.

import attImg          from './att.webp'
import sofiImg         from './sofi.avif'
import metlifeImg      from './metlife.webp'
import lumenImg        from './lumen.webp'
import arrowheadImg    from './arrowhead.webp'
import hardRockImg     from './hard-rock.webp'
import nrgImg          from './nrg.webp'
import lincolnImg      from './lincoln.webp'
import gilletteImg     from './gillette.avif'
import levisImg        from './levis.webp'
import mercedesBenzImg from './mercedes-benz.webp'
// Canada
import bcPlaceImg      from './bc-place.webp'
import bmoImg          from './bmo.webp'
// Mexico
import aztecaImg       from './azteca.avif'
import akronImg        from './akron.webp'
import bbvaImg         from './bbva.avif'

/**
 * Maps DB slug → local bundled asset URL.
 *
 * The keys must match the `slug` column in your `stadiums` table exactly.
 * If a slug doesn't appear here, `getLocalHeroUrl` returns null and the
 * component falls back to whatever `hero_image_url` the DB provides.
 */
export const STADIUM_HERO_MAP: Record<string, string> = {
  // ── USA ────────────────────────────────────────────────────────────────────
  'att-stadium':             attImg,          // AT&T Stadium, Arlington TX
  'sofi-stadium':            sofiImg,         // SoFi Stadium, Inglewood CA
  'metlife-stadium':         metlifeImg,      // MetLife Stadium, East Rutherford NJ
  'lumen-field':             lumenImg,        // Lumen Field, Seattle WA
  'arrowhead-stadium':       arrowheadImg,    // Arrowhead Stadium, Kansas City MO
  'hard-rock-stadium':       hardRockImg,     // Hard Rock Stadium, Miami FL
  'nrg-stadium':             nrgImg,          // NRG Stadium, Houston TX
  'lincoln-financial-field': lincolnImg,      // Lincoln Financial Field, Philadelphia PA
  'gillette-stadium':        gilletteImg,     // Gillette Stadium, Foxborough MA
  'levis-stadium':           levisImg,        // Levi's Stadium, Santa Clara CA
  'mercedes-benz-stadium':   mercedesBenzImg, // Mercedes-Benz Stadium, Atlanta GA
  // ── Canada ─────────────────────────────────────────────────────────────────
  'bc-place':                bcPlaceImg,      // BC Place, Vancouver
  'bmo-field':               bmoImg,          // BMO Field, Toronto
  // ── Mexico ─────────────────────────────────────────────────────────────────
  'estadio-azteca':          aztecaImg,       // Estadio Azteca, Mexico City
  'estadio-akron':           akronImg,        // Estadio Akron, Guadalajara
  'estadio-bbva':            bbvaImg,         // Estadio BBVA, Monterrey
}

/**
 * Returns the locally-bundled hero image URL for a given stadium slug,
 * or `null` if no local asset is registered for that slug.
 */
export function getLocalHeroUrl(slug: string): string | null {
  return STADIUM_HERO_MAP[slug] ?? null
}