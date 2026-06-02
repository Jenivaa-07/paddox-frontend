/* ============================================================
   PADDOX — aistudio.js | AI Fan Studio | Phase A4.11H.4 Gemini Only
   ============================================================ */
'use strict';

const AI_DRIVERS = [
  {
    "id": "george_russell",
    "name": "George Russell",
    "team": "Mercedes",
    "number": "63",
    "image": "./assets/ai-drivers/george-russell.png",
    "teamTheme": "Silver Precision",
    "accentColor": "#00d2be",
    "secondaryColor": "#111111",
    "faceDescription": "tall composed British features, sharp jawline, short dark hair, calm focused eyes, clean-shaven face, confident reserved smile",
    "racingSuitDescription": "Mercedes-AMG PETRONAS 2026 Formula 1 racing suit with black and silver base, turquoise PETRONAS-style accents, clean technical sponsor-style patches, fitted Puma-style motorsport tailoring, black collar, subtle chrome piping, gloves and boots with matching teal highlights",
    "garageDescription": "Mercedes silver, black, and turquoise garage glow",
    "active": true
  },
  {
    "id": "kimi_antonelli",
    "name": "Kimi Antonelli",
    "team": "Mercedes",
    "number": "12",
    "image": "./assets/ai-drivers/kimi-antonelli.png",
    "teamTheme": "Silver Precision",
    "accentColor": "#00d2be",
    "secondaryColor": "#111111",
    "faceDescription": "young Italian features, soft youthful face, dark hair, expressive focused eyes, clean-shaven look, confident rookie energy",
    "racingSuitDescription": "Mercedes-AMG PETRONAS 2026 Formula 1 racing suit with black and silver base, turquoise PETRONAS-style accents, clean technical sponsor-style patches, fitted Puma-style motorsport tailoring, black collar, subtle chrome piping, gloves and boots with matching teal highlights",
    "garageDescription": "Mercedes silver, black, and turquoise garage glow",
    "active": true
  },
  {
    "id": "charles_leclerc",
    "name": "Charles Leclerc",
    "team": "Ferrari",
    "number": "16",
    "image": "./assets/ai-drivers/charles-leclerc.png",
    "teamTheme": "Crimson Dominance",
    "accentColor": "#e10600",
    "secondaryColor": "#111111",
    "faceDescription": "Monegasque features, sharp cheekbones, dark brown hair, expressive eyes, defined jawline, light stubble, polished confident smile",
    "racingSuitDescription": "Ferrari 2026 Formula 1 racing suit with deep scarlet red base, black side panels, white sponsor-style patch zones, premium Puma-style tailoring, sharp collar, subtle yellow-red seam accents, gloves and boots matching the Ferrari red and black palette",
    "garageDescription": "Ferrari red pit garage glow",
    "active": true
  },
  {
    "id": "lewis_hamilton",
    "name": "Lewis Hamilton",
    "team": "Ferrari",
    "number": "44",
    "image": "./assets/ai-drivers/lewis-hamilton.png",
    "teamTheme": "Crimson Dominance",
    "accentColor": "#e10600",
    "secondaryColor": "#111111",
    "faceDescription": "recognizable British features, braided hairstyle or styled hair, defined facial hair, strong cheekbones, warm confident eyes, fashionable champion presence",
    "racingSuitDescription": "Ferrari 2026 Formula 1 racing suit with deep scarlet red base, black side panels, white sponsor-style patch zones, premium Puma-style tailoring, sharp collar, subtle yellow-red seam accents, gloves and boots matching the Ferrari red and black palette",
    "garageDescription": "Ferrari red pit garage glow",
    "active": true
  },
  {
    "id": "lando_norris",
    "name": "Lando Norris",
    "team": "McLaren",
    "number": "4",
    "image": "./assets/ai-drivers/lando-norris.png",
    "teamTheme": "Papaya Charge",
    "accentColor": "#ff8700",
    "secondaryColor": "#111111",
    "faceDescription": "recognizable British features, curly brown hair, youthful face, bright eyes, relaxed playful smile, clean modern racing personality",
    "racingSuitDescription": "McLaren 2026 Formula 1 racing suit with papaya-orange base, black side panels, blue accent piping, sleek sponsor-style details, fitted high-performance motorsport tailoring, black collar, matching gloves and boots with papaya highlights",
    "garageDescription": "McLaren papaya-orange garage glow",
    "active": true
  },
  {
    "id": "oscar_piastri",
    "name": "Oscar Piastri",
    "team": "McLaren",
    "number": "81",
    "image": "./assets/ai-drivers/oscar-piastri.png",
    "teamTheme": "Papaya Charge",
    "accentColor": "#ff8700",
    "secondaryColor": "#111111",
    "faceDescription": "Australian features, short brown hair, calm eyes, clean-shaven face, composed expression, precise and focused young champion energy",
    "racingSuitDescription": "McLaren 2026 Formula 1 racing suit with papaya-orange base, black side panels, blue accent piping, sleek sponsor-style details, fitted high-performance motorsport tailoring, black collar, matching gloves and boots with papaya highlights",
    "garageDescription": "McLaren papaya-orange garage glow",
    "active": true
  },
  {
    "id": "max_verstappen",
    "name": "Max Verstappen",
    "team": "Red Bull Racing",
    "number": "1",
    "image": "./assets/ai-drivers/max-verstappen.png",
    "teamTheme": "Midnight Charge",
    "accentColor": "#1e41ff",
    "secondaryColor": "#dc0000",
    "faceDescription": "Dutch features, short light-brown hair, strong jawline, focused blue eyes, light stubble, intense competitive expression",
    "racingSuitDescription": "Red Bull Racing 2026 Formula 1 racing suit with deep navy blue base, red and yellow accent flashes, premium sponsor-style patch layout, fitted racing silhouette, dark collar, gloves and boots with blue-red detailing and high-gloss motorsport texture",
    "garageDescription": "Red Bull deep blue, red, and yellow garage glow",
    "active": true
  },
  {
    "id": "isack_hadjar",
    "name": "Isack Hadjar",
    "team": "Red Bull Racing",
    "number": "6",
    "image": "./assets/ai-drivers/isack-hadjar.png",
    "teamTheme": "Midnight Charge",
    "accentColor": "#1e41ff",
    "secondaryColor": "#dc0000",
    "faceDescription": "French-Algerian features, dark hair, sharp focused eyes, youthful determined face, clean motorsport confidence",
    "racingSuitDescription": "Red Bull Racing 2026 Formula 1 racing suit with deep navy blue base, red and yellow accent flashes, premium sponsor-style patch layout, fitted racing silhouette, dark collar, gloves and boots with blue-red detailing and high-gloss motorsport texture",
    "garageDescription": "Red Bull deep blue, red, and yellow garage glow",
    "active": true
  },
  {
    "id": "pierre_gasly",
    "name": "Pierre Gasly",
    "team": "Alpine",
    "number": "10",
    "image": "./assets/ai-drivers/pierre-gasly.png",
    "teamTheme": "Blue Voltage",
    "accentColor": "#2293d1",
    "secondaryColor": "#fd4bc7",
    "faceDescription": "French features, short brown hair, defined jawline, light stubble, calm intense eyes, polished race-week confidence",
    "racingSuitDescription": "Alpine 2026 Formula 1 racing suit with electric blue base, black panels, pink accent stripes, clean sponsor-style patch areas, modern French motorsport tailoring, fitted collar, matching gloves and boots with blue-pink highlights",
    "garageDescription": "Alpine blue and pink garage glow",
    "active": true
  },
  {
    "id": "franco_colapinto",
    "name": "Franco Colapinto",
    "team": "Alpine",
    "number": "43",
    "image": "./assets/ai-drivers/franco-colapinto.png",
    "teamTheme": "Blue Voltage",
    "accentColor": "#2293d1",
    "secondaryColor": "#fd4bc7",
    "faceDescription": "Argentine features, youthful face, dark hair, bright focused eyes, clean-shaven look, energetic confident expression",
    "racingSuitDescription": "Alpine 2026 Formula 1 racing suit with electric blue base, black panels, pink accent stripes, clean sponsor-style patch areas, modern French motorsport tailoring, fitted collar, matching gloves and boots with blue-pink highlights",
    "garageDescription": "Alpine blue and pink garage glow",
    "active": true
  },
  {
    "id": "liam_lawson",
    "name": "Liam Lawson",
    "team": "Racing Bulls",
    "number": "30",
    "image": "./assets/ai-drivers/liam-lawson.png",
    "teamTheme": "Vivid Sprint",
    "accentColor": "#315dff",
    "secondaryColor": "#ffffff",
    "faceDescription": "New Zealander features, short brown hair, focused eyes, clean-shaven face, serious determined racing expression",
    "racingSuitDescription": "Racing Bulls 2026 Formula 1 racing suit with vivid blue base, white panels, red accent flashes, sleek sponsor-style details, fitted motorsport cut, clean collar, gloves and boots with blue-white-red finishing",
    "garageDescription": "Racing Bulls blue and white garage glow",
    "active": true
  },
  {
    "id": "arvid_lindblad",
    "name": "Arvid Lindblad",
    "team": "Racing Bulls",
    "number": "41",
    "image": "./assets/ai-drivers/arvid-lindblad.png",
    "teamTheme": "Vivid Sprint",
    "accentColor": "#315dff",
    "secondaryColor": "#ffffff",
    "faceDescription": "young British-Swedish features, youthful face, dark hair, focused eyes, composed rookie confidence",
    "racingSuitDescription": "Racing Bulls 2026 Formula 1 racing suit with vivid blue base, white panels, red accent flashes, sleek sponsor-style details, fitted motorsport cut, clean collar, gloves and boots with blue-white-red finishing",
    "garageDescription": "Racing Bulls blue and white garage glow",
    "active": true
  },
  {
    "id": "esteban_ocon",
    "name": "Esteban Ocon",
    "team": "Haas F1 Team",
    "number": "31",
    "image": "./assets/ai-drivers/esteban-ocon.png",
    "teamTheme": "American Steel",
    "accentColor": "#b6b9bc",
    "secondaryColor": "#e6002b",
    "faceDescription": "French features, tall slim face, dark hair, defined jawline, calm focused expression, serious professional presence",
    "racingSuitDescription": "Haas F1 Team 2026 Formula 1 racing suit with white, black, and dark grey base, red accent piping, clean sponsor-style chest and sleeve zones, fitted technical racewear silhouette, gloves and boots with black-red detailing",
    "garageDescription": "Haas white, black, and red garage glow",
    "active": true
  },
  {
    "id": "oliver_bearman",
    "name": "Oliver Bearman",
    "team": "Haas F1 Team",
    "number": "87",
    "image": "./assets/ai-drivers/oliver-bearman.png",
    "teamTheme": "American Steel",
    "accentColor": "#b6b9bc",
    "secondaryColor": "#e6002b",
    "faceDescription": "young British features, brown hair, youthful face, focused eyes, clean-shaven look, confident rookie racing energy",
    "racingSuitDescription": "Haas F1 Team 2026 Formula 1 racing suit with white, black, and dark grey base, red accent piping, clean sponsor-style chest and sleeve zones, fitted technical racewear silhouette, gloves and boots with black-red detailing",
    "garageDescription": "Haas white, black, and red garage glow",
    "active": true
  },
  {
    "id": "carlos_sainz",
    "name": "Carlos Sainz",
    "team": "Williams",
    "number": "55",
    "image": "./assets/ai-drivers/carlos-sainz.png",
    "teamTheme": "Heritage Blue",
    "accentColor": "#64c4ff",
    "secondaryColor": "#001e5a",
    "faceDescription": "Spanish features, dark hair, strong eyebrows, defined jawline, light stubble, confident calm expression",
    "racingSuitDescription": "Williams 2026 Formula 1 racing suit with royal blue and navy base, light blue accent stripes, crisp sponsor-style panels, fitted professional motorsport tailoring, clean collar, gloves and boots with blue technical highlights",
    "garageDescription": "Williams blue garage glow",
    "active": true
  },
  {
    "id": "alexander_albon",
    "name": "Alexander Albon",
    "team": "Williams",
    "number": "23",
    "image": "./assets/ai-drivers/alexander-albon.png",
    "teamTheme": "Heritage Blue",
    "accentColor": "#64c4ff",
    "secondaryColor": "#001e5a",
    "faceDescription": "Thai-British features, dark hair, gentle confident eyes, clean-shaven face, relaxed composed smile",
    "racingSuitDescription": "Williams 2026 Formula 1 racing suit with royal blue and navy base, light blue accent stripes, crisp sponsor-style panels, fitted professional motorsport tailoring, clean collar, gloves and boots with blue technical highlights",
    "garageDescription": "Williams blue garage glow",
    "active": true
  },
  {
    "id": "nico_hulkenberg",
    "name": "Nico Hulkenberg",
    "team": "Audi",
    "number": "27",
    "image": "./assets/ai-drivers/nico-hulkenberg.png",
    "teamTheme": "Redline Future",
    "accentColor": "#d60000",
    "secondaryColor": "#111111",
    "faceDescription": "German features, blond hair, strong jawline, light eyes, calm mature expression, experienced racing confidence",
    "racingSuitDescription": "Audi 2026 Formula 1 racing suit with sharp black base, white technical panels, red Audi-style accent blocks, clean futuristic sponsor-style layout, fitted modern motorsport tailoring, gloves and boots with black-white-red detailing",
    "garageDescription": "Audi black, white, and red garage glow",
    "active": true
  },
  {
    "id": "gabriel_bortoleto",
    "name": "Gabriel Bortoleto",
    "team": "Audi",
    "number": "5",
    "image": "./assets/ai-drivers/gabriel-bortoleto.png",
    "teamTheme": "Redline Future",
    "accentColor": "#d60000",
    "secondaryColor": "#111111",
    "faceDescription": "Brazilian features, youthful face, dark hair, focused eyes, clean-shaven look, composed rising-star energy",
    "racingSuitDescription": "Audi 2026 Formula 1 racing suit with sharp black base, white technical panels, red Audi-style accent blocks, clean futuristic sponsor-style layout, fitted modern motorsport tailoring, gloves and boots with black-white-red detailing",
    "garageDescription": "Audi black, white, and red garage glow",
    "active": true
  },
  {
    "id": "sergio_perez",
    "name": "Sergio Perez",
    "team": "Cadillac",
    "number": "11",
    "image": "./assets/ai-drivers/sergio-perez.png",
    "teamTheme": "Gold Standard",
    "accentColor": "#d4af37",
    "secondaryColor": "#111111",
    "faceDescription": "Mexican features, dark hair, warm eyes, defined facial hair or stubble, experienced confident smile",
    "racingSuitDescription": "Cadillac 2026 Formula 1 racing suit with black base, pearl white panels, metallic gold accents, premium American luxury motorsport detailing, clean sponsor-style patches, fitted racewear silhouette, gloves and boots with black-gold highlights",
    "garageDescription": "Cadillac black, white, and gold garage glow",
    "active": true
  },
  {
    "id": "valtteri_bottas",
    "name": "Valtteri Bottas",
    "team": "Cadillac",
    "number": "77",
    "image": "./assets/ai-drivers/valtteri-bottas.png",
    "teamTheme": "Gold Standard",
    "accentColor": "#d4af37",
    "secondaryColor": "#111111",
    "faceDescription": "Finnish features, blond hair, light eyes, strong jawline, mature calm expression, often with moustache or light facial hair",
    "racingSuitDescription": "Cadillac 2026 Formula 1 racing suit with black base, pearl white panels, metallic gold accents, premium American luxury motorsport detailing, clean sponsor-style patches, fitted racewear silhouette, gloves and boots with black-gold highlights",
    "garageDescription": "Cadillac black, white, and gold garage glow",
    "active": true
  },
  {
    "id": "fernando_alonso",
    "name": "Fernando Alonso",
    "team": "Aston Martin",
    "number": "14",
    "image": "./assets/ai-drivers/fernando-alonso.png",
    "teamTheme": "Emerald Velocity",
    "accentColor": "#006f62",
    "secondaryColor": "#b6ff00",
    "faceDescription": "Spanish features, dark hair with grey streaks, light stubble, intense experienced eyes, relaxed champion smile",
    "racingSuitDescription": "Aston Martin Aramco 2026 Formula 1 racing suit with deep teal-green base, black collar, lime-yellow seam piping, clean sponsor-style patch zones, refined premium motorsport tailoring, matching gloves and boots with teal and lime accents",
    "garageDescription": "Aston Martin teal-green garage glow",
    "active": true
  },
  {
    "id": "lance_stroll",
    "name": "Lance Stroll",
    "team": "Aston Martin",
    "number": "18",
    "image": "./assets/ai-drivers/lance-stroll.png",
    "teamTheme": "Emerald Velocity",
    "accentColor": "#006f62",
    "secondaryColor": "#b6ff00",
    "faceDescription": "Canadian features, dark hair, strong brows, clean-shaven face or light stubble, calm serious expression",
    "racingSuitDescription": "Aston Martin Aramco 2026 Formula 1 racing suit with deep teal-green base, black collar, lime-yellow seam piping, clean sponsor-style patch zones, refined premium motorsport tailoring, matching gloves and boots with teal and lime accents",
    "garageDescription": "Aston Martin teal-green garage glow",
    "active": true
  }
];
const AI_TEAMS = [
  {
    "id": "mercedes",
    "name": "Mercedes",
    "theme": "Silver Precision",
    "primaryColor": "#00d2be",
    "secondaryColor": "#111111",
    "suitDescription": "Mercedes-AMG PETRONAS 2026 Formula 1 racing suit with black and silver base, turquoise PETRONAS-style accents, clean technical sponsor-style patches, fitted Puma-style motorsport tailoring, black collar, subtle chrome piping, gloves and boots with matching teal highlights",
    "garageDescription": "Mercedes silver, black, and turquoise garage glow"
  },
  {
    "id": "ferrari",
    "name": "Ferrari",
    "theme": "Crimson Dominance",
    "primaryColor": "#e10600",
    "secondaryColor": "#111111",
    "suitDescription": "Ferrari 2026 Formula 1 racing suit with deep scarlet red base, black side panels, white sponsor-style patch zones, premium Puma-style tailoring, sharp collar, subtle yellow-red seam accents, gloves and boots matching the Ferrari red and black palette",
    "garageDescription": "Ferrari red pit garage glow"
  },
  {
    "id": "mclaren",
    "name": "McLaren",
    "theme": "Papaya Charge",
    "primaryColor": "#ff8700",
    "secondaryColor": "#111111",
    "suitDescription": "McLaren 2026 Formula 1 racing suit with papaya-orange base, black side panels, blue accent piping, sleek sponsor-style details, fitted high-performance motorsport tailoring, black collar, matching gloves and boots with papaya highlights",
    "garageDescription": "McLaren papaya-orange garage glow"
  },
  {
    "id": "red_bull_racing",
    "name": "Red Bull Racing",
    "theme": "Midnight Charge",
    "primaryColor": "#1e41ff",
    "secondaryColor": "#dc0000",
    "suitDescription": "Red Bull Racing 2026 Formula 1 racing suit with deep navy blue base, red and yellow accent flashes, premium sponsor-style patch layout, fitted racing silhouette, dark collar, gloves and boots with blue-red detailing and high-gloss motorsport texture",
    "garageDescription": "Red Bull deep blue, red, and yellow garage glow"
  },
  {
    "id": "alpine",
    "name": "Alpine",
    "theme": "Blue Voltage",
    "primaryColor": "#2293d1",
    "secondaryColor": "#fd4bc7",
    "suitDescription": "Alpine 2026 Formula 1 racing suit with electric blue base, black panels, pink accent stripes, clean sponsor-style patch areas, modern French motorsport tailoring, fitted collar, matching gloves and boots with blue-pink highlights",
    "garageDescription": "Alpine blue and pink garage glow"
  },
  {
    "id": "racing_bulls",
    "name": "Racing Bulls",
    "theme": "Vivid Sprint",
    "primaryColor": "#315dff",
    "secondaryColor": "#ffffff",
    "suitDescription": "Racing Bulls 2026 Formula 1 racing suit with vivid blue base, white panels, red accent flashes, sleek sponsor-style details, fitted motorsport cut, clean collar, gloves and boots with blue-white-red finishing",
    "garageDescription": "Racing Bulls blue and white garage glow"
  },
  {
    "id": "haas",
    "name": "Haas F1 Team",
    "theme": "American Steel",
    "primaryColor": "#b6b9bc",
    "secondaryColor": "#e6002b",
    "suitDescription": "Haas F1 Team 2026 Formula 1 racing suit with white, black, and dark grey base, red accent piping, clean sponsor-style chest and sleeve zones, fitted technical racewear silhouette, gloves and boots with black-red detailing",
    "garageDescription": "Haas white, black, and red garage glow"
  },
  {
    "id": "williams",
    "name": "Williams",
    "theme": "Heritage Blue",
    "primaryColor": "#64c4ff",
    "secondaryColor": "#001e5a",
    "suitDescription": "Williams 2026 Formula 1 racing suit with royal blue and navy base, light blue accent stripes, crisp sponsor-style panels, fitted professional motorsport tailoring, clean collar, gloves and boots with blue technical highlights",
    "garageDescription": "Williams blue garage glow"
  },
  {
    "id": "audi",
    "name": "Audi",
    "theme": "Redline Future",
    "primaryColor": "#d60000",
    "secondaryColor": "#111111",
    "suitDescription": "Audi 2026 Formula 1 racing suit with sharp black base, white technical panels, red Audi-style accent blocks, clean futuristic sponsor-style layout, fitted modern motorsport tailoring, gloves and boots with black-white-red detailing",
    "garageDescription": "Audi black, white, and red garage glow"
  },
  {
    "id": "cadillac",
    "name": "Cadillac",
    "theme": "Gold Standard",
    "primaryColor": "#d4af37",
    "secondaryColor": "#111111",
    "suitDescription": "Cadillac 2026 Formula 1 racing suit with black base, pearl white panels, metallic gold accents, premium American luxury motorsport detailing, clean sponsor-style patches, fitted racewear silhouette, gloves and boots with black-gold highlights",
    "garageDescription": "Cadillac black, white, and gold garage glow"
  },
  {
    "id": "aston_martin",
    "name": "Aston Martin",
    "theme": "Emerald Velocity",
    "primaryColor": "#006f62",
    "secondaryColor": "#b6ff00",
    "suitDescription": "Aston Martin Aramco 2026 Formula 1 racing suit with deep teal-green base, black collar, lime-yellow seam piping, clean sponsor-style patch zones, refined premium motorsport tailoring, matching gloves and boots with teal and lime accents",
    "garageDescription": "Aston Martin teal-green garage glow"
  }
];
const PROMPT_TEMPLATES = [
  {
    "id": "team_identity_mediaday",
    "title": "Team Identity Portrait",
    "category": "team-identity",
    "creditCost": 35,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/team-identity-mediaday.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Transform the uploaded portrait into a cinematic Formula 1 driver hero image inspired by {team_name} racing energy, wearing the {team_name} 2026 Formula 1 racing suit: {racing_suit_description}. Add sleek media-day paddock lighting, premium editorial photography, clean background blur, calm champion confidence, ultra realistic detail, natural skin texture, preserve the fan face exactly."
  },
  {
    "id": "driver_social_avatar",
    "title": "Driver Social Avatar",
    "category": "team-identity",
    "creditCost": 25,
    "requiresUserPhoto": true,
    "recommendedAspect": "1:1",
    "previewImage": "./assets/ai-templates/driver-social-avatar.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Create a hyper-realistic F1 driver social avatar from the uploaded fan portrait, wearing the {team_name} 2026 racing suit: {racing_suit_description}. Use dark premium background, subtle {team_theme} glow, sharp contrast lighting, mobile-friendly profile framing, confident expression, preserve exact face, hairstyle, skin texture, and accessories."
  },
  {
    "id": "modern_team_garage",
    "title": "Modern Team Garage",
    "category": "team-identity",
    "creditCost": 40,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/modern-team-garage.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Create a realistic F1 driver portrait standing inside a modern {team_name} team garage. The fan wears the {racing_suit_description}. Surround with soft workshop lights, tire stacks, blurred mechanics, monitors, cinematic shadows, serious pre-race focus, authentic motorsport atmosphere, ultra realistic detail, preserve the exact uploaded face."
  },
  {
    "id": "pit_lane_walk",
    "title": "Pit Lane Walk",
    "category": "pit-lane",
    "creditCost": 40,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/pit-lane-walk.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Turn the uploaded image into a cinematic F1 pit lane walk portrait with {team_name} race suit: {racing_suit_description}, gloves in hand, blurred team garages, photographers in the background, shallow depth of field, strong sports editorial realism, focused race-day entrance energy, ultra realistic, preserve original face."
  },
  {
    "id": "pre_race_grid_walk",
    "title": "Pre-Race Grid Walk",
    "category": "pit-lane",
    "creditCost": 40,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/pre-race-grid-walk.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Generate a pre-race grid walk scene featuring the fan in the {team_name} 2026 race suit: {racing_suit_description}. Add racing cars and crew softly blurred behind, bright track-day lighting, premium sports photography, intense controlled expression, authentic elite-driver confidence, preserve exact facial features and identity."
  },
  {
    "id": "garage_strategy",
    "title": "Garage Strategy Moment",
    "category": "pit-lane",
    "creditCost": 45,
    "requiresUserPhoto": true,
    "recommendedAspect": "16:9",
    "previewImage": "./assets/ai-templates/garage-strategy.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Create an F1 garage strategy portrait with the fan in {team_name} race gear: {racing_suit_description}, cool workshop lights, monitors, tires, technical equipment, serious championship mindset, blue-orange cinematic contrast, realistic motorsport atmosphere, tense pre-race planning moment, preserve original face and proportions."
  },
  {
    "id": "trackside_sunset",
    "title": "Trackside Sunset Portrait",
    "category": "pit-lane",
    "creditCost": 35,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/trackside-sunset.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Generate a trackside sunset racing portrait with warm golden-hour light, the fan wearing the {team_name} racing suit: {racing_suit_description}, a blurred race car beside the subject, subtle lens flare, premium suit textures, emotional calm confidence, campaign-style realism, preserve exact facial identity."
  },
  {
    "id": "helmet_closeup",
    "title": "Helmet Close-Up Drama",
    "category": "helmet-cockpit",
    "creditCost": 45,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/helmet-closeup.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Create a dramatic F1 helmet close-up from the uploaded portrait, showing the fan inside a premium {team_name} racing helmet and suit. Use reflective visor, intense eye focus, cinematic cockpit lighting, race-day tension, world-class motorsport realism, preserve visible facial identity through the eyes and proportions."
  },
  {
    "id": "cockpit_ready",
    "title": "Cockpit Ready",
    "category": "helmet-cockpit",
    "creditCost": 45,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/cockpit-ready.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Transform the uploaded photo into a cockpit-ready AI race driver portrait with gloves, helmet partially on, harness details, instrument glow, shallow depth of field, serious pre-launch expression, adrenaline and realism, wearing {team_name} suit details: {racing_suit_description}, preserve the original face and identity."
  },
  {
    "id": "neon_night_race",
    "title": "Neon Night Race",
    "category": "helmet-cockpit",
    "creditCost": 45,
    "requiresUserPhoto": true,
    "recommendedAspect": "9:16",
    "previewImage": "./assets/ai-templates/neon-night-race.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Generate a neon night-race F1 driver portrait with reflective {team_name} suit details: {racing_suit_description}, glowing purple-blue track lights, wet asphalt reflections, futuristic contrast, sleek helmet under one arm, cinematic street-circuit drama, preserve the subject's real face and proportions."
  },
  {
    "id": "speed_tunnel",
    "title": "Motion Speed Tunnel",
    "category": "helmet-cockpit",
    "creditCost": 40,
    "requiresUserPhoto": true,
    "recommendedAspect": "16:9",
    "previewImage": "./assets/ai-templates/speed-tunnel.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Create a cinematic F1 portrait inside a motion-lit speed tunnel, with bold directional lighting, {team_name} race suit textures, soft smoke, dynamic light streaks suggesting extreme velocity, premium poster realism, strong focus, preserve exact face and identity."
  },
  {
    "id": "podium_winner",
    "title": "Podium Winner",
    "category": "podium",
    "creditCost": 50,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/podium-winner.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Transform the uploaded portrait into a podium winner celebration image with the {team_name} 2026 racing suit: {racing_suit_description}, bright podium lights, trophy in hand, confetti in the air, proud controlled smile, official-post-race realism, emotional championship energy, preserve original face."
  },
  {
    "id": "champagne_victory",
    "title": "Champagne Victory",
    "category": "podium",
    "creditCost": 50,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/champagne-victory.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Generate a dramatic F1 victory portrait with champagne spray, glowing podium lights, reflective highlights, triumphant race-winner expression, cinematic social-ready framing, winner's-circle adrenaline, ultra realistic detail, {team_name} racing suit: {racing_suit_description}, preserve exact facial identity."
  },
  {
    "id": "championship_poster",
    "title": "Championship Poster Cover",
    "category": "podium",
    "creditCost": 55,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/championship-poster.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Create a championship F1 poster cover with strong front-facing composition, dramatic contrast, {team_name} racing suit branding details: {racing_suit_description}, blurred race car background, bold cinematic lighting, heroic elite look, preserve the real face and build premium poster realism."
  },
  {
    "id": "movie_poster",
    "title": "Racing Movie Poster",
    "category": "podium",
    "creditCost": 55,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/movie-poster.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Generate an F1 movie-poster-style portrait with dramatic motorsport lighting, intense expression, race car silhouette behind the subject, smoke, sparks, sweeping cinematic composition, making the fan look like the lead of an epic racing film, {team_name} styling, preserve original face."
  },
  {
    "id": "champion_walkoff",
    "title": "Champion Walk-Off",
    "category": "podium",
    "creditCost": 50,
    "requiresUserPhoto": true,
    "recommendedAspect": "16:9",
    "previewImage": "./assets/ai-templates/champion-walkoff.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Create a cinematic post-race champion walk-off scene with the fan wearing the {team_name} suit slightly relaxed at the collar, helmet in hand, golden backlight, blurred grandstands, emotional end-of-race calm, communicating victory, exhaustion, legacy-level motorsport emotion, preserve exact facial identity."
  },
  {
    "id": "night_selfie_driver",
    "title": "Night Pit Lane Selfie",
    "category": "fan-driver",
    "creditCost": 60,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/night-selfie-driver.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "TRUE SMARTPHONE SELFIE COMPOSITION LOCK: This must look like a real fan-held smartphone selfie, not a third-person professional portrait, not an editorial garage photo, and not a photographer-taken image. Create a photorealistic nighttime selfie-style photo on a Formula 1 pit lane at night. The taller fan on the left is holding the phone at arm's length, slightly above face level, using the front camera. Use tight close-up selfie framing from shoulders/chest upward, with both faces large and close to the lens, filling most of the frame. Add slight smartphone wide-angle distortion, imperfect candid crop, natural flash-lit skin, and casual selfie energy. Both people must look directly into the phone camera. PERSON ON THE LEFT, taller fan: preserve the exact face, bone structure, jawline, nose shape, eye shape, eyebrow thickness, lip shape, skin tone, skin texture, forehead, cheekbones, chin, hairstyle, facial hair, and every visible accessory from the uploaded reference photo. The fan is smiling naturally showing teeth, one arm around the driver's shoulder, and the selfie angle should imply the fan's other arm is extended holding the phone. PERSON ON THE RIGHT, slightly shorter driver: {driver_name}, recognizable as himself, with {driver_face_description}. He has a natural relaxed smile and one arm around the fan's back. Both people are wearing the {team_name} 2026 Formula 1 racing suit: {racing_suit_description}. Background: nighttime Formula 1 pit lane, heavily out of focus gaussian blur, warm amber and orange bokeh lights from pit garage lamps and floodlights, blurred team equipment, monitors, mechanics, tyre blankets, pit wall screens, dark night sky above, {garage_description} faintly visible. Lighting: harsh overhead artificial pit lane lights, strong highlights on both faces, slight lens flare, smartphone selfie camera characteristics, built-in flash subtly illuminating faces, natural skin texture, candid authentic iPhone-style photo, slight motion energy, genuine fan-and-driver moment. SELFIE NEGATIVE COMPOSITION RULES: do not show full-body posing, do not use a distant camera, do not create a formal portrait, do not make it look like a media-day photoshoot, do not center them like a magazine cover, do not place the camera several meters away, and do not make the driver/fan look unaware of the camera."
  },
  {
    "id": "vip_paddock_guest",
    "title": "VIP Paddock Guest",
    "category": "fan-driver",
    "creditCost": 45,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/vip-paddock-guest.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Cinematic documentary sports photography inside a VIP {team_name} team garage during the final lap. The fan wears an oversized racing jacket, paddock pass around the neck, and large team headset, looking at race monitors with a tense proud expression, blurred engineers in background, telephoto lens, slight motion blur, 8k photorealistic, preserve uploaded face exactly."
  },
  {
    "id": "driver_card_number",
    "title": "Number 8 Hero Poster",
    "category": "social",
    "creditCost": 35,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/driver-card-number.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Cinematic Formula 1 themed poster featuring the person from the reference image. Bold racing background using {team_theme} colors with subtle racing textures and a large number '{custom_number}' placed behind the character. Subject sharply focused with dramatic cinematic lighting, clean professional sports poster layout, ultra-realistic detail, shallow depth of field, 8K realism, preserve face exactly."
  },
  {
    "id": "ferrari_style_victory",
    "title": "Team Victory Trophy",
    "category": "podium",
    "creditCost": 55,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/ferrari-style-victory.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "A cinematic Formula 1 victory poster featuring the fan from the reference image. Keep the original face exactly the same. The fan is wearing the {team_name} Formula 1 racing suit: {racing_suit_description}. Standing on a race podium raising a golden trophy in celebration. Behind them a {team_name} Formula 1 car is parked with smoke rising from the tires. Confetti and bright race lights fill the background. Dramatic sports lighting, ultra-realistic detail, epic motorsport victory scene."
  },
  {
    "id": "ultra_magazine_cover",
    "title": "Premium Magazine Cover",
    "category": "premium",
    "creditCost": 65,
    "requiresUserPhoto": true,
    "recommendedAspect": "4:5",
    "previewImage": "./assets/ai-templates/ultra-magazine-cover.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Ultra high-definition cinematic portrait of the fan as a {team_name} F1 driver walking confidently through a pit lane. Sharp highly detailed image, subtle cinematic grain, controlled vignetting, rich contrast, high-gloss professional motorsport aesthetic using {team_theme} colors. Wearing full suit, gloves, boots and holding a matching helmet. Face visible, unedited and natural, skin texture intact. Shallow depth of field 85mm lens look, blurred crew members, photographers, warm sun haze, Netflix sports documentary still or premium racing magazine cover energy."
  },
  {
    "id": "track_action_car",
    "title": "Trackside Action Car",
    "category": "driver-only",
    "creditCost": 30,
    "requiresUserPhoto": false,
    "recommendedAspect": "16:9",
    "previewImage": "./assets/ai-templates/track-action-car.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "High-speed action photography of a modern {team_name} Formula 1 car racing around a corner at Monaco, sparks flying from the floor, motion blur on the background and wheels to convey extreme speed, dramatic shadows, asphalt texture, vibrant colors, realistic broadcast-style motorsport photography."
  },
  {
    "id": "car_pit_lane",
    "title": "Cinematic Pit Lane Car",
    "category": "driver-only",
    "creditCost": 30,
    "requiresUserPhoto": false,
    "recommendedAspect": "16:9",
    "previewImage": "./assets/ai-templates/car-pit-lane.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Ultra-realistic F1 photography, a {team_name} racing car parked in a modern pit lane, mechanic in the background adjusting the front wing, bright sunlight, cinematic lighting, shallow depth of field, shot on 35mm lens, 8k realism, highly detailed race car and team suit atmosphere."
  },
  {
    "id": "minimal_wallpaper",
    "title": "Minimal Team Wallpaper",
    "category": "wallpaper",
    "creditCost": 20,
    "requiresUserPhoto": false,
    "recommendedAspect": "9:16",
    "previewImage": "./assets/ai-templates/minimal-wallpaper.jpg",
    "realism": "Hyper-realistic",
    "active": true,
    "prompt": "Create a sleek premium mobile wallpaper inspired by {driver_name} and {team_name}. Use {team_theme} colors, deep black background, subtle racing textures, refined light streaks, driver number {driver_number}, clean negative space, luxury motorsport finish, photorealistic poster detail."
  }
];

