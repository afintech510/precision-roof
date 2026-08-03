import type { SiteSettings, ServiceLite, TownFull, Review } from './types';

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
];

// Full launch set (western/central publish first); detailed pages exist for the
// three above — the rest are shown in the coverage grid.
export const sampleTownNames = [
  'Huntington', 'Smithtown', 'Islip', 'Babylon', 'Brookhaven', 'Bay Shore',
  'Patchogue', 'Commack', 'Port Jefferson', 'Sayville', 'Riverhead', 'Northport',
];

export const sampleReviews: Review[] = [
  { authorName: 'Dana R.', rating: 5, town: 'Huntington', text: 'They found the actual source of our leak after two other companies guessed wrong. Itemized quote, no pressure.' },
  { authorName: 'Mike C.', rating: 5, town: 'Babylon', text: 'Storm took half our ridge. They tarped it the same week and the written estimate matched the final bill exactly.' },
  { authorName: 'Priya S.', rating: 5, town: 'Smithtown', text: 'The town-by-town pricing on the site was real — what they quoted is what we paid. Refreshing.' },
];
