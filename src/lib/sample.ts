import type { SiteSettings, ServiceLite, TownFull, Review, Post } from './types';

// Representative content so templates render before Sanity is seeded. Marked
// clearly as sample; content.ts prefers real Sanity data when available.

export const sampleSite: SiteSettings = {
  businessName: 'Premium Roofing Solutions',
  licenseNumber: 'Suffolk County HIC #HI-63847',
  dcaVerifyUrl: 'https://www.suffolkcountyny.gov/consumeraffairs',
  phone: '(631) 555-0142',
  phoneHref: 'tel:+16315550142',
  email: 'office@example.com',
  addressLine: 'Serving western & central Suffolk County, NY',
};

const p = (d: string) => d; // svg path passthrough for readability

export const sampleServices: ServiceLite[] = [
  { name: 'Roof Replacement', slug: 'roof-replacement', category: 'standard', isEmergencyCluster: false,
    summary: 'Full tear-off and re-roof with itemized, town-level pricing — no surprise line items.',
    icon: p('M3 11l9-7 9 7M5 10v10h14V10') },
  { name: 'Roof Repair', slug: 'roof-repair', category: 'standard', isEmergencyCluster: false,
    summary: 'Targeted repairs for flashing, shingles, and wear — fixed right, documented in writing.',
    icon: p('M14 7l3 3-8 8-3-3zM14 7l2-2a2.8 2.8 0 014 4l-2 2') },
  { name: 'Emergency Roof Repair', slug: 'emergency-roof-repair', category: 'urgent', isEmergencyCluster: true,
    summary: 'Active failure? We book a free inspection fast and tarp to stop the damage.',
    icon: p('M12 3l9 16H3zM12 10v4M12 17v.5') },
  { name: 'Storm Damage Repair', slug: 'storm-damage-roof-repair', category: 'urgent', isEmergencyCluster: true,
    summary: 'Nor’easter and wind damage assessment with honest, documented findings.',
    icon: p('M4 14h9l-2 6M13 4l-2 6h6l-6 10') },
  { name: 'Roof Leak Repair', slug: 'roof-leak-repair', category: 'urgent', isEmergencyCluster: true,
    summary: 'We trace the real source of the leak — not just the stain — and prove the fix.',
    icon: p('M12 3s6 7 6 11a6 6 0 11-12 0c0-4 6-11 6-11z') },
  { name: 'Flat & Low-Slope Roofing', slug: 'flat-low-slope-roofing', category: 'standard', isEmergencyCluster: false,
    summary: 'EPDM, TPO and modified-bitumen systems for porches, additions and commercial.',
    icon: p('M3 8h18v8H3zM3 12h18') },
  { name: 'Metal Roofing', slug: 'metal-roofing', category: 'standard', isEmergencyCluster: false,
    summary: 'Standing-seam and metal systems built for coastal wind and salt exposure.',
    icon: p('M4 20l4-16M10 20l4-16M16 20l4-16') },
  { name: 'Roof Inspection', slug: 'roof-inspection', category: 'standard', isEmergencyCluster: false,
    summary: 'A documented, photo-backed inspection — the honest starting point for any decision.',
    icon: p('M11 4a7 7 0 105 12l4 4M11 4a7 7 0 015 12') },
];

const replacementPricing = [
  { band: 'small' as const, bandLabel: 'Up to 1,500 sq ft', low: 12000, high: 18500 },
  { band: 'medium' as const, bandLabel: '1,500–2,500 sq ft', low: 18500, high: 28000 },
  { band: 'large' as const, bandLabel: '2,500+ sq ft', low: 28000, high: 46000 },
];