const RATIOS = [
  { id:'1:1', title:'Square Post', note:'Instagram post' },
  { id:'4:5', title:'Portrait Poster', note:'Poster / feed' },
  { id:'9:16', title:'Story / Reel', note:'Mobile vertical' },
  { id:'16:9', title:'Desktop Wide', note:'Wallpaper' },
  { id:'21:9', title:'Wide Banner', note:'Header visual' }
];

const AI_DRIVER_PROFILE_API = 'https://paddox-backend.onrender.com/api/fan/driver-profiles';
const AI_F1_DRIVERS_API = 'https://paddox-backend.onrender.com/api/f1/drivers';

const PADDOX_API_BASE = window.PADDOX_API_BASE || 'https://paddox-backend.onrender.com/api';
const AI_STUDIO_GENERATE_API = `${PADDOX_API_BASE}/ai-studio/generate`;
const AI_STUDIO_CREDITS_API = `${PADDOX_API_BASE}/ai-studio/credits`;

/* Phase A4.11H.1 — Real credits sync:
   Admin-added credits live in MongoDB. Do not trust browser/localStorage alone. */
let backendAiCredits = null;
let backendCreditsLoaded = false;

function getAccessToken() {
  return window.TokenManager?.getAccess?.()
    || localStorage.getItem('token')
    || localStorage.getItem('paddox_access_token')
    || localStorage.getItem('accessToken')
    || '';
}

