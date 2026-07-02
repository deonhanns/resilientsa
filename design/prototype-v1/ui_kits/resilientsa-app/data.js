// Seed data for the ResilientSA app prototype — warm, real, Cape Town cell life.
window.RESA_DATA = {
  // Screen 1 — Trade Exchange (a cell's offers & needs)
  listings: [
    { id: 'l1', kind: 'offer', pillar: 'food',   title: 'Spare tomato seedlings', member: 'Nomsa', place: 'Cell 4' },
    { id: 'l2', kind: 'need',  pillar: 'water',  title: 'Help fixing our shared tap', member: 'Themba', place: 'Cell 4' },
    { id: 'l3', kind: 'offer', pillar: 'skills', title: 'Free haircuts on Saturdays', member: 'Sipho', place: 'Cell 4' },
    { id: 'l4', kind: 'need',  pillar: 'health', title: 'A lift to the clinic on Thursday', member: 'Gogo Miriam', place: 'Cell 4' },
    { id: 'l5', kind: 'offer', pillar: 'energy', title: 'Phone charging from my solar', member: 'Andile', place: 'Cell 4' },
    { id: 'l6', kind: 'need',  pillar: 'safety', title: 'Walking group for the evening shift', member: 'Zanele', place: 'Cell 4' },
    { id: 'l7', kind: 'offer', pillar: 'food',   title: 'Extra bread from the bakery, evenings', member: 'Fatima', place: 'Cell 4' },
  ],

  // Screen 2 — Community Marketplace (programmes to request)
  programmes: [
    { id: 'p1', pillar: 'water',  title: 'Fix a broken communal tap', summary: 'A plumber trains two people from your area to repair and maintain shared taps.', communitiesCount: 38, provider: 'Cape Water Collective' },
    { id: 'p2', pillar: 'water',  title: 'A rainwater tank for shared use', summary: 'Get a tank installed where several households can collect and store clean water.', communitiesCount: 21, provider: 'Sizwe Water Trust' },
    { id: 'p3', pillar: 'food',   title: 'Start a food garden together', summary: 'Seeds, tools and a few sessions to get a shared vegetable garden growing.', communitiesCount: 64, provider: 'GreenRoots' },
    { id: 'p4', pillar: 'health', title: 'A mobile clinic visit', summary: 'A nurse team comes to your area for a day of check-ups and basic care.', communitiesCount: 47, provider: 'HealthReach' },
    { id: 'p5', pillar: 'safety', title: 'Set up a neighbourhood watch', summary: 'Practical help to start a watch group that works with your local CPF.', communitiesCount: 51, provider: 'Safer Streets Trust' },
    { id: 'p6', pillar: 'energy', title: 'A shared solar charging point', summary: 'A solar station where neighbours can safely charge phones and lights.', communitiesCount: 29, provider: 'Sun for All' },
    { id: 'p7', pillar: 'skills', title: 'A weekend skills swap', summary: 'Neighbours teach each other a trade — sewing, wiring, repairs, baking.', communitiesCount: 33, provider: 'Makers Circle' },
  ],

  // Screen 3 — Cell Steward Dashboard
  needs: { water: 4, safety: 3, skills: 2, health: 1, food: 0, energy: 0 },
  members: [
    { id: 'm1', name: 'Themba',      place: 'Cell 4', status: 'active',  connections: 6 },
    { id: 'm2', name: 'Nomsa',       place: 'Cell 4', status: 'active',  connections: 4 },
    { id: 'm3', name: 'Andile',      place: 'Cell 4', status: 'active',  connections: 5 },
    { id: 'm4', name: 'Sipho',       place: 'Cell 4', status: 'quiet' },
    { id: 'm5', name: 'Grace',       place: 'Cell 4', status: 'isolate' },
    { id: 'm6', name: 'Gogo Miriam', place: 'Cell 4', status: 'isolate' },
  ],
  network: {
    trend: 'growing',
    message: 'More members are connecting directly with each other, not just through you.',
    stat: '12 new direct links this month',
  },
};