export const sampleTowns: TownFull[] = [
  {
    name: 'Huntington', slug: 'huntington', advertisingAllowed: true,
    blurb: 'From the Cold Spring Harbor line to Huntington Bay, we know the older colonials, steep slopes, and tree-canopy wear that define Huntington roofs.',
    depth: {
      buildingDepartment: { streetAddress: '100 Main St, Huntington, NY 11743', phone: '(631) 351-3000', counterHours: 'Mon–Fri 8:30a–4p', filingMethod: 'e-file or in person' },
      permit: { requiredForReroof: true, fee: '$150 + $10/sq', turnaroundBusinessDays: 10 },
      historicOverlay: { applies: true, details: 'Old Town / Village Green district requires review for street-visible roof changes.' },
      housingStock: { era: '1920s–1960s', type: 'Colonials & capes', typicalRoofSquares: 22 },
      localConditions: ['Heavy tree canopy (moss & debris)', 'North Shore wind exposure near the bay'],
      namedStreets: ['New York Ave', 'Park Ave', 'Woodbury Rd', 'Vineyard Rd'],
      hamlets: ['Huntington Station', 'Cold Spring Harbor', 'Halesite'],
      landmarks: ['Heckscher Park', 'Huntington Harbor'],
    },
    pricing: replacementPricing,
    faqs: [
      { question: 'Do I need a permit to reroof in Huntington?', answer: 'Yes — a Town of Huntington building permit is required for a re-roof; typical turnaround is about 10 business days.' },
      { question: 'Is my home in a historic district?', answer: 'Homes near the Old Town Green may require design review for street-visible changes. We check before we quote.' },
    ],
  },
  {
    name: 'Smithtown', slug: 'smithtown', advertisingAllowed: true,
    blurb: 'Smithtown’s mix of mid-century ranches and newer colonials means real variety in roof size and pitch — we price by your actual home, not an average.',
    depth: {
      buildingDepartment: { streetAddress: '99 W Main St, Smithtown, NY 11787', phone: '(631) 360-7500', counterHours: 'Mon–Fri 9a–4p', filingMethod: 'in person' },
      permit: { requiredForReroof: true, fee: '$125 base', turnaroundBusinessDays: 14 },
      historicOverlay: { applies: false },
      housingStock: { era: '1950s–1980s', type: 'Ranches & colonials', typicalRoofSquares: 20 },
      localConditions: ['Nissequogue River flood zones on the north end', 'Mature oak debris load'],
      namedStreets: ['Main St', 'Landing Ave', 'Terry Rd', 'Meadow Rd'],
      hamlets: ['St. James', 'Nesconset', 'Kings Park'],
      landmarks: ['Whisper the Bull statue', 'Caleb Smith State Park'],
    },
    pricing: replacementPricing,
    faqs: [
      { question: 'How long does a Smithtown re-roof permit take?', answer: 'Plan on roughly two weeks (about 14 business days) for the Town of Smithtown permit.' },
      { question: 'Do you handle flood-zone homes near the river?', answer: 'Yes. Flood-zone status affects paperwork, not the roof itself — we flag it up front.' },
    ],
  },
  {
    name: 'Babylon', slug: 'babylon', advertisingAllowed: true,
    blurb: 'South-shore salt air and wind are hard on roofs. In Babylon we spec systems and fasteners for the coastal exposure your home actually sees.',
    depth: {
      buildingDepartment: { streetAddress: '200 E Sunrise Hwy, Lindenhurst, NY 11757', phone: '(631) 957-3000', counterHours: 'Mon–Fri 9a–4p', filingMethod: 'e-file or in person' },
      permit: { requiredForReroof: true, fee: '$140 + fees', turnaroundBusinessDays: 12 },
      historicOverlay: { applies: false },
      housingStock: { era: '1950s–1970s', type: 'Capes & split-levels', typicalRoofSquares: 18 },
      localConditions: ['Coastal salt air & wind uplift', 'FEMA flood zones near the Great South Bay'],
      namedStreets: ['Deer Park Ave', 'Montauk Hwy', 'Little East Neck Rd'],
      hamlets: ['West Babylon', 'North Babylon', 'Lindenhurst'],
      landmarks: ['Argyle Lake', 'Cedar Beach'],
    },
    pricing: replacementPricing,
    faqs: [
      { question: 'Does salt air really affect my roof?', answer: 'On the south shore, yes — we use corrosion-appropriate fasteners and wind-rated installation near the bay.' },
      { question: 'Can you work with my flood-zone requirements?', answer: 'Absolutely. We’re used to Babylon’s coastal paperwork and build to the wind exposure your block sees.' },
    ],
  },
  {
    name: 'Islip', slug: 'islip', advertisingAllowed: true,
    blurb: 'From Islip Terrace to the Great South Bay shoreline, we build for the wind and moisture exposure that bay-front roofs actually see.',
    depth: {
      buildingDepartment: { streetAddress: '655 Main St, Islip, NY 11751', phone: '(631) 224-5450', counterHours: 'Mon–Fri 9a–4:30p', filingMethod: 'online portal or in person' },
      permit: { requiredForReroof: true, fee: '$135 + $8/sq', turnaroundBusinessDays: 10 },
      historicOverlay: { applies: false },
      housingStock: { era: '1950s–1970s', type: 'Ranches & Cape Cods', typicalRoofSquares: 19 },
      localConditions: ['Bay-front wind exposure near the Great South Bay', 'Marsh-adjacent lots with slower drainage'],
      namedStreets: ['Main St', 'Union Blvd', 'Carleton Ave', 'Suffolk Ave'],
      hamlets: ['Islip Terrace', 'East Islip', 'Great River'],
      landmarks: ['Heckscher State Park', 'Islip Town Beach'],
    },
    pricing: replacementPricing,
    faqs: [
      { question: 'Do I need a permit to reroof in Islip?', answer: 'Yes — a Town of Islip building permit is required; typical turnaround runs about 10 business days.' },
      { question: 'Does my bay-front location change the job?', answer: 'It changes the fastener spec and wind rating, not the process — we account for it in your written quote.' },
    ],
  },
  {
    name: 'Commack', slug: 'commack', advertisingAllowed: true,
    blurb: 'Commack straddles the Huntington/Smithtown town line, so permit jurisdiction depends on which side of Commack Rd you’re on — we sort that out before we quote.',
    depth: {
      buildingDepartment: { streetAddress: '99 W Main St, Smithtown, NY 11787', phone: '(631) 360-7500', counterHours: 'Mon–Fri 9a–4p', filingMethod: 'in person' },
      permit: { requiredForReroof: true, fee: '$125 base', turnaroundBusinessDays: 14 },
      historicOverlay: { applies: false },
      housingStock: { era: '1960s–1980s', type: 'Colonials & split-levels', typicalRoofSquares: 21 },
      localConditions: ['Sits across the Huntington/Smithtown line — permit office depends on your side of Commack Rd', 'Dense suburban tree cover'],
      namedStreets: ['Commack Rd', 'Jericho Turnpike', 'Vanderbilt Motor Pkwy', 'Indian Head Rd'],
      hamlets: ['Hauppauge border', 'Kings Park border'],
      landmarks: ['Hoyt Farm Nature Preserve'],
    },
    pricing: replacementPricing,
    faqs: [
      { question: 'Which town handles my Commack reroof permit?', answer: 'It depends on your street — homes on the Huntington side file with Huntington, the Smithtown side with Smithtown. We confirm this before filing.' },
      { question: 'Is there a historic overlay in Commack?', answer: 'No historic district affects roof work here — permitting is straightforward once we confirm jurisdiction.' },
    ],
  },
  {
    name: 'Bay Shore', slug: 'bay-shore', advertisingAllowed: true,
    blurb: 'Bay Shore’s older village core and waterfront exposure — right down to the Fire Island ferry terminal — call for roofing that respects both the house and the salt air.',
    depth: {
      buildingDepartment: { streetAddress: '655 Main St, Islip, NY 11751', phone: '(631) 224-5450', counterHours: 'Mon–Fri 9a–4:30p', filingMethod: 'online portal or in person' },
      permit: { requiredForReroof: true, fee: '$135 + $8/sq', turnaroundBusinessDays: 10 },
      historicOverlay: { applies: true, details: 'Older homes near the village core may require design review for street-visible roof changes — we check before we quote.' },
      housingStock: { era: '1900s–1950s', type: 'Victorians & bungalows', typicalRoofSquares: 17 },
      localConditions: ['Waterfront salt air near the Great South Bay', 'Older roof decking common in pre-1950s homes'],
      namedStreets: ['Main St', 'Union Blvd', 'Fifth Ave', 'Brook Ave'],
      hamlets: ['Bay Shore West', 'Bay Shore Historic District'],
      landmarks: ['Fire Island Ferry Terminal', 'Gardiner County Park'],
    },
    pricing: replacementPricing,
    faqs: [
      { question: 'Is my Bay Shore home in a historic district?', answer: 'Some blocks near the village core carry design-review requirements for visible roof changes — we verify your address before we quote.' },
      { question: 'Can older roof decking handle a modern re-roof?', answer: 'Usually, with an inspection first — pre-1950s decking sometimes needs partial replacement, which we call out in writing before any work starts.' },
    ],
  },
  {
    name: 'Brookhaven', slug: 'brookhaven', advertisingAllowed: true,
    blurb: 'Brookhaven is Suffolk’s largest town by land — from Medford’s tree-covered ranches to Shirley’s bay-front streets, we price by your actual hamlet, not a town-wide average.',
    depth: {
      buildingDepartment: { streetAddress: '1 Independence Hill, Farmingville, NY 11738', phone: '(631) 451-6444', counterHours: 'Mon–Fri 8:30a–4:30p', filingMethod: 'online portal or in person' },
      permit: { requiredForReroof: true, fee: '$145 + $6/sq', turnaroundBusinessDays: 12 },
      historicOverlay: { applies: false },
      housingStock: { era: '1960s–1990s', type: 'Ranches & colonials', typicalRoofSquares: 20 },
      localConditions: ['Heavy inland tree canopy in central hamlets', 'South-shore wind exposure in bay-front hamlets'],
      namedStreets: ['Route 25', 'Woodside Ave', 'Yaphank Ave', 'William Floyd Pkwy'],
      hamlets: ['Medford', 'Coram', 'Mastic', 'Shirley'],
      landmarks: ['Brookhaven National Laboratory', 'Wildwood State Park'],
    },
    pricing: replacementPricing,
    faqs: [
      { question: 'Does the same permit process apply across all of Brookhaven?', answer: 'Yes — one Town of Brookhaven building department handles permits town-wide; typical turnaround is about 12 business days regardless of hamlet.' },
      { question: 'Does my hamlet affect the roofing spec?', answer: 'It can — bay-front hamlets like Shirley see more wind exposure than inland ones like Coram. We account for it in your written quote.' },
    ],
  },
  {
    name: 'Patchogue', slug: 'patchogue', advertisingAllowed: true,
    blurb: 'Patchogue’s walkable downtown core sits right on the Great South Bay — older village homes and salt-air exposure both factor into how we spec your roof.',
    depth: {
      buildingDepartment: { streetAddress: '14 Baker St, Patchogue, NY 11772', phone: '(631) 447-3220', counterHours: 'Mon–Fri 9a–4p', filingMethod: 'in person' },
      permit: { requiredForReroof: true, fee: '$130 base', turnaroundBusinessDays: 10 },
      historicOverlay: { applies: true, details: 'The downtown historic core near Main St may require design review for street-visible roof changes — we check before we quote.' },
      housingStock: { era: '1900s–1950s', type: 'Victorians & bungalows', typicalRoofSquares: 16 },
      localConditions: ['Waterfront salt air near the Patchogue River and Great South Bay', 'Older roof decking common in village-core homes'],
      namedStreets: ['Main St', 'South Ocean Ave', 'River Ave', 'Waverly Ave'],
      hamlets: ['North Patchogue', 'East Patchogue border'],
      landmarks: ['Patchogue Theatre', 'Fire Island Ferry Terminal'],
    },
    pricing: replacementPricing,
    faqs: [
      { question: 'Is my Patchogue home in the historic district?', answer: 'Blocks near the downtown core sometimes carry design-review requirements for visible roof changes — we verify your address before we quote.' },
      { question: 'How long does a Village of Patchogue re-roof permit take?', answer: 'Typically about 10 business days, filed in person with the village building department.' },
    ],
  },
  {
    name: 'Port Jefferson', slug: 'port-jefferson', advertisingAllowed: true,
    blurb: 'Port Jefferson’s harbor-village homes sit on steep hillside lots with real North Shore wind exposure — access and staging matter here as much as the roof itself.',
    depth: {
      buildingDepartment: { streetAddress: '88 North Country Rd, Port Jefferson, NY 11777', phone: '(631) 473-4724', counterHours: 'Mon–Fri 9a–5p', filingMethod: 'in person' },
      permit: { requiredForReroof: true, fee: '$150 + fees', turnaroundBusinessDays: 12 },
      historicOverlay: { applies: true, details: 'The Village Historic District near the harbor requires design review for visible roof-material changes.' },
      housingStock: { era: '1880s–1940s', type: 'Victorians & bungalows on steep terrain', typicalRoofSquares: 15 },
      localConditions: ['Steep hillside lots complicate access and staging', 'North Shore harbor wind and salt exposure'],
      namedStreets: ['Main St', 'East Broadway', 'Old Post Rd', 'High St'],
      hamlets: ['Port Jefferson Station', 'Belle Terre border'],
      landmarks: ['Port Jefferson Harbor', 'Bridgeport–Port Jefferson Ferry Terminal'],
    },
    pricing: replacementPricing,
    faqs: [
      { question: 'Does the historic district affect my roof material choices?', answer: 'Near the harbor core, yes — visible roof-material changes may need design review. We confirm this before we quote.' },
      { question: 'Can you access steep hillside lots safely?', answer: 'Yes — Port Jefferson’s terrain is common for us; staging and access planning are built into the quote, not an add-on surprise.' },
    ],
  },
  {
    name: 'Sayville', slug: 'sayville', advertisingAllowed: true,
    blurb: 'Sayville’s Victorian sea-captain homes near the Great South Bay ferry terminal call for roofing that respects the older roof lines while standing up to real waterfront exposure.',
    depth: {
      buildingDepartment: { streetAddress: '655 Main St, Islip, NY 11751', phone: '(631) 224-5450', counterHours: 'Mon–Fri 9a–4:30p', filingMethod: 'online portal or in person' },
      permit: { requiredForReroof: true, fee: '$135 + $8/sq', turnaroundBusinessDays: 10 },
      historicOverlay: { applies: true, details: 'The Greene Avenue area near downtown carries historic-district recognition — street-visible roof-material changes may need review. We check before we quote.' },
      housingStock: { era: '1880s–1930s', type: 'Victorians & bungalows, with newer construction further from downtown', typicalRoofSquares: 17 },
      localConditions: ['Great South Bay waterfront salt air near the ferry terminal', 'Older roof decking common in downtown-adjacent homes'],
      namedStreets: ['Main St', 'Middle Rd', 'Greene Ave', 'Foster Ave'],
      hamlets: ['West Sayville', 'Bayport border', 'Oakdale border'],
      landmarks: ['Sayville Ferry Terminal (Fire Island)', 'Meadow Croft Estate'],
    },
    pricing: replacementPricing,
    faqs: [
      { question: 'Do I need a permit to reroof in Sayville?', answer: 'Yes — Sayville is part of the Town of Islip, so the same Town of Islip building permit applies; typical turnaround is about 10 business days.' },
      { question: 'Is my Sayville home in a historic area?', answer: 'Some blocks near Greene Ave and downtown carry historic recognition that can affect visible roof-material changes — we verify your address before we quote.' },
    ],
  },
  {
    name: 'Riverhead', slug: 'riverhead', advertisingAllowed: true,
    blurb: 'Riverhead spans downtown Main Street storefronts and the farmland hamlets around it — we price by your actual property, whether that’s a village rooftop or a farmhouse out past the vineyards.',
    depth: {
      buildingDepartment: { streetAddress: '200 Howell Ave, Riverhead, NY 11901', phone: '(631) 727-3200', counterHours: 'Mon–Fri 9a–4:30p', filingMethod: 'in person or by mail' },
      permit: { requiredForReroof: true, fee: '$140 base', turnaroundBusinessDays: 14 },
      historicOverlay: { applies: true, details: 'The Downtown Riverhead / Main Street corridor carries design-review guidelines for street-visible exterior changes, including roofing.' },
      housingStock: { era: '1900s–1980s', type: 'Colonials, capes & farmhouses', typicalRoofSquares: 21 },
      localConditions: ['Peconic River and bay-front exposure on the north side', 'Larger farmhouse-style roofs common in the outlying hamlets'],
      namedStreets: ['East Main St', 'West Main St', 'Roanoke Ave', 'Osborn Ave'],
      hamlets: ['Aquebogue', 'Jamesport', 'Calverton', 'Northville'],
      landmarks: ['Long Island Aquarium', 'Peconic River'],
    },
    pricing: replacementPricing,
    faqs: [
      { question: 'How long does a Riverhead re-roof permit take?', answer: 'Plan on about 14 business days for the Town of Riverhead building permit, filed in person or by mail.' },
      { question: 'Does downtown Riverhead have extra design review?', answer: 'Yes — homes and buildings along the Main Street corridor may need design review for visible exterior changes. We confirm this before we quote.' },
    ],
  },
  {
    name: 'Northport', slug: 'northport', advertisingAllowed: true,
    blurb: 'Northport’s harborfront hills mean steep, older roof lines and real North Shore wind exposure — and whether you’re in the incorporated village or East Northport changes which building department we file with.',
    depth: {
      buildingDepartment: { streetAddress: '224 Main St, Northport, NY 11768', phone: '(631) 261-7502', counterHours: 'Mon–Fri 9a–4p', filingMethod: 'in person' },
      permit: { requiredForReroof: true, fee: '$150 + fees', turnaroundBusinessDays: 12 },
      historicOverlay: { applies: true, details: 'The Village of Northport’s harborfront core carries local historic-district guidelines for street-visible exterior changes.' },
      housingStock: { era: '1880s–1950s', type: 'Victorians & bungalows near the harbor, capes further inland', typicalRoofSquares: 18 },
      localConditions: ['Steep hillside lots near the harbor complicate access and staging', 'North Shore harbor wind and salt exposure'],
      namedStreets: ['Main St', 'Woodbine Ave', 'Bayview Ave', 'Scudder Ave'],
      hamlets: ['East Northport', 'Fort Salonga border', 'Centerport border'],
      landmarks: ['Northport Harbor', 'Northport Village Park'],
    },
    pricing: replacementPricing,
    faqs: [
      { question: 'Which building department handles my Northport reroof permit?', answer: 'It depends on your address — the incorporated Village of Northport has its own building department for homes inside village limits, while East Northport (unincorporated) files with the Town of Huntington. We confirm this before filing.' },
      { question: 'Can you access steep hillside lots near the harbor?', answer: 'Yes — Northport’s harbor-hill terrain is common for us; staging and access planning are built into the quote, not an add-on surprise.' },
    ],
  },
  {
    name: 'Southampton', slug: 'southampton', advertisingAllowed: false,
    blurb: 'Southampton requires its own town-specific home improvement contractor license, separate from our Suffolk County HIC license, which we do not currently hold — so this page is informational only, not an offer to advertise or price work here.',
    depth: {
      buildingDepartment: { streetAddress: '116 Hampton Rd, Southampton, NY 11968', phone: '(631) 287-5700', counterHours: 'Mon–Fri 8:30a–4p', filingMethod: 'online portal or in person' },
      permit: { requiredForReroof: true, fee: 'Set by the Town of Southampton', turnaroundBusinessDays: 14 },
      historicOverlay: { applies: true, details: 'Several hamlets carry local historic or scenic-corridor review for street-visible exterior changes, including roofing — confirm with the Town before any work.' },
      housingStock: { era: '1800s–present', type: 'Historic shingle-style homes alongside newer construction', typicalRoofSquares: 24 },
      localConditions: ['Direct Atlantic/bay coastal wind and salt exposure', 'Historic-district review common near hamlet centers'],
      namedStreets: ['Hampton Rd', 'County Rd 39', 'Montauk Hwy'],
      hamlets: ['Southampton Village', 'Bridgehampton', 'Water Mill', 'Hampton Bays'],
      landmarks: ['Southampton Town Hall', 'Cooper’s Beach'],
    },
    pricing: [],
    faqs: [
      { question: 'Do you do roofing work in Southampton?', answer: 'Not currently — Southampton requires its own town home improvement contractor license in addition to our Suffolk County HIC license, and we don’t hold it yet. This page is informational only; we can’t book or price work here.' },
      { question: 'How do I verify a contractor’s license for a Southampton job?', answer: `Check the Town of Southampton's own contractor registry as well as Suffolk County's DCA lookup — a Suffolk County HIC license alone doesn't authorize work inside Southampton.` },
    ],
  },
  {
    name: 'East Hampton', slug: 'east-hampton', advertisingAllowed: false,
    blurb: 'East Hampton requires its own town-specific home improvement contractor license, separate from our Suffolk County HIC license, which we do not currently hold — so this page is informational only, not an offer to advertise or price work here.',
    depth: {
      buildingDepartment: { streetAddress: '300 Pantigo Pl, Suite 110, East Hampton, NY 11937', phone: '(631) 324-4145', counterHours: 'Mon–Fri 8:30a–3:30p', filingMethod: 'online portal or in person' },
      permit: { requiredForReroof: true, fee: 'Set by the Town of East Hampton', turnaroundBusinessDays: 14 },
      historicOverlay: { applies: true, details: 'Hamlet centers and many older homes fall under local historic or architectural review for exterior changes, including roof material and street-visible work.' },
      housingStock: { era: '1800s–present', type: 'Historic shingle-style and estate homes alongside newer construction', typicalRoofSquares: 26 },
      localConditions: ['Direct Atlantic/bay coastal wind and salt exposure', 'Historic-district review common near hamlet centers'],
      namedStreets: ['Pantigo Pl', 'Montauk Hwy', 'Main St'],
      hamlets: ['East Hampton Village', 'Amagansett', 'Montauk', 'Springs'],
      landmarks: ['East Hampton Town Hall', 'Main Beach'],
    },
    pricing: [],
    faqs: [
      { question: 'Do you do roofing work in East Hampton?', answer: 'Not currently — East Hampton requires its own town home improvement contractor license in addition to our Suffolk County HIC license, and we don’t hold it yet. This page is informational only; we can’t book or price work here.' },
      { question: 'How do I verify a contractor’s license for an East Hampton job?', answer: `Check the Town of East Hampton's own contractor registry as well as Suffolk County's DCA lookup — a Suffolk County HIC license alone doesn't authorize work inside East Hampton.` },
    ],
  },
  {
    name: 'Shelter Island', slug: 'shelter-island', advertisingAllowed: false,
    blurb: 'Shelter Island requires its own town-specific home improvement contractor license, separate from our Suffolk County HIC license, which we do not currently hold — so this page is informational only, not an offer to advertise or price work here.',
    depth: {
      buildingDepartment: { streetAddress: '38 North Ferry Rd, Shelter Island, NY 11964', phone: '(631) 749-0772', counterHours: 'Mon–Fri 9a–4p, by appointment recommended', filingMethod: 'in person or by mail' },
      permit: { requiredForReroof: true, fee: 'Set by the Town of Shelter Island', turnaroundBusinessDays: 14 },
      historicOverlay: { applies: false },
      housingStock: { era: '1800s–present', type: 'Historic homes and cottages, ferry-access only', typicalRoofSquares: 18 },
      localConditions: ['Island-wide coastal wind and salt exposure', 'Material and equipment access is ferry-dependent, which affects scheduling'],
      namedStreets: ['North Ferry Rd', 'South Ferry Rd', 'Route 114'],
      hamlets: ['Shelter Island Heights', 'West Neck'],
      landmarks: ['Shelter Island Town Hall', 'Mashomack Preserve'],
    },
    pricing: [],
    faqs: [
      { question: 'Do you do roofing work on Shelter Island?', answer: 'Not currently — Shelter Island requires its own town home improvement contractor license in addition to our Suffolk County HIC license, and we don’t hold it yet. This page is informational only; we can’t book or price work here.' },
      { question: 'How do I verify a contractor’s license for a Shelter Island job?', answer: `Check the Town of Shelter Island's own contractor registry as well as Suffolk County's DCA lookup — a Suffolk County HIC license alone doesn't authorize work on the island.` },
    ],
  },
];

