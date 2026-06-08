// Maps FIFA 3-letter codes → ISO codes used by country-flag-icons.
// Fallback when teams.flag_url is missing.

const FIFA_TO_ISO: Record<string, string> = {
  ALG: 'DZ', ARG: 'AR', AUS: 'AU', AUT: 'AT', BEL: 'BE', BIH: 'BA',
  BRA: 'BR', CAN: 'CA', CIV: 'CI', CMR: 'CM', COD: 'CD', COL: 'CO',
  CPV: 'CV', CRC: 'CR', CRO: 'HR', CUW: 'CW', CZE: 'CZ', DEN: 'DK',
  ECU: 'EC', EGY: 'EG', ENG: 'GB', ESP: 'ES', EST: 'EE', FIN: 'FI',
  FRA: 'FR', GAB: 'GA', GBR: 'GB', GEO: 'GE', GER: 'DE', GHA: 'GH',
  GRE: 'GR', HAI: 'HT', HON: 'HN', HUN: 'HU', IRN: 'IR', IRQ: 'IQ',
  ISL: 'IS', ISR: 'IL', ITA: 'IT', JAM: 'JM', JOR: 'JO', JPN: 'JP',
  KOR: 'KR', KSA: 'SA', MAR: 'MA', MEX: 'MX', NED: 'NL', NGA: 'NG',
  NOR: 'NO', NZL: 'NZ', PAN: 'PA', PAR: 'PY', PER: 'PE', POL: 'PL',
  POR: 'PT', QAT: 'QA', ROU: 'RO', RSA: 'ZA', RUS: 'RU', SCO: 'GB',
  SEN: 'SN', SRB: 'RS', SUI: 'CH', SVK: 'SK', SVN: 'SI', SWE: 'SE',
  TUN: 'TN', TUR: 'TR', UAE: 'AE', URU: 'UY', USA: 'US', UZB: 'UZ',
  VEN: 'VE', WAL: 'GB', ZAM: 'ZM',
  // Common football-data.org aliases
  SAU: 'SA',
}

export function fifaToIso(code: string | null | undefined): string | null {
  if (!code) return null
  const upper = code.toUpperCase()
  if (upper.length === 2) return upper
  return FIFA_TO_ISO[upper] ?? null
}
