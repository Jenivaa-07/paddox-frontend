/* ============================================================
   PADDOX — Formula Timer Circuit Direct Image Map
   Phase H3.3A.10
   Uses Formula Timer circuit slugs for direct remote PNG loading.
   ============================================================ */
(function(){
  'use strict';

  const CIRCUITS = [
    { id:'albert_park', formulaTimerSlug:'albert_park', label:'Albert Park Grand Prix Circuit', aliases:['australian grand prix','australia','melbourne','albert park'] },
    { id:'shanghai', formulaTimerSlug:'shanghai', label:'Shanghai International Circuit', aliases:['chinese grand prix','china','shanghai'] },
    { id:'suzuka', formulaTimerSlug:'suzuka', label:'Suzuka Circuit', aliases:['japanese grand prix','japan','suzuka'] },
    { id:'miami', formulaTimerSlug:'miami', label:'Miami International Autodrome', aliases:['miami grand prix','miami','hard rock'] },
    { id:'montreal', formulaTimerSlug:'montreal', label:'Circuit Gilles Villeneuve', aliases:['canadian grand prix','canada','montreal','gilles villeneuve'] },
    { id:'monaco', formulaTimerSlug:'monaco', label:'Circuit de Monaco', aliases:['monaco grand prix','monaco','monte carlo','monte-carlo'] },
    { id:'barcelona', formulaTimerSlug:'barcelona', label:'Circuit de Barcelona-Catalunya', aliases:['barcelona grand prix','spanish grand prix','barcelona-catalunya','catalunya','montmelo','montmeló'] },
    { id:'red_bull_ring', formulaTimerSlug:'red_bull_ring', label:'Red Bull Ring', aliases:['austrian grand prix','austria','spielberg','red bull ring'] },
    { id:'silverstone', formulaTimerSlug:'silverstone', label:'Silverstone Circuit', aliases:['british grand prix','great britain','silverstone','united kingdom'] },
    { id:'spa', formulaTimerSlug:'spa', label:'Circuit de Spa-Francorchamps', aliases:['belgian grand prix','belgium','spa','spa-francorchamps','francorchamps'] },
    { id:'hungaroring', formulaTimerSlug:'hungaroring', label:'Hungaroring', aliases:['hungarian grand prix','hungary','budapest','hungaroring'] },
    { id:'zandvoort', formulaTimerSlug:'zandvoort', label:'Circuit Zandvoort', aliases:['dutch grand prix','netherlands','zandvoort'] },
    { id:'monza', formulaTimerSlug:'monza', label:'Autodromo Nazionale Monza', aliases:['italian grand prix','italy','monza'] },
    { id:'madrid', formulaTimerSlug:'madrid', label:'Madring', aliases:['madrid grand prix','madrid','madring'] },
    { id:'baku', formulaTimerSlug:'baku', label:'Baku City Circuit', aliases:['azerbaijan grand prix','azerbaijan','baku'] },
    { id:'marina_bay', formulaTimerSlug:'marina_bay', label:'Marina Bay Street Circuit', aliases:['singapore grand prix','singapore','marina bay','marina-bay'] },
    { id:'austin', formulaTimerSlug:'austin', label:'Circuit of the Americas', aliases:['united states grand prix','usa grand prix','austin','cota','circuit of the americas'] },
    { id:'mexico_city', formulaTimerSlug:'mexico_city', label:'Autódromo Hermanos Rodríguez', aliases:['mexico city grand prix','mexican grand prix','mexico','mexico city','hermanos rodriguez','hermanos rodríguez'] },
    { id:'interlagos', formulaTimerSlug:'interlagos', label:'Autódromo José Carlos Pace', aliases:['brazilian grand prix','brazil','sao paulo','são paulo','interlagos','jose carlos pace','josé carlos pace'] },
    { id:'las_vegas', formulaTimerSlug:'las_vegas', label:'Las Vegas Strip Street Circuit', aliases:['las vegas grand prix','las vegas','vegas'] },
    { id:'lusail', formulaTimerSlug:'lusail', label:'Lusail International Circuit', aliases:['qatar grand prix','qatar','lusail','losail'] },
    { id:'yas_marina', formulaTimerSlug:'yas_marina', label:'Yas Marina Circuit', aliases:['abu dhabi grand prix','abu dhabi','yas marina','uae','united arab emirates'] },
    { id:'bahrain', formulaTimerSlug:'bahrain', label:'Bahrain International Circuit', aliases:['bahrain grand prix','bahrain','sakhir'] },
    { id:'jeddah', formulaTimerSlug:'jeddah', label:'Jeddah Corniche Circuit', aliases:['saudi arabian grand prix','saudi arabia','jeddah'] }
  ];

  function key(value=''){
    return String(value || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/grand prix|gp|circuit|autodromo|autodrome|street circuit|international circuit|racing course/g,' ')
      .replace(/[^a-z0-9]+/g,' ')
      .trim();
  }

  function scoreCircuit(circuit, haystack){
    const aliases = [circuit.id, circuit.label, circuit.formulaTimerSlug, ...(circuit.aliases || [])];
    let score = 0;
    aliases.forEach(alias => {
      const a = key(alias);
      if (!a) return;
      if (haystack === a) score = Math.max(score, 120);
      if (haystack.includes(a)) score = Math.max(score, 95);
      if (a.includes(haystack) && haystack.length > 3) score = Math.max(score, 70);
    });
    return score;
  }

  function getCircuit(race={}){
    const fields = [race.name, race.raceName, race.circuit, race.Circuit?.circuitName, race.location, race.locality, race.country]
      .filter(Boolean)
      .map(key);
    const haystack = fields.join(' ');
    let best = null;
    let bestScore = 0;
    CIRCUITS.forEach(circuit => {
      const score = scoreCircuit(circuit, haystack);
      if (score > bestScore) { best = circuit; bestScore = score; }
    });
    if (!best || bestScore < 70) return null;
    return { ...best };
  }

  window.PADDOX_CIRCUIT_MAP = {
    circuits: CIRCUITS,
    getCircuit,
    formulaTimerImageURL(circuit){
      const slug = circuit?.formulaTimerSlug || circuit?.id;
      if (!slug) return '';
      return `https://formula-timer.com/_next/image?q=75&url=${encodeURIComponent(`/circuits/${slug}.png`)}&w=3840`;
    }
  };
})();