async function aiStudioAuthFetch(pathOrUrl, options = {}) {
  const url = /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : `${PADDOX_API_BASE}${pathOrUrl}`;
  const token = getAccessToken();
  const sessionId = localStorage.getItem('paddox_session_id') || '';
  const headers = options.headers || {};
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(sessionId ? { 'X-Paddox-Session-Id': sessionId } : {}),
      ...headers
    }
  });
  const responseSessionId = res.headers.get('X-Paddox-Session-Id');
  if (responseSessionId) localStorage.setItem('paddox_session_id', responseSessionId);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const credits = data?.data?.aiCredits ?? data?.aiCredits;
    if (Number.isFinite(Number(credits))) setCredits(Number(credits));
    const err = new Error(data.message || 'Request failed');
    err.responseData = data;
    throw err;
  }
  return data;
}

function isQuotaErrorMessage(message = '', responseData = {}) {
  const text = `${message || ''} ${JSON.stringify(responseData || {})}`.toLowerCase();
  return text.includes('quota') ||
    text.includes('resource_exhausted') ||
    text.includes('free tier') ||
    text.includes('generate_content_free_tier') ||
    text.includes('gemini_quota_exceeded') ||
    text.includes('all_image_providers_failed');
}

function handleProviderGenerationError(err) {
  const responseData = err?.responseData || {};
  const data = responseData.data || {};
  const credits = Number(data.aiCredits ?? responseData.aiCredits);
  if (Number.isFinite(credits)) setCredits(credits);

  const quota = isQuotaErrorMessage(err?.message, responseData);
  const message = quota
    ? 'Gemini image generation is temporarily unavailable. Your credits were not deducted.'
    : (err?.message || 'Gemini image generation failed. Your credits were not deducted.');

  $('#result-status').textContent = message;
  showToast(quota ? 'Gemini unavailable — credits safe.' : `Generation failed: ${err.message || 'Try again'}`);

  const frame = $('#preview-frame');
  frame?.classList.remove('has-generated-image');
  const img = $('#generated-image');
  if (img) img.remove();

  const wm = frame?.querySelector('.preview-watermark');
  if (wm) wm.textContent = quota ? 'GEMINI UNAVAILABLE' : 'PADDOX AI';

  return message;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read uploaded image'));
    reader.readAsDataURL(file);
  });
}


