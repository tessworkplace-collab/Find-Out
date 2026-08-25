export const activeMission = {
  id: 'sound-01',
  number: '01',
  category: 'SOUND MISSION',
  title: 'A sound you know',
  summary: 'Notice a familiar sound you hear often but rarely pay attention to. Choose where to start and follow it.',
  hook: 'There’s a sound in Hong Kong you hear almost every day.\nBut you may never have really noticed it.',
  question: 'What familiar sound do you hear often but rarely notice?',
  guidance: 'Start anywhere nearby. Listen first, then follow what catches your attention.',
};

export const nextMission = {
  number: '02',
  category: 'NEXT MISSION',
  title: 'The story behind this mark',
  hook: 'A local trace with a story still attached.',
  locked: 'LOCKED · COMPLETE 01',
};

export const yourDiscovery = {
  title: 'Pedestrian crossing signal',
  note: 'I hear it every morning but never noticed how far it carries.',
  observation: 'The crossing signal carries farther than I noticed.',
  location: 'Jordan',
};

export const otherDiscoveries = [
  { id: '1', index: '01', title: 'MTR door chime', location: 'Jordan', note: 'I hear this chime every day, but only noticed how it shapes the rhythm of people entering and leaving the train.' },
  { id: '2', index: '02', title: 'Delivery cart wheels', location: 'Sham Shui Po', note: 'The same metal rattle repeats through the street long before the carts appear.' },
  { id: '3', index: '03', title: 'School bell across the block', location: 'Wan Chai', note: 'The bell quietly structures the afternoon even for people outside the school.' },
];
