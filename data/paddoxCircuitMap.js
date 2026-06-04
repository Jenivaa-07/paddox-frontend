/* ============================================================
   PADDOX — Formula Timer Direct Circuit Image Map
   Phase H3.3A.11
   Purpose: Fan Hub Race Calendar direct image loader.
   ============================================================ */
(function () {
  'use strict';

  const FT_BASE = 'https://formula-timer.com';

  const CIRCUITS = [
    {
      id: 'melbourne',
      match: ['australian', 'australia', 'melbourne', 'albert park'],
      label: 'Albert Park Grand Prix Circuit',
      country: 'Australia',
      location: 'Melbourne',
      timerSlugs: ['melbourne', 'albert-park', 'albert_park']
    },
    {
      id: 'shanghai',
      match: ['chinese', 'china', 'shanghai'],
      label: 'Shanghai International Circuit',
      country: 'China',
      location: 'Shanghai',
      timerSlugs: ['shanghai']
    },
    {
      id: 'suzuka',
      match: ['japanese', 'japan', 'suzuka'],
      label: 'Suzuka Circuit',
      country: 'Japan',
      location: 'Suzuka',
      timerSlugs: ['suzuka']
    },
    {
      id: 'miami',
      match: ['miami'],
      label: 'Miami International Autodrome',
      country: 'USA',
      location: 'Miami',
      timerSlugs: ['miami']
    },
    {
      id: 'villeneuve',
      match: ['canadian', 'canada', 'montreal', 'gilles villeneuve', 'circuit gilles villeneuve'],
      label: 'Circuit Gilles Villeneuve',
      country: 'Canada',
      location: 'Montreal',
      timerSlugs: ['villeneuve', 'montreal', 'gilles-villeneuve', 'gilles_villeneuve']
    },
    {
      id: 'monaco',
      match: ['monaco', 'monte carlo', 'monte-carlo', 'circuit de monaco'],
      label: 'Circuit de Monaco',
      country: 'Monaco',
      location: 'Monte Carlo',
      timerSlugs: ['monaco']
    },
    {
      id: 'catalunya',
      match: ['barcelona', 'catalunya', 'catalonia', 'montmelo', 'montmeló', 'spanish grand prix'],
      label: 'Circuit de Barcelona-Catalunya',
      country: 'Spain',
      location: 'Barcelona',
      timerSlugs: ['catalunya', 'barcelona', 'barcelona-catalunya', 'barcelona_catalunya']
    },
    {
      id: 'red_bull_ring',
      match: ['austrian', 'austria', 'spielberg', 'red bull ring', 'red-bull-ring'],
      label: 'Red Bull Ring',
      country: 'Austria',
      location: 'Spielberg',
      timerSlugs: ['red_bull_ring', 'red-bull-ring', 'spielberg', 'austria']
    },
    {
      id: 'silverstone',
      match: ['british', 'great britain', 'united kingdom', 'silverstone'],
      label: 'Silverstone Circuit',
      country: 'Great Britain',
      location: 'Silverstone',
      timerSlugs: ['silverstone']
    },
    {
      id: 'spa',
      match: ['belgian', 'belgium', 'spa', 'spa-francorchamps', 'francorchamps'],
      label: 'Circuit de Spa-Francorchamps',
      country: 'Belgium',
      location: 'Spa',
      timerSlugs: ['spa', 'spa-francorchamps', 'spa_francorchamps']
    },
    {
      id: 'hungaroring',
      match: ['hungarian', 'hungary', 'budapest', 'hungaroring'],
      label: 'Hungaroring',
      country: 'Hungary',
      location: 'Budapest',
      timerSlugs: ['hungaroring', 'hungary']
    },
    {
      id: 'zandvoort',
      match: ['dutch', 'netherlands', 'zandvoort'],
      label: 'Circuit Zandvoort',
      country: 'Netherlands',
      location: 'Zandvoort',
      timerSlugs: ['zandvoort']
    },
    {
      id: 'monza',
      match: ['italian', 'italy', 'monza', 'autodromo nazionale monza'],
      label: 'Autodromo Nazionale Monza',
      country: 'Italy',
      location: 'Monza',
      timerSlugs: ['monza']
    },
    {
      id: 'madrid',
      match: ['madrid', 'madring', 'spanish grand prix madrid'],
      label: 'Madring',
      country: 'Spain',
      location: 'Madrid',
      timerSlugs: ['madrid', 'madring']
    },
    {
      id: 'baku',
      match: ['azerbaijan', 'baku'],
      label: 'Baku City Circuit',
      country: 'Azerbaijan',
      location: 'Baku',
      timerSlugs: ['baku']
    },
    {
      id: 'marina_bay',
      match: ['singapore', 'marina bay', 'marina-bay'],
      label: 'Marina Bay Street Circuit',
      country: 'Singapore',
      location: 'Singapore',
      timerSlugs: ['marina_bay', 'marina-bay', 'singapore']
    },
    {
      id: 'americas',
      match: ['united states', 'austin', 'cota', 'circuit of the americas', 'americas'],
      label: 'Circuit of the Americas',
      country: 'USA',
      location: 'Austin',
      timerSlugs: ['americas', 'austin', 'cota', 'circuit-of-the-americas']
    },
    {
      id: 'rodriguez',
      match: ['mexico', 'mexico city', 'hermanos rodriguez', 'hermanos-rodriguez', 'rodríguez', 'autódromo hermanos rodríguez'],
      label: 'Autódromo Hermanos Rodríguez',
      country: 'Mexico',
      location: 'Mexico City',
      timerSlugs: ['rodriguez', 'mexico-city', 'hermanos-rodriguez', 'hermanos_rodriguez']
    },
    {
      id: 'interlagos',
      match: ['brazil', 'brazilian', 'sao paulo', 'são paulo', 'interlagos', 'jose carlos pace', 'josé carlos pace'],
      label: 'Autódromo José Carlos Pace',
      country: 'Brazil',
      location: 'São Paulo',
      timerSlugs: ['interlagos', 'sao-paulo', 'sao_paulo', 'brazil']
    },
    {
      id: 'vegas',
      match: ['las vegas', 'vegas'],
      label: 'Las Vegas Strip Street Circuit',
      country: 'USA',
      location: 'Las Vegas',
      timerSlugs: ['vegas', 'las-vegas', 'las_vegas']
    },
    {
      id: 'losail',
      match: ['qatar', 'losail', 'lusail', 'al daayen'],
      label: 'Losail International Circuit',
      country: 'Qatar',
      location: 'Lusail',
      timerSlugs: ['losail', 'lusail', 'qatar']
    },
    {
      id: 'yas_marina',
      match: ['abu dhabi', 'yas marina', 'yas-marina', 'uae', 'united arab emirates'],
      label: 'Yas Marina Circuit',
      country: 'UAE',
      location: 'Abu Dhabi',
      timerSlugs: ['yas_marina', 'yas-marina', 'abu-dhabi', 'abu_dhabi']
    }
  ];

  function normalize(value = '') {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/grand prix|gp|circuit|autodromo|autodrome|international|street|city/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function raceText(race = {}) {
    return [
      race.name, race.raceName, race.circuit, race.location, race.country, race.locality
    ].map(normalize).filter(Boolean).join(' ');
  }

  function getCircuit(race = {}) {
    const text = raceText(race);
    const found = CIRCUITS.find(item => item.match.some(key => {
      const n = normalize(key);
      return n && (text.includes(n) || n.includes(text));
    }));

    if (!found) return null;

    return {
      id: found.id,
      file: `${found.timerSlugs[0]}.png`,
      label: found.label,
      country: found.country,
      location: found.location,
      timerSlugs: found.timerSlugs,
      verified: true,
      source: 'formula-timer'
    };
  }

  function formulaTimerImageUrl(slug, width = 3840) {
    return `${FT_BASE}/_next/image?url=%2Fcircuits%2F${encodeURIComponent(slug)}.png&w=${width}&q=75`;
  }

  function candidatePaths(circuit = {}) {
    if (!circuit?.timerSlugs?.length) return [];

    const urls = [];
    circuit.timerSlugs.forEach(slug => {
      [3840, 1920, 1200, 828].forEach(width => urls.push(formulaTimerImageUrl(slug, width)));
      urls.push(`${FT_BASE}/circuits/${slug}.png`);
    });

    return [...new Set(urls)];
  }

  window.PADDOX_CIRCUIT_MAP = {
    sourceMode: 'formula-timer-direct',
    getCircuit,
    candidatePaths,
    formulaTimerImageUrl
  };
})();