let ACTIVE_AI_DRIVERS = AI_DRIVERS.map(d => ({ ...d, imageSource: 'initials-fallback' }));
let selectedDriver = ACTIVE_AI_DRIVERS[0];
let selectedTemplate = PROMPT_TEMPLATES.find(t => t.id === 'night_selfie_driver') || PROMPT_TEMPLATES[0];
let selectedRatio = selectedTemplate.recommendedAspect || '4:5';
let uploadedPhotoName = '';
let uploadedPhotoDataUrl = '';
let generatedImageUrl = '';
let finalPayload = null;

function $(s, root=document) { return root.querySelector(s); }
function $$(s, root=document) { return Array.from(root.querySelectorAll(s)); }

function showToast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

(function particles(){
  const canvas = $('#particles-canvas'); if(!canvas) return;
  const ctx = canvas.getContext('2d'); let W,H,p=[];
  function resize(){ W=canvas.width=innerWidth; H=canvas.height=innerHeight; } resize();
  addEventListener('resize', resize);
  class P{
    constructor(){ this.reset(); }
    reset(){ this.x=Math.random()*W; this.y=Math.random()*H; this.vx=1.2+Math.random()*2.6; this.vy=-.15+Math.random()*.3; this.l=.35+Math.random()*.55; this.s=.5+Math.random()*1.4; this.c=Math.random()<.72?'232,0,45':'201,168,76'; }
    update(){ this.x+=this.vx; this.y+=this.vy; if(this.x>W+20||this.y<-20||this.y>H+20) this.reset(), this.x=-20; }
    draw(){ ctx.strokeStyle=`rgba(${this.c},${this.l})`; ctx.lineWidth=this.s; ctx.beginPath(); ctx.moveTo(this.x,this.y); ctx.lineTo(this.x-this.vx*8,this.y-this.vy*8); ctx.stroke(); }
  }
  for(let i=0;i<80;i++)p.push(new P());
  function loop(){ ctx.clearRect(0,0,W,H); p.forEach(x=>{x.update();x.draw();}); requestAnimationFrame(loop); } loop();
})();

