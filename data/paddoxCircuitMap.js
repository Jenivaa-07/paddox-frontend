/* ============================================================
   PADDOX — Shared Circuit SVG Map
   Phase H3.3A: Fan Hub Race Calendar Circuit SVG Foundation
   Put SVG files from julesr0y/f1-circuits-svg inside:
   frontend/assets/circuits/
   Preferred folders supported:
   assets/circuits/minimal/white-outline/*.svg
   assets/circuits/minimal/white/*.svg
   assets/circuits/detailed/white-outline/*.svg
   assets/circuits/detailed/white/*.svg
   Also supports flat files like assets/circuits/monaco.svg.
   ============================================================ */
(function () {
  'use strict';

  const CIRCUITS = [
    { id:'bahrain',     aliases:['bahrain','sakhir','bahrain international circuit'], label:'Bahrain International Circuit', country:'Bahrain' },
    { id:'jeddah',      aliases:['saudi','jeddah','jeddah corniche','saudi arabia'], label:'Jeddah Corniche Circuit', country:'Saudi Arabia' },
    { id:'melbourne',   aliases:['australia','melbourne','albert park','australian'], label:'Melbourne Grand Prix Circuit', country:'Australia' },
    { id:'suzuka',      aliases:['japan','suzuka','japanese'], label:'Suzuka Circuit', country:'Japan' },
    { id:'shanghai',    aliases:['china','shanghai','chinese'], label:'Shanghai International Circuit', country:'China' },
    { id:'miami',       aliases:['miami','miami gardens'], label:'Miami International Autodrome', country:'United States' },
    { id:'imola',       aliases:['imola','emilia romagna','enzo e dino ferrari'], label:'Autodromo Internazionale Enzo e Dino Ferrari', country:'Italy' },
    { id:'monaco',      aliases:['monaco','monte carlo','circuit de monaco'], label:'Circuit de Monaco', country:'Monaco' },
    { id:'barcelona',   aliases:['spain','barcelona','catalunya','montmelo','spanish'], label:'Circuit de Barcelona-Catalunya', country:'Spain' },
    { id:'montreal',    aliases:['canada','montreal','gilles villeneuve','canadian'], label:'Circuit Gilles Villeneuve', country:'Canada' },
    { id:'red-bull-ring', aliases:['austria','spielberg','red bull ring','austrian'], label:'Red Bull Ring', country:'Austria' },
    { id:'silverstone', aliases:['britain','great britain','silverstone','british','united kingdom'], label:'Silverstone Circuit', country:'United Kingdom' },
    { id:'spa',         aliases:['belgium','spa','spa francorchamps','belgian'], label:'Circuit de Spa-Francorchamps', country:'Belgium' },
    { id:'hungaroring', aliases:['hungary','hungaroring','budapest','hungarian'], label:'Hungaroring', country:'Hungary' },
    { id:'zandvoort',   aliases:['netherlands','zandvoort','dutch'], label:'Circuit Zandvoort', country:'Netherlands' },
    { id:'monza',       aliases:['italy','monza','italian','autodromo nazionale monza'], label:'Autodromo Nazionale Monza', country:'Italy' },
    { id:'baku',        aliases:['azerbaijan','baku','baku city'], label:'Baku City Circuit', country:'Azerbaijan' },
    { id:'singapore',   aliases:['singapore','marina bay'], label:'Marina Bay Street Circuit', country:'Singapore' },
    { id:'cota',        aliases:['austin','cota','circuit of the americas','united states grand prix'], label:'Circuit of the Americas', country:'United States' },
    { id:'mexico-city', aliases:['mexico','mexico city','hermanos rodriguez','mexican'], label:'Autodromo Hermanos Rodriguez', country:'Mexico' },
    { id:'interlagos',  aliases:['brazil','sao paulo','são paulo','interlagos','jose carlos pace','brazilian'], label:'Autodromo Jose Carlos Pace', country:'Brazil' },
    { id:'las-vegas',   aliases:['las vegas','vegas','las vegas street'], label:'Las Vegas Street Circuit', country:'United States' },
    { id:'losail',      aliases:['qatar','losail','lusail'], label:'Lusail International Circuit', country:'Qatar' },
    { id:'yas-marina',  aliases:['abu dhabi','yas marina','uae','united arab emirates'], label:'Yas Marina Circuit', country:'United Arab Emirates' },
    { id:'madrid',      aliases:['madrid','madring','spanish grand prix madrid'], label:'Madring', country:'Spain' }
  ];

  function clean(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/grand prix|gp|circuit|autodromo|autodrome|international|street|raceway|the/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function slugify(value) {
    return clean(value).replace(/\s+/g, '-').replace(/^-|-$/g, '');
  }

  function getCircuit(race) {
    const haystack = clean([
      race && race.name,
      race && race.raceName,
      race && race.circuit,
      race && race.Circuit && (race.Circuit.circuitName || race.Circuit.circuitId),
      race && race.location,
      race && race.locality,
      race && race.country
    ].filter(Boolean).join(' '));

    let best = null;
    let bestScore = 0;
    CIRCUITS.forEach(circuit => {
      const keys = [circuit.id, circuit.label, circuit.country].concat(circuit.aliases || []);
      keys.forEach(key => {
        const k = clean(key);
        if (!k) return;
        let score = 0;
        if (haystack === k) score = 100;
        else if (haystack.includes(k)) score = 60 + k.length;
        else if (k.includes(haystack) && haystack.length > 3) score = 30 + haystack.length;
        if (score > bestScore) {
          bestScore = score;
          best = circuit;
        }
      });
    });

    if (best) return best;
    const fallback = slugify((race && (race.circuit || race.name || race.raceName || race.location)) || 'unknown-circuit');
    return { id: fallback || 'unknown-circuit', aliases: [], label: race && race.circuit || 'Circuit TBA', country: race && race.country || '' };
  }

  function candidatePaths(circuit) {
    const id = circuit && circuit.id ? circuit.id : 'unknown-circuit';
    const baseIds = Array.from(new Set([
      id,
      id.replace(/-/g, '_'),
      id.replace(/-/g, ''),
      ...(circuit.aliases || []).map(slugify)
    ].filter(Boolean)));
    const layoutIds = [];
    baseIds.forEach(base => {
      layoutIds.push(base);
      for (let i = 1; i <= 14; i += 1) layoutIds.push(`${base}-${i}`);
    });
    const folders = [
      'assets/circuits',
      'assets/circuits/minimal/white-outline',
      'assets/circuits/minimal/white',
      'assets/circuits/detailed/white-outline',
      'assets/circuits/detailed/white',
      'assets/circuits/minimal/black-outline',
      'assets/circuits/detailed/black-outline'
    ];
    const paths = [];
    folders.forEach(folder => {
      layoutIds.forEach(layout => paths.push(`${folder}/${layout}.svg`));
    });
    return Array.from(new Set(paths));
  }

  window.PADDOX_CIRCUIT_MAP = { circuits: CIRCUITS, getCircuit, candidatePaths, clean, slugify };
}());