// Full launch set — all 12 advertising towns now have detailed pages: west
// batch (Phase 03b), first east-batch installment (Brookhaven, Patchogue,
// Port Jefferson — Phase 03c), and the final 3 (Sayville, Riverhead, and
// Northport — the 12th North-Shore hamlet-town, chosen over St. James since
// St. James already appears as a Smithtown hamlet above).
export const sampleTownNames = [
  'Huntington', 'Smithtown', 'Islip', 'Babylon', 'Brookhaven', 'Bay Shore',
  'Patchogue', 'Commack', 'Port Jefferson', 'Sayville', 'Riverhead', 'Northport',
];

export const samplePosts: Post[] = [
  {
    title: 'How to spot a roof leak before it becomes a ceiling problem',
    slug: 'how-to-spot-a-roof-leak',
    excerpt: 'The warning signs — inside and outside — that show up months before a leak reaches your ceiling, and what to do about each one.',
    publishedAt: '2026-06-02',
    body: [
      'Most roof leaks don’t announce themselves with a dramatic drip. By the time water is visible on a ceiling, it has usually been finding its way in for weeks or months.',
      'Start outside: look for curling, cracked, or missing shingles, especially around chimneys, skylights, and any place two roof planes meet. Flashing — the metal strips sealing those joints — is the single most common failure point we find on inspections.',
      'Inside, check the attic if you have access. Dark staining on the underside of the roof deck, a musty smell, or insulation that feels damp are all earlier warnings than a ceiling stain.',
      'If you catch any of these signs, a documented <a href="/services/roof-leak-repair/">roof leak repair</a> inspection is worth more than guessing. We trace the actual source of the water — not just the visible stain — before we recommend a fix, the same standard we hold for every <a href="/services/roof-inspection/">roof inspection</a> we run.',
    ],
    relatedServiceSlugs: ['roof-leak-repair', 'roof-inspection'],
    relatedTownSlugs: ['huntington', 'smithtown'],
  },
  {
    title: 'What a Town of Huntington re-roof permit actually involves',
    slug: 'huntington-reroof-permit-guide',
    excerpt: 'A plain-language walkthrough of the permit, fee, and timeline for a residential re-roof in Huntington — and when historic-district review applies.',
    publishedAt: '2026-06-16',
    body: [
      'Most full roof replacements in the Town of Huntington require a building permit before work starts. That surprises some homeowners who assume repairs to an existing structure don’t need one — for a full tear-off and re-roof, they do.',
      'Filing is straightforward: the town accepts e-filed applications or in-person submission, and typical turnaround runs around 10 business days. Fees scale with the size of the job.',
      'If your home sits near the Old Town / Village Green district, street-visible roof changes may need an additional design review. We check this before we quote, not after a surprise delay.',
      'None of this needs to be your problem to track. We pull the right permit, file it correctly, and keep the paperwork so you have it later — for a sale, a refinance, or an insurance claim. See our full <a href="/areas/huntington/">Huntington coverage page</a> for local pricing bands and building-department details, or start with a <a href="/services/roof-replacement/">roof replacement</a> quote.',
    ],
    relatedServiceSlugs: ['roof-replacement'],
    relatedTownSlugs: ['huntington'],
  },
  {
    title: 'Asphalt shingles vs. metal roofing for Suffolk County homes',
    slug: 'asphalt-vs-metal-roofing-suffolk-county',
    excerpt: 'Cost, lifespan, and coastal-wind performance — an honest comparison for homeowners weighing a full replacement.',
    publishedAt: '2026-07-08',
    body: [
      'Asphalt shingles remain the most common re-roof choice on Long Island, and for good reason: lower upfront cost, a wide range of colors, and a straightforward install most crews can complete in a day or two.',
      'Standing-seam <a href="/services/metal-roofing/">metal roofing</a> costs more up front but typically lasts two to three times longer and handles wind uplift better — a real factor for south-shore homes exposed to coastal gusts and salt air.',
      'The right answer depends on how long you plan to stay in the home, your roof’s pitch and exposure, and your budget today versus over 20 years. We walk through the itemized numbers for your actual <a href="/services/roof-replacement/">roof replacement</a>, priced against what we actually see on Babylon roofs, rather than a generic average.',
    ],
    relatedServiceSlugs: ['roof-replacement', 'metal-roofing'],
    relatedTownSlugs: ['babylon'],
  },
  {
    title: 'How much does a roof replacement cost in Suffolk County?',
    slug: 'roof-replacement-cost-suffolk-county',
    excerpt: 'What actually drives the price of a full tear-off and re-roof on Long Island — size, pitch, material, and access — with real ranges by home size.',
    publishedAt: '2026-07-22',
    body: [
      'There’s no single number for a roof replacement — anyone quoting one without seeing your roof is guessing. The real drivers are square footage, pitch, how many layers are coming off, and how hard the roof is to access.',
      'As a starting point, a straightforward <a href="/services/roof-replacement/">roof replacement</a> on a home up to about 1,500 square feet typically runs in the low five figures; larger homes over 2,500 square feet run higher. Steep pitches, multiple layers, and tight access (narrow driveways, close neighbors) all add labor time, not just material.',
      'Town matters too — permit fees, turnaround times, and even typical housing stock vary by municipality. Our <a href="/areas/">town-by-town pricing pages</a> show real bands for towns like <a href="/areas/huntington/">Huntington</a>, <a href="/areas/smithtown/">Smithtown</a>, and <a href="/areas/babylon/">Babylon</a> rather than one Suffolk-wide average.',
      'If your roof is showing wear but you’re not sure it needs a full replacement, a <a href="/services/roof-inspection/">roof inspection</a> gives you a documented, photo-backed answer before you commit to either a repair or a full tear-off.',
    ],
    relatedServiceSlugs: ['roof-replacement', 'roof-inspection'],
    relatedTownSlugs: ['huntington', 'smithtown', 'babylon'],
  },
];

export const sampleReviews: Review[] = [
  { authorName: 'Dana R.', rating: 5, town: 'Huntington', text: 'They found the actual source of our leak after two other companies guessed wrong. Itemized quote, no pressure.' },
  { authorName: 'Mike C.', rating: 5, town: 'Babylon', text: 'Storm took half our ridge. They tarped it the same week and the written estimate matched the final bill exactly.' },
  { authorName: 'Priya S.', rating: 5, town: 'Smithtown', text: 'The town-by-town pricing on the site was real — what they quoted is what we paid. Refreshing.' },
];