(function nav(){
  const nb=$('#navbar'), hb=$('#hamburger'), mm=$('#mobile-menu'), sb=$('#nav-search-btn'), dr=$('#search-drawer'), sc=$('#search-close'), ov=$('#page-overlay');
  addEventListener('scroll',()=>nb?.classList.toggle('scrolled',scrollY>60),{passive:true});
  hb?.addEventListener('click',()=>{hb.classList.toggle('open');mm?.classList.toggle('open')});
  sb?.addEventListener('click',()=>dr?.classList.add('open'));
  sc?.addEventListener('click',()=>dr?.classList.remove('open'));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') dr?.classList.remove('open'); });
  document.querySelectorAll('a[href]').forEach(a=>{
    const h=a.getAttribute('href');
    if(!ov||!h||h.startsWith('#')||h.startsWith('http')||h.startsWith('mailto')) return;
    a.addEventListener('click',e=>{ e.preventDefault(); ov.classList.add('slide-in'); setTimeout(()=>location.href=h,420); });
  });
  addEventListener('load',()=>{ov?.classList.remove('slide-in');ov?.classList.add('slide-out');setTimeout(()=>ov?.classList.remove('slide-out'),500);});
  const badge=$('#cart-badge'); const cart=JSON.parse(sessionStorage.getItem('paddox_cart')||'[]');
  if(badge) badge.textContent = cart.reduce((s,x)=>s+(+x.qty||0),0);
})();

(function speedLines(){
  const c=$('#speed-lines'); if(!c) return;
  [{top:'18%',w:'44%',d:'0s',dur:'2.8s'},{top:'38%',w:'28%',d:'.7s',dur:'2.2s'},{top:'60%',w:'54%',d:'1.3s',dur:'3.2s'},{top:'78%',w:'34%',d:'.4s',dur:'2.6s'}]
  .forEach(cfg=>{const l=document.createElement('div');l.className='speed-line';l.style.cssText=`top:${cfg.top};width:${cfg.w};animation-delay:${cfg.d};animation-duration:${cfg.dur}`;c.appendChild(l);});
})();

function initReveal(){
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');obs.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -30px 0px'});
  $$('.reveal-up').forEach(el=>obs.observe(el));
}

function initials(name) {
  return String(name).split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase();
}

function escapeHtml(value = '') {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeDriverKey(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeLooseKey(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function normalizeWords(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const AI_DRIVER_ALIASES = {
  george_russell: ['george russell', 'russell', '63', 'rus'],
  kimi_antonelli: ['kimi antonelli', 'andrea kimi antonelli', 'antonelli', '12', 'ant'],
  charles_leclerc: ['charles leclerc', 'leclerc', '16', 'lec'],
  lewis_hamilton: ['lewis hamilton', 'hamilton', '44', 'ham'],
  lando_norris: ['lando norris', 'norris', '4', 'nor'],
  oscar_piastri: ['oscar piastri', 'piastri', '81', 'pia'],
  max_verstappen: ['max verstappen', 'verstappen', '1', 'ver'],
  isack_hadjar: ['isack hadjar', 'hadjar', '6', 'had'],
  pierre_gasly: ['pierre gasly', 'gasly', '10', 'gas'],
  franco_colapinto: ['franco colapinto', 'colapinto', '43', 'col'],
  liam_lawson: ['liam lawson', 'lawson', '30', 'law'],
  arvid_lindblad: ['arvid lindblad', 'lindblad', '41', 'lin'],
  esteban_ocon: ['esteban ocon', 'ocon', '31', 'oco'],
  oliver_bearman: ['oliver bearman', 'ollie bearman', 'bearman', '87', 'bea'],
  carlos_sainz: ['carlos sainz', 'carlos sainz jr', 'sainz', '55', 'sai'],
  alexander_albon: ['alexander albon', 'alex albon', 'albon', '23', 'alb'],
  nico_hulkenberg: ['nico hulkenberg', 'nico hülkenberg', 'hulkenberg', 'hülkenberg', '27', 'hul'],
  gabriel_bortoleto: ['gabriel bortoleto', 'bortoleto', '5', 'bor'],
  sergio_perez: ['sergio perez', 'sergio pérez', 'checo perez', 'checo pérez', 'perez', 'pérez', '11', 'per'],
  valtteri_bottas: ['valtteri bottas', 'bottas', '77', 'bot'],
  fernando_alonso: ['fernando alonso', 'alonso', '14', 'alo'],
  lance_stroll: ['lance stroll', 'stroll', '18', 'str']
};

function driverAliasKeys(driver = {}) {
  const raw = [
    driver.id,
    driver.name,
    driver.number,
    ...(AI_DRIVER_ALIASES[driver.id] || [])
  ];
  const keys = new Set();
  raw.filter(Boolean).forEach(value => {
    keys.add(String(value).toLowerCase());
    keys.add(normalizeDriverKey(value));
    keys.add(normalizeLooseKey(value));
    keys.add(normalizeWords(value));
  });
  return Array.from(keys).filter(Boolean);
}

function looksLikeImageUrl(value = '') {
  const v = String(value || '').trim();
  if (!v) return false;
  if (v.startsWith('data:image/')) return true;
  if (!/^https?:\/\//i.test(v)) return false;
  return /cloudinary|res\.cloudinary|media\.formula1|formula1|\.png|\.jpe?g|\.webp|\.avif|image\/upload/i.test(v);
}

function firstImageUrlDeep(value, depth = 0) {
  if (!value || depth > 6) return '';
  if (typeof value === 'string') return looksLikeImageUrl(value) ? value.trim() : '';
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstImageUrlDeep(item, depth + 1);
      if (found) return found;
    }
    return '';
  }
  if (typeof value === 'object') {
    const priority = [
      'secure_url','url','src','href','image','imageUrl','imageURL','driverImage','driverImageUrl',
      'profileImage','profileImageUrl','headshot','headshotUrl','photo','photoUrl','avatar','avatarUrl',
      'cloudinaryUrl','publicUrl','thumbnail','thumbnailUrl','picture','pictureUrl'
    ];
    for (const key of priority) {
      const found = firstImageUrlDeep(value[key], depth + 1);
      if (found) return found;
    }
    for (const child of Object.values(value)) {
      const found = firstImageUrlDeep(child, depth + 1);
      if (found) return found;
    }
  }
  return '';
}

function bestProfileString(obj = {}, keys = []) {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object') {
      const nested = bestProfileString(value, ['name','fullName','driverName','teamName','constructorName','value','label']);
      if (nested) return nested;
    }
  }
  return '';
}

function profileImageUrl(profile = {}) {
  return firstImageUrlDeep(profile);
}

function profileName(profile = {}) {
  return bestProfileString(profile, ['name','driverName','fullName','displayName']) ||
    `${bestProfileString(profile, ['firstName','givenName'])} ${bestProfileString(profile, ['lastName','familyName'])}`.trim();
}

function profileCode(profile = {}) {
  return bestProfileString(profile, ['code','abbreviation','shortCode','driverCode']).toLowerCase();
}

function collectProfilesFromResponse(data = {}) {
  const buckets = [
    data?.data?.profiles,
    data?.profiles,
    data?.data?.drivers,
    data?.drivers,
    data?.data?.standings,
    data?.standings,
    data?.data,
    data
  ];
  for (const bucket of buckets) {
    if (Array.isArray(bucket)) return bucket;
  }
  return [];
}

function buildProfileMap(profiles = []) {
  const map = new Map();
  profiles.forEach(profile => {
    const name = profileName(profile);
    const code = profileCode(profile);
    const number = bestProfileString(profile, ['number','driverNumber','permanentNumber','carNumber']);
    const familyName = bestProfileString(profile, ['lastName','familyName']);
    const givenName = bestProfileString(profile, ['firstName','givenName']);
    const keys = [
      profile.driverKey,
      profile.slug,
      profile.id,
      profile._id,
      code,
      number,
      name,
      familyName,
      `${givenName} ${familyName}`.trim(),
      normalizeDriverKey(name),
      normalizeLooseKey(name),
      normalizeWords(name),
      normalizeLooseKey(familyName)
    ].filter(Boolean);
    keys.forEach(key => map.set(String(key).toLowerCase(), profile));
  });
  return map;
}

function findProfileForDriver(driver = {}, profileMap = new Map()) {
  const keys = driverAliasKeys(driver).map(k => String(k).toLowerCase());
  for (const key of keys) {
    if (profileMap.has(key)) return profileMap.get(key);
  }

  const aliases = new Set(driverAliasKeys(driver).map(normalizeLooseKey));
  for (const profile of profileMap.values()) {
    const name = profileName(profile);
    const code = profileCode(profile);
    const number = bestProfileString(profile, ['number','driverNumber','permanentNumber','carNumber']);
    const profileKeys = [name, code, number, normalizeWords(name), normalizeLooseKey(name)];
    if (profileKeys.some(k => aliases.has(normalizeLooseKey(k)))) return profile;
  }
  return null;
}

async function fetchJsonSafe(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'Request failed');
    return data;
  } catch (err) {
    console.warn('AI Studio image source unavailable:', url, err);
    return null;
  }
}

