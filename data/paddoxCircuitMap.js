/* ============================================================
   PADDOX — Verified Circuit SVG Map
   Phase H3.3A.2: Strict official-calendar circuit mapping

   Purpose:
   - Do NOT fuzzy-match to random/wrong tracks.
   - Use only verified Formula 1 calendar circuit -> repo filename mapping.
   - If SVG is missing, show a premium placeholder instead of a wrong circuit.

   Expected SVG source:
   julesr0y/f1-circuits-svg copied into one of these structures:
   1) frontend/assets/circuits/circuits/minimal/white-outline/<file>.svg
   2) frontend/assets/circuits/minimal/white-outline/<file>.svg
   3) frontend/assets/circuits/<file>.svg
   ============================================================ */
(function () {
  'use strict';

  const STYLE_PATHS = [
    'circuits/minimal/white-outline',
    'minimal/white-outline',
    'circuits/minimal/white',
    'minimal/white',
    'circuits/detailed/white-outline',
    'detailed/white-outline',
    ''
  ];

  const VERIFIED = [
    {
      id: 'melbourne', file: 'melbourne-2.svg', label: 'Albert Park Circuit', location: 'Melbourne', country: 'Australia', official: 'Australian Grand Prix',
      match: ['australian grand prix','australia','albert park','melbourne grand prix circuit','melbourne']
    },
    {
      id: 'shanghai', file: 'shanghai-1.svg', label: 'Shanghai International Circuit', location: 'Shanghai', country: 'China', official: 'Chinese Grand Prix',
      match: ['chinese grand prix','china','shanghai international circuit','shanghai']
    },
    {
      id: 'suzuka', file: 'suzuka-1.svg', label: 'Suzuka Circuit', location: 'Suzuka', country: 'Japan', official: 'Japanese Grand Prix',
      match: ['japanese grand prix','japan','suzuka circuit','suzuka']
    },
    {
      id: 'miami', file: 'miami-1.svg', label: 'Miami International Autodrome', location: 'Miami', country: 'United States', official: 'Miami Grand Prix',
      match: ['miami grand prix','miami international autodrome','miami gardens','miami']
    },
    {
      id: 'montreal', file: 'montreal-6.svg', label: 'Circuit Gilles Villeneuve', location: 'Montreal', country: 'Canada', official: 'Canadian Grand Prix',
      match: ['canadian grand prix','grand prix du canada','canada','circuit gilles villeneuve','gilles villeneuve','montreal','montréal']
    },
    {
      id: 'monaco', file: 'monaco-6.svg', label: 'Circuit de Monaco', location: 'Monte Carlo', country: 'Monaco', official: 'Monaco Grand Prix',
      match: ['monaco grand prix','grand prix de monaco','monaco','circuit de monaco','monte carlo']
    },
    {
      id: 'catalunya', file: 'catalunya-6.svg', label: 'Circuit de Barcelona-Catalunya', location: 'Barcelona', country: 'Spain', official: 'Barcelona-Catalunya Grand Prix',
      match: ['barcelona-catalunya','barcelona catalunya','circuit de barcelona-catalunya','catalunya','catalonia','barcelona grand prix']
    },
    {
      id: 'spielberg', file: 'spielberg-1.svg', label: 'Red Bull Ring', location: 'Spielberg', country: 'Austria', official: 'Austrian Grand Prix',
      match: ['austrian grand prix','austria','red bull ring','spielberg']
    },
    {
      id: 'silverstone', file: 'silverstone-5.svg', label: 'Silverstone Circuit', location: 'Silverstone', country: 'Great Britain', official: 'British Grand Prix',
      match: ['british grand prix','great britain','united kingdom','silverstone circuit','silverstone']
    },
    {
      id: 'spa-francorchamps', file: 'spa-francorchamps-1.svg', label: 'Circuit de Spa-Francorchamps', location: 'Spa-Francorchamps', country: 'Belgium', official: 'Belgian Grand Prix',
      match: ['belgian grand prix','belgium','spa-francorchamps','spa francorchamps','spa']
    },
    {
      id: 'hungaroring', file: 'hungaroring-3.svg', label: 'Hungaroring', location: 'Budapest', country: 'Hungary', official: 'Hungarian Grand Prix',
      match: ['hungarian grand prix','hungary','hungaroring','budapest']
    },
    {
      id: 'zandvoort', file: 'zandvoort-1.svg', label: 'Circuit Zandvoort', location: 'Zandvoort', country: 'Netherlands', official: 'Dutch Grand Prix',
      match: ['dutch grand prix','netherlands','zandvoort','circuit zandvoort']
    },
    {
      id: 'monza', file: 'monza-4.svg', label: 'Autodromo Nazionale Monza', location: 'Monza', country: 'Italy', official: 'Italian Grand Prix',
      match: ['italian grand prix','italy','monza','autodromo nazionale monza']
    },
    {
      id: 'madring', file: 'madring-1.svg', label: 'Madring', location: 'Madrid', country: 'Spain', official: 'Spanish Grand Prix / Madrid',
      match: ['spanish grand prix','gran premio de espana','gran premio de españa','madrid','madring','ifema']
    },
    {
      id: 'baku', file: 'baku-1.svg', label: 'Baku City Circuit', location: 'Baku', country: 'Azerbaijan', official: 'Azerbaijan Grand Prix',
      match: ['azerbaijan grand prix','azerbaijan','baku city circuit','baku']
    },
    {
      id: 'marina-bay', file: 'marina-bay-4.svg', label: 'Marina Bay Street Circuit', location: 'Singapore', country: 'Singapore', official: 'Singapore Grand Prix',
      match: ['singapore grand prix','singapore','marina bay street circuit','marina bay']
    },
    {
      id: 'austin', file: 'austin-1.svg', label: 'Circuit of the Americas', location: 'Austin', country: 'United States', official: 'United States Grand Prix',
      match: ['united states grand prix','usa grand prix','us grand prix','circuit of the americas','cota','austin']
    },
    {
      id: 'mexico-city', file: 'mexico-city-3.svg', label: 'Autódromo Hermanos Rodríguez', location: 'Mexico City', country: 'Mexico', official: 'Mexico City Grand Prix',
      match: ['mexico city grand prix','mexican grand prix','mexico','autodromo hermanos rodriguez','autódromo hermanos rodríguez','hermanos rodriguez','mexico city']
    },
    {
      id: 'interlagos', file: 'interlagos-2.svg', label: 'Autódromo José Carlos Pace', location: 'São Paulo', country: 'Brazil', official: 'São Paulo Grand Prix',
      match: ['brazilian grand prix','sao paulo grand prix','são paulo grand prix','brazil','interlagos','jose carlos pace','josé carlos pace','sao paulo','são paulo']
    },
    {
      id: 'las-vegas', file: 'las-vegas-1.svg', label: 'Las Vegas Street Circuit', location: 'Las Vegas', country: 'United States', official: 'Las Vegas Grand Prix',
      match: ['las vegas grand prix','las vegas street circuit','las vegas','vegas']
    },
    {
      id: 'lusail', file: 'lusail-1.svg', label: 'Lusail International Circuit', location: 'Lusail', country: 'Qatar', official: 'Qatar Grand Prix',
      match: ['qatar grand prix','qatar','lusail international circuit','losail international circuit','lusail','losail']
    },
    {
      id: 'yas-marina', file: 'yas-marina-1.svg', label: 'Yas Marina Circuit', location: 'Abu Dhabi', country: 'United Arab Emirates', official: 'Abu Dhabi Grand Prix',
      match: ['abu dhabi grand prix','abu dhabi','yas marina circuit','yas marina','united arab emirates','uae']
    },

    /* Legacy/extra rounds only shown if backend still returns them. */
    {
      id: 'bahrain', file: 'bahrain-3.svg', label: 'Bahrain International Circuit', location: 'Sakhir', country: 'Bahrain', official: 'Bahrain Grand Prix',
      match: ['bahrain grand prix','bahrain','sakhir','bahrain international circuit']
    },
    {
      id: 'jeddah', file: 'jeddah-1.svg', label: 'Jeddah Corniche Circuit', location: 'Jeddah', country: 'Saudi Arabia', official: 'Saudi Arabian Grand Prix',
      match: ['saudi arabian grand prix','saudi arabia','jeddah corniche circuit','jeddah']
    }
  ];

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/formula 1|f1|qatar airways|aramco|crypto.com|lenovo|louis vuitton|msc cruises|pirelli|moet & chandon|moet|aws|heineken|tag heuer|singapore airlines|etihad airways/gi, ' ')
      .replace(/grand prix|gran premio|grande premio|prix|circuit|autodromo|autodrome|international|street|city|the/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function raceText(race = {}) {
    return [
      race.name, race.raceName, race.officialName, race.circuit, race.circuitName,
      race.location, race.locality, race.country,
      race.Circuit && (race.Circuit.circuitName || race.Circuit.circuitId),
      race.Circuit && race.Circuit.Location && (race.Circuit.Location.locality || race.Circuit.Location.country)
    ].filter(Boolean).join(' ');
  }

  function matchCircuit(race = {}) {
    const raw = raceText(race);
    const hay = normalize(raw);
    if (!hay) return null;

    for (const circuit of VERIFIED) {
      const keys = [circuit.id, circuit.label, circuit.location, circuit.country, circuit.official, ...(circuit.match || [])];
      for (const key of keys) {
        const nk = normalize(key);
        if (!nk) continue;
        if (hay === nk || hay.includes(nk) || nk.includes(hay)) return circuit;
      }
    }
    return null;
  }

  function circuitPaths(circuit) {
    if (!circuit || !circuit.file) return [];
    return STYLE_PATHS.map(folder => folder ? `assets/circuits/${folder}/${circuit.file}` : `assets/circuits/${circuit.file}`);
  }

  window.PADDOX_CIRCUIT_MAP = {
    verified: VERIFIED,
    normalize,
    getCircuit: matchCircuit,
    candidatePaths: circuitPaths
  };
}());