async function syncCloudinaryDriverImages() {
  const profileData = await fetchJsonSafe(AI_DRIVER_PROFILE_API);
  const f1Data = await fetchJsonSafe(AI_F1_DRIVERS_API);

  const adminProfiles = collectProfilesFromResponse(profileData || {});
  const f1Profiles = collectProfilesFromResponse(f1Data || {});

  const adminMap = buildProfileMap(adminProfiles);
  const f1Map = buildProfileMap(f1Profiles);

  ACTIVE_AI_DRIVERS = AI_DRIVERS.map(driver => {
    const adminProfile = findProfileForDriver(driver, adminMap);
    const f1Profile = findProfileForDriver(driver, f1Map);

    const adminImage = profileImageUrl(adminProfile || {});
    const f1Image = profileImageUrl(f1Profile || {});
    const image = adminImage || f1Image || '';

    const team = bestProfileString(adminProfile || f1Profile || {}, ['team','teamName','constructor','constructorName']) || driver.team;

    return {
      ...driver,
      image,
      team,
      imageSource: adminImage ? 'cloudinary-admin' : f1Image ? 'f1-api' : 'initials-fallback'
    };
  });

  selectedDriver = ACTIVE_AI_DRIVERS.find(d => d.id === selectedDriver?.id) || ACTIVE_AI_DRIVERS[0];
  renderAll();

  const cloudinaryCount = ACTIVE_AI_DRIVERS.filter(d => d.imageSource === 'cloudinary-admin').length;
  const apiCount = ACTIVE_AI_DRIVERS.filter(d => d.imageSource === 'f1-api').length;
  if (cloudinaryCount || apiCount) {
    showToast(`Driver images synced: ${cloudinaryCount} Cloudinary + ${apiCount} fallback`);
  } else {
    showToast('Driver profile images missing. Add them in Admin Fan Drivers.');
  }
}

function driverImageHTML(driver = {}) {
  const image = driver.image || '';
  const fallback = initials(driver.name);
  if (image && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:image/'))) {
    return `<img src="${escapeHtml(image)}" alt="${escapeHtml(driver.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML='<span>${fallback}</span>'">`;
  }
  return `<span>${fallback}</span>`;
}

function renderDrivers(filter='') {
  const grid = $('#driver-grid');
  if(!grid) return;
  const q = filter.toLowerCase();
  grid.innerHTML = ACTIVE_AI_DRIVERS.filter(d => !q || d.name.toLowerCase().includes(q) || d.team.toLowerCase().includes(q)).map(d => `
    <button class="driver-card ${selectedDriver?.id===d.id?'on':''}" data-driver="${d.id}" style="--driver-accent:${d.accentColor}">
      <div class="driver-img ${d.imageSource === 'cloudinary-admin' ? 'has-cloudinary' : d.imageSource === 'f1-api' ? 'has-api-image' : ''}">${driverImageHTML(d)}</div>
      <strong>${escapeHtml(d.name)}</strong>
      <small>${escapeHtml(d.team)} · #${escapeHtml(d.number)}</small>
      <span class="driver-num">${escapeHtml(d.number)}</span>
    </button>
  `).join('');
  $$('[data-driver]').forEach(btn => btn.addEventListener('click', () => {
    selectedDriver = ACTIVE_AI_DRIVERS.find(d => d.id === btn.dataset.driver);
    selectedRatio = selectedTemplate?.recommendedAspect || selectedRatio;
    renderAll();
  }));
}

function categoryLabel(cat) {
  return {
    'all':'All','team-identity':'Team Identity','pit-lane':'Pit Lane','helmet-cockpit':'Helmet','podium':'Podium','fan-driver':'Fan + Driver','social':'Social','premium':'Premium','wallpaper':'Wallpaper','driver-only':'Car Shots'
  }[cat] || cat;
}

function renderTemplateTabs() {
  const tabs = $('#template-tabs'); if(!tabs) return;
  const cats = ['all', ...new Set(PROMPT_TEMPLATES.map(t => t.category))];
  const current = tabs.dataset.current || 'all';
  tabs.innerHTML = cats.map(c => `<button class="template-tab ${current===c?'on':''}" data-cat="${c}">${categoryLabel(c)}</button>`).join('');
  $$('[data-cat]').forEach(b => b.addEventListener('click', () => {
    tabs.dataset.current = b.dataset.cat;
    renderTemplateTabs();
    renderTemplates();
  }));
}

function renderTemplates() {
  const grid = $('#template-grid'); if(!grid) return;
  const current = $('#template-tabs')?.dataset.current || 'all';
  const list = PROMPT_TEMPLATES.filter(t => current === 'all' || t.category === current);
  grid.innerHTML = list.map(t => `
    <button class="template-card ${selectedTemplate?.id===t.id?'on':''}" data-template="${t.id}">
      <div class="template-thumb"></div>
      <strong>${t.title}</strong>
      <p>${categoryLabel(t.category)} · ${t.realism}</p>
      <div class="badge-row">
        <span class="mini-badge gold">${t.creditCost} Credits</span>
        <span class="mini-badge">${t.recommendedAspect}</span>
        ${t.requiresUserPhoto ? '<span class="mini-badge photo-badge">Photo Required</span>' : ''}
      </div>
    </button>
  `).join('');
  $$('[data-template]').forEach(btn => btn.addEventListener('click', () => {
    selectedTemplate = PROMPT_TEMPLATES.find(t => t.id === btn.dataset.template);
    selectedRatio = selectedTemplate.recommendedAspect || '4:5';
    renderAll();
  }));
}

function renderRatios() {
  const grid = $('#ratio-grid'); if(!grid) return;
  grid.innerHTML = RATIOS.map(r => `
    <button class="ratio-card ${selectedRatio===r.id?'on':''}" data-ratio="${r.id}">
      <strong>${r.id}</strong><span>${r.title}</span><span>${r.note}</span>
    </button>
  `).join('');
  $$('[data-ratio]').forEach(btn => btn.addEventListener('click', () => { selectedRatio = btn.dataset.ratio; renderAll(); }));
}

function renderFeatured() {
  const grid = $('#featured-template-grid'); if(!grid) return;
  const picks = ['night_selfie_driver','pit_lane_walk','helmet_closeup','podium_winner','championship_poster','minimal_wallpaper'];
  grid.innerHTML = picks.map(id => PROMPT_TEMPLATES.find(t => t.id === id)).filter(Boolean).map(t => `
    <div class="featured-card">
      <h3>${t.title}</h3>
      <p>${categoryLabel(t.category)} · ${t.creditCost} Credits · ${t.recommendedAspect}</p>
      <button class="use-template" data-use-template="${t.id}">Use Template</button>
    </div>
  `).join('');
  $$('[data-use-template]').forEach(btn => btn.addEventListener('click', () => {
    selectedTemplate = PROMPT_TEMPLATES.find(t => t.id === btn.dataset.useTemplate);
    selectedRatio = selectedTemplate.recommendedAspect;
    location.hash = '#studio';
    renderAll();
  }));
}

function formValue(id, fallback='') {
  return $(id)?.value?.trim() || fallback;
}

function compactPrompt(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .trim();
}

function cleanPromptLine(text) {
  return compactPrompt(text).replace(/\s+([:.])/g, '$1');
}

function promptSection(title, body) {
  const cleanBody = Array.isArray(body)
    ? body.filter(Boolean).map(cleanPromptLine).join('\n')
    : cleanPromptLine(body);
  return `${title}:\n${cleanBody}`;
}

function aspectLabel(ratio) {
  const map = {
    '1:1': 'square social post, 1:1 aspect ratio',
    '4:5': 'portrait poster, 4:5 aspect ratio',
    '9:16': 'vertical story or mobile wallpaper, 9:16 aspect ratio',
    '16:9': 'cinematic widescreen or desktop wallpaper, 16:9 aspect ratio',
    '21:9': 'ultra-wide banner, 21:9 aspect ratio'
  };
  return map[ratio] || `${ratio} aspect ratio`;
}

function buildFanIdentityLines(fanName, fanTagline, fanCountry, customNumber) {
  if(!selectedTemplate?.requiresUserPhoto) {
    return [
      `Fan text layer only: include fan name ${fanName || 'the fan'} only if the composition has clean readable poster text.`,
      `Optional fan details: tagline ${fanTagline || 'Born for the paddock'}, country ${fanCountry || 'India'}, fan number ${customNumber || selectedDriver.number}.`,
      'Do not create random extra people unless the selected scene/template clearly requires a fan subject.'
    ];
  }
  return [
    'Use the uploaded fan photo as the primary identity reference.',
    'Preserve the exact fan face, bone structure, jawline, nose shape, eye shape, eyebrow thickness, lip shape, skin tone, skin texture, forehead, cheekbones, chin, hairstyle, facial hair if any, and every visible accessory.',
    'Replicate earrings, piercings, glasses, chains, tattoos, moles, scars, freckles, caps, headbands, and other visible details from the uploaded fan photo with high accuracy.',
    'Do not replace the fan with another person and do not beautify into a different identity.',
    `Fan display name: ${fanName || 'the fan'}.`,
    `Fan tagline: ${fanTagline || 'Born for the paddock'}.`,
    `Fan country: ${fanCountry || 'India'}.`,
    `Fan number: ${customNumber || selectedDriver.number}.`
  ];
}

function buildDriverIdentityLines() {
  return [
    `Selected current-grid driver: ${selectedDriver.name}.`,
    `Racing number: ${selectedDriver.number}.`,
    `Team: ${selectedDriver.team}.`,
    `Driver visual description: ${selectedDriver.faceDescription}.`,
    'Driver must look recognizable, realistic, naturally expressive, and proportionally accurate.',
    `Team theme: ${selectedDriver.teamTheme}.`,
    `Team garage atmosphere: ${selectedDriver.garageDescription}.`,
    `Racing suit: ${selectedDriver.racingSuitDescription}.`
  ];
}

function buildRealismLines() {
  return [
    'Photorealistic and hyper-realistic motorsport photography.',
    'Natural human skin texture, realistic fabric stitching, realistic helmet and visor materials, correct depth of field, authentic lens behavior, cinematic but believable lighting, sharp subject focus, high dynamic range, and premium sports editorial finish.',
    'Avoid cartoon, anime, illustration, toy-like proportions, plastic skin, over-smoothed face, distorted fingers, extra limbs, duplicate faces, wrong team colors, unreadable random text, fake low-quality logos, messy sponsor text, watermark artifacts, and blurry identity.'
  ];
}

function isSelfieTemplate() {
  return selectedTemplate?.id === 'night_selfie_driver';
}

function buildSelfieCompositionLines() {
  return [
    'TRUE SELFIE LOCK: This must look like a real smartphone selfie captured by the taller fan, not a third-person editorial portrait.',
    'Camera position: arm-length distance, slightly above face level, front-camera/iPhone-style perspective.',
    'Framing: tight close-up from shoulders or chest upward; both faces must be large, near the lens, and fill most of the frame.',
    'Eye contact: both the fan and selected driver must look directly into the phone camera.',
    'Lens behavior: slight wide-angle selfie distortion, subtle built-in flash, candid imperfect crop, and natural handheld motion energy.',
    'Body language: fan on the left is slightly taller, smiling, arm around the driver, with the other arm implied extended toward camera holding the phone; driver on the right is slightly shorter, relaxed smile, arm around fan.',
    'Do NOT create a full-body garage portrait, distant photographer shot, media-day pose, magazine cover, or third-person documentary image.'
  ];
}

function buildPrompt() {
  if(!selectedDriver || !selectedTemplate) return '';
  const fanName = formValue('#fan-name','the fan');
  const fanTagline = formValue('#fan-tagline','Born for the paddock');
  const fanCountry = formValue('#fan-country','India');
  const customNumber = formValue('#custom-number', selectedDriver.number);
  const map = {
    '{driver_name}': selectedDriver.name,
    '{team_name}': selectedDriver.team,
    '{driver_number}': selectedDriver.number,
    '{driver_face_description}': selectedDriver.faceDescription,
    '{racing_suit_description}': selectedDriver.racingSuitDescription,
    '{team_theme}': selectedDriver.teamTheme,
    '{team_color}': selectedDriver.accentColor,
    '{garage_description}': selectedDriver.garageDescription,
    '{fan_name}': fanName,
    '{fan_tagline}': fanTagline,
    '{fan_country}': fanCountry,
    '{custom_number}': customNumber,
    '{aspect_ratio}': selectedRatio
  };
  let corePrompt = selectedTemplate.prompt;
  Object.entries(map).forEach(([k,v]) => corePrompt = corePrompt.split(k).join(v));

  const sections = [
    promptSection('PADDOX AI STUDIO REQUEST', [
      `Template: ${selectedTemplate.title}.`,
      `Category: ${categoryLabel(selectedTemplate.category)}.`,
      `Output format: ${aspectLabel(selectedRatio)}.`,
      `Realism mode: ${selectedTemplate.realism || 'Hyper-realistic'}.`
    ]),
    promptSection('SCENE', corePrompt),
    promptSection('FAN IDENTITY LOCK', buildFanIdentityLines(fanName, fanTagline, fanCountry, customNumber)),
    promptSection('CURRENT GRID DRIVER IDENTITY', buildDriverIdentityLines()),
    ...(isSelfieTemplate() ? [promptSection('SELFIE COMPOSITION LOCK', buildSelfieCompositionLines())] : []),
    promptSection('COMPOSITION AND OUTPUT', [
      `Use ${aspectLabel(selectedRatio)}.`,
      isSelfieTemplate()
        ? 'Keep the image premium, sharp, realistic, candid, and phone-selfie believable.'
        : 'Keep the image premium, sharp, realistic, cinematic, and social-media-ready.',
      isSelfieTemplate()
        ? 'Use authentic smartphone front-camera composition with believable human proportions.'
        : 'Use clean professional sports photography composition with believable human proportions.'
    ]),
    promptSection('QUALITY AND REALISM LOCK', buildRealismLines())
  ];

  return sections.join('\n\n');
}

function buildPayload() {
  const prompt = buildPrompt();
  return {
    phase: 'A4.11G.2',
    mode: 'gemini-ready-realistic-prompt-payload',
    providerTarget: 'gemini-image-generation',
    promptVersion: 'paddox-realistic-v1.2-selfie-composition-lock',
    driver: {
      id: selectedDriver.id,
      name: selectedDriver.name,
      team: selectedDriver.team,
      number: selectedDriver.number,
      image: selectedDriver.image || '',
      imageSource: selectedDriver.imageSource || 'cloudinary-or-fallback',
      faceDescription: selectedDriver.faceDescription,
      racingSuitDescription: selectedDriver.racingSuitDescription,
      garageDescription: selectedDriver.garageDescription,
      teamTheme: selectedDriver.teamTheme,
      accentColor: selectedDriver.accentColor,
      secondaryColor: selectedDriver.secondaryColor
    },
    template: {
      id: selectedTemplate.id,
      title: selectedTemplate.title,
      category: selectedTemplate.category,
      creditCost: selectedTemplate.creditCost,
      requiresUserPhoto: selectedTemplate.requiresUserPhoto,
      recommendedAspect: selectedTemplate.recommendedAspect,
      realism: selectedTemplate.realism || 'Hyper-realistic'
    },
    fan: {
      name: formValue('#fan-name',''),
      tagline: formValue('#fan-tagline',''),
      country: formValue('#fan-country',''),
      customNumber: formValue('#custom-number', selectedDriver.number),
      uploadedPhotoName,
      photoRequired: selectedTemplate.requiresUserPhoto
    },
    output: {
      aspectRatio: selectedRatio,
      aspectLabel: aspectLabel(selectedRatio),
      quality: 'photorealistic-hyperrealistic',
      style: 'premium motorsport editorial photography'
    },
    references: {
      fanPhoto: uploadedPhotoName ? { type: 'user-upload', fileName: uploadedPhotoName, role: 'primary identity reference' } : null,
      driverImage: selectedDriver.image ? { type: selectedDriver.imageSource || 'driver-profile', url: selectedDriver.image, role: 'driver visual reference' } : null
    },
    instructions: {
      preserveFanFace: !!selectedTemplate.requiresUserPhoto,
      preserveDriverRecognition: true,
      useCurrentGridDriverData: true,
      useTeamSuitDescription: true,
      avoidStyle: ['cartoon', 'anime', 'illustration', 'plastic skin', 'wrong team colors', 'distorted face', 'extra limbs']
    },
    prompt,
    promptFormat: 'sectioned-readable-text',
    promptSections: isSelfieTemplate() ? ['request','scene','fan_identity_lock','current_grid_driver_identity','selfie_composition_lock','composition_and_output','quality_and_realism_lock'] : ['request','scene','fan_identity_lock','current_grid_driver_identity','composition_and_output','quality_and_realism_lock'],
    createdAt: new Date().toISOString()
  };
}

function renderSummary() {
  const el = $('#summary-lines'); if(!el) return;
  el.innerHTML = [
    ['Driver', selectedDriver?.name || '—'],
    ['Team', selectedDriver?.team || '—'],
    ['Template', selectedTemplate?.title || '—'],
    ['Format', selectedRatio],
    ['Cost', `${selectedTemplate?.creditCost || 0} Credits`],
    ['Photo', selectedTemplate?.requiresUserPhoto ? (uploadedPhotoName || 'Required') : 'Optional']
  ].map(([a,b]) => `<div class="summary-line"><span>${a}</span><b>${b}</b></div>`).join('');
}

function renderPreview() {
  const frame = $('#preview-frame');
  if(frame) {
    frame.style.setProperty('--preview-glow', hexToRgba(selectedDriver?.accentColor || '#e8002d', .25));
  }
  const pd = $('#preview-driver'), pt = $('#preview-template'), pr = $('#preview-ratio');
  if(pd) pd.textContent = selectedDriver?.name || 'Select Driver';
  if(pt) pt.textContent = `${selectedDriver?.team || 'Team'} · ${selectedTemplate?.title || 'Template'}`;
  if(pr) pr.textContent = selectedRatio;
  const creditsLabel = backendCreditsLoaded ? getCredits() : (getAccessToken() ? '...' : getCredits());
  $('#credit-balance') && ($('#credit-balance').textContent = creditsLabel);
  $('#hero-credit-count') && ($('#hero-credit-count').textContent = creditsLabel);
  $('#upload-box')?.classList.toggle('need-photo', !!selectedTemplate?.requiresUserPhoto);
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#','');
  const bigint = parseInt(h.length === 3 ? h.split('').map(x=>x+x).join('') : h, 16);
  const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function getCredits() {
  if (Number.isFinite(Number(backendAiCredits))) return Math.max(0, Math.round(Number(backendAiCredits)));
  return Number(localStorage.getItem('paddox_ai_credits') || 0);
}

function setCredits(v) {
  const safe = Math.max(0, Math.round(Number(v) || 0));
  backendAiCredits = safe;
  backendCreditsLoaded = true;
  localStorage.setItem('paddox_ai_credits', String(safe));
}

function setCreditsLoading() {
  const hero = $('#hero-credit-count');
  const wallet = $('#credit-balance');
  if (hero && !backendCreditsLoaded) hero.textContent = '...';
  if (wallet && !backendCreditsLoaded) wallet.textContent = '...';
}

async function syncRealAiCredits(silent = false) {
  const token = getAccessToken();
  if (!token) {
    backendCreditsLoaded = false;
    if (!silent) showToast('Login to sync PADDOX AI Credits.');
    renderPreview();
    return null;
  }

  try {
    setCreditsLoading();
    const response = await aiStudioAuthFetch(AI_STUDIO_CREDITS_API, { method: 'GET' });
    const data = response.data || response || {};
    const credits = Number(data.aiCredits ?? data.user?.aiCredits ?? data.credits);
    if (Number.isFinite(credits)) {
      setCredits(credits);
      renderPreview();
      return credits;
    }
    throw new Error('AI credits not found in profile response');
  } catch (err) {
    console.warn('PADDOX AI credits sync failed:', err);
    backendCreditsLoaded = false;
    renderPreview();
    if (!silent) showToast('Could not sync backend AI Credits. Try refreshing after login.');
    return null;
  }
}

async function generatePrompt() {
  if(!selectedDriver) return showToast('Please select a driver first.');
  if(!selectedTemplate) return showToast('Please choose a realistic template.');
  if(selectedTemplate.requiresUserPhoto && !uploadedPhotoDataUrl) {
    return showToast('This realistic fan-face template needs a fan photo.');
  }

  const btn = $('#generate-btn');
  const originalText = btn?.textContent || 'Generate Image';
  try {
    finalPayload = buildPayload();
    $('#final-prompt').value = finalPayload.prompt;

    const liveCredits = await syncRealAiCredits(true);
    const creditsToCheck = Number.isFinite(Number(liveCredits)) ? Number(liveCredits) : getCredits();

    /* H.1 fix: only block using synced backend credits. The backend is still the final authority. */
    if(Number.isFinite(creditsToCheck) && creditsToCheck < selectedTemplate.creditCost) {
      $('#result-status').textContent = `Backend AI Credits: ${creditsToCheck}. Required: ${selectedTemplate.creditCost}.`;
      return showToast('You need more PADDOX Credits. Refresh Account/Admin if you just changed credits.');
    }

    if(btn) {
      btn.disabled = true;
      btn.textContent = 'Generating Image...';
      btn.classList.add('is-loading');
    }

    $('#result-status').textContent = 'Generating with Gemini. If Gemini fails, no credits will be deducted...';
    showToast('Generating with Gemini...');

    const response = await aiStudioAuthFetch(AI_STUDIO_GENERATE_API, {
      method: 'POST',
      body: JSON.stringify({
        payload: finalPayload,
        prompt: finalPayload.prompt,
        photoDataUrl: uploadedPhotoDataUrl || '',
        cost: selectedTemplate.creditCost,
        aspectRatio: selectedRatio
      })
    });

    const data = response.data || response;
    const imageUrl = data.image?.url || data.image?.dataUri || data.poster?.image?.url || '';
    if(!imageUrl) throw new Error('Gemini response did not include an image.');

    generatedImageUrl = imageUrl;
    renderGeneratedImage(imageUrl, data);
    setCredits(Number(data.aiCredits ?? Math.max(0, getCredits() - selectedTemplate.creditCost)));
    renderPreview();

    $('#result-status').textContent = `GEMINI image generated successfully using ${data.model || 'image model'}.`;
    $('#copy-prompt-btn').disabled = false;
    $('#download-payload').disabled = false;
    $('#download-text-prompt') && ($('#download-text-prompt').disabled = false);
    $('#copy-json-btn') && ($('#copy-json-btn').disabled = false);
    $('#save-creation').disabled = false;
    $('#download-generated-image') && ($('#download-generated-image').disabled = false);

    showToast('Gemini image ready.');
  } catch (err) {
    console.error('PADDOX image generation failed:', err);
    handleProviderGenerationError(err);
    await syncRealAiCredits(true);
  } finally {
    if(btn) {
      btn.disabled = false;
      btn.textContent = originalText;
      btn.classList.remove('is-loading');
    }
  }
}

function renderGeneratedImage(imageUrl, meta = {}) {
  const frame = $('#preview-frame');
  if(!frame) return;

  let img = $('#generated-image');
  if(!img) {
    img = document.createElement('img');
    img.id = 'generated-image';
    img.className = 'generated-image';
    img.alt = 'Generated PADDOX AI artwork';
    frame.appendChild(img);
  }
  img.src = imageUrl;
  frame.classList.add('has-generated-image');

  const wm = frame.querySelector('.preview-watermark');
  if(wm) wm.textContent = 'GEMINI OUTPUT';

  const pd = $('#preview-driver');
  const pt = $('#preview-template');
  const pr = $('#preview-ratio');
  if(pd) pd.textContent = selectedDriver?.name || 'Generated';
  if(pt) pt.textContent = `${selectedTemplate?.title || 'Template'} · gemini-only`;
  if(pr) pr.textContent = selectedRatio;
}

function downloadGeneratedImage() {
  if(!generatedImageUrl) return showToast('Generate an image first.');
  const a = document.createElement('a');
  a.href = generatedImageUrl;
  a.download = `paddox-ai-${selectedDriver.id}-${selectedTemplate.id}.png`;
  a.click();
}


function copyPrompt() {
  const txt = $('#final-prompt')?.value;
  if(!txt) return;
  navigator.clipboard?.writeText(txt).then(() => showToast('Sectioned final prompt copied.'));
}

function copyPayloadJson() {
  if(!finalPayload) finalPayload = buildPayload();
  navigator.clipboard?.writeText(JSON.stringify(finalPayload, null, 2)).then(() => showToast('Payload JSON copied.'));
}

function downloadTextPrompt() {
  const prompt = $('#final-prompt')?.value || buildPrompt();
  const blob = new Blob([prompt], {type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `paddox-ai-${selectedDriver.id}-${selectedTemplate.id}-prompt.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadPayload() {
  if(!finalPayload) finalPayload = buildPayload();
  const blob = new Blob([JSON.stringify(finalPayload, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `paddox-ai-${selectedDriver.id}-${selectedTemplate.id}-payload.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function saveCreation() {
  if(!finalPayload) finalPayload = buildPayload();
  const list = JSON.parse(localStorage.getItem('paddox_ai_creations') || '[]');
  list.unshift(finalPayload);
  localStorage.setItem('paddox_ai_creations', JSON.stringify(list.slice(0,8)));
  renderCreations();
  showToast('Saved to local AI Creations.');
}

function renderCreations() {
  const grid = $('#recent-grid'); if(!grid) return;
  const list = JSON.parse(localStorage.getItem('paddox_ai_creations') || '[]');
  if(!list.length) {
    grid.innerHTML = '<div class="empty-creation">No creations yet. Prepare your first PADDOX AI generation.</div>';
    return;
  }
  grid.innerHTML = list.map(x => `
    <div class="creation-card">
      <h3>${x.template?.title || 'PADDOX AI Creation'}</h3>
      <p>${x.driver?.name || 'Driver'} · ${x.driver?.team || 'Team'} · ${x.output?.aspectRatio || '4:5'}</p>
      <p>${new Date(x.createdAt).toLocaleString()}</p>
    </div>
  `).join('');
}

function renderAll() {
  renderDrivers($('#driver-search')?.value || '');
  renderTemplateTabs();
  renderTemplates();
  renderRatios();
  renderSummary();
  renderPreview();
}

function initUploads() {
  $('#upload-trigger')?.addEventListener('click', () => $('#fan-photo')?.click());
  $('#fan-photo')?.addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if(!file) return;
    uploadedPhotoName = file.name;
    uploadedPhotoDataUrl = '';
    const img = $('#photo-preview');
    img.src = URL.createObjectURL(file);
    img.style.display = 'block';
    $('#upload-note').textContent = `${file.name} — preparing reference...`;
    try {
      uploadedPhotoDataUrl = await fileToDataUrl(file);
      $('#upload-note').textContent = `${file.name} — ready for Gemini`;
      showToast('Fan photo ready for Gemini reference.');
    } catch (err) {
      $('#upload-note').textContent = 'Could not read the uploaded photo.';
      showToast(err.message || 'Photo upload failed');
    }
    renderSummary();
  });
}

function initFormListeners() {
  ['#fan-name','#fan-tagline','#fan-country','#custom-number'].forEach(id => $(id)?.addEventListener('input', renderSummary));
  $('#driver-search')?.addEventListener('input', e => renderDrivers(e.target.value));
  $('#generate-btn')?.addEventListener('click', generatePrompt);
  $('#copy-prompt-btn')?.addEventListener('click', copyPrompt);
  $('#download-payload')?.addEventListener('click', downloadPayload);
  $('#download-text-prompt')?.addEventListener('click', downloadTextPrompt);
  $('#copy-json-btn')?.addEventListener('click', copyPayloadJson);
  $('#save-creation')?.addEventListener('click', saveCreation);
  $('#download-generated-image')?.addEventListener('click', downloadGeneratedImage);
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initUploads();
  initFormListeners();
  renderFeatured();
  renderCreations();
  renderAll();
  syncCloudinaryDriverImages();
  syncRealAiCredits(true);
});
