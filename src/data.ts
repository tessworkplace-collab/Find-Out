export type MissionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type EvidenceType = 'photo' | 'video' | 'audio';

export type Mission = {
  id: string;
  number: string;
  difficulty: MissionDifficulty;
  title: string;
  summary: string;
  hook: string;
  question: string;
  guidance: string;
  acceptedEvidence: EvidenceType[];
};

const allEvidence: EvidenceType[] = ['photo', 'video', 'audio'];

export const missions: Mission[] = [
  {
    id: 'dead-link', number: '01', difficulty: 'MEDIUM', title: 'Dead Link',
    summary: 'Choose an outdated online reference, visit the area and discover what exists there now.',
    hook: 'A place still exists online, but reality may have moved on.',
    question: 'What replaced, survived or disappeared beyond the dead link?',
    guidance: 'Choose the link yourself. Compare its online trace with what you can find in the real world.',
    acceptedEvidence: allEvidence,
  },
  {
    id: 'unofficial-landmark', number: '02', difficulty: 'MEDIUM', title: 'Unofficial Landmark',
    summary: 'Find a place, object or meeting point that matters locally without appearing on official guides.',
    hook: 'Some places matter locally without appearing on official guides.',
    question: 'What makes this place meaningful without formal recognition?',
    guidance: 'Look for a reference people recognise or use, then investigate the role it plays nearby.',
    acceptedEvidence: allEvidence,
  },
  {
    id: 'why-is-this-here', number: '03', difficulty: 'EASY', title: 'Why Is This Here?',
    summary: 'Find an object, sign or feature that seems out of place and investigate why it may exist there.',
    hook: 'An ordinary setting contains something that seems out of place.',
    question: 'Why might this unexpected feature exist here?',
    guidance: 'Start anywhere nearby. Examine the feature and the clues around it before forming an explanation.',
    acceptedEvidence: allEvidence,
  },
  {
    id: 'wrong-dlc', number: '04', difficulty: 'EASY', title: 'Wrong DLC',
    summary: 'Find a place or object that feels visually, culturally or historically disconnected from its surroundings.',
    hook: 'A fragment of another world appears inside an ordinary place.',
    question: 'What hidden context makes this apparent mismatch belong here?',
    guidance: 'Look for surrounding clues that explain how it arrived, who uses it or why it remains.',
    acceptedEvidence: allEvidence,
  },
  {
    id: 'who-is-buying-this', number: '05', difficulty: 'HARD', title: 'Who Is Buying This?',
    summary: 'Find an unusual or outdated product or service and investigate the audience that keeps it alive.',
    hook: 'A product or service survives even though its audience is not obvious.',
    question: 'What need, habit or community keeps this offer alive?',
    guidance: 'Use visible clues or one respectful conversation when appropriate. Do not pressure staff.',
    acceptedEvidence: allEvidence,
  },
  {
    id: 'no-reviews-yet', number: '06', difficulty: 'MEDIUM', title: 'No Reviews Yet',
    summary: 'Choose a place with little useful review information and experience or observe it directly.',
    hook: 'A place is difficult to judge through rating platforms.',
    question: 'What can direct experience reveal before a rating exists?',
    guidance: 'Select the place yourself and record a detail that online reviews do not reveal.',
    acceptedEvidence: allEvidence,
  },
  {
    id: 'the-queue', number: '07', difficulty: 'EASY', title: 'The Queue',
    summary: 'Notice a queue or repeated gathering and identify what people are waiting for.',
    hook: 'People are waiting, but the reason is not immediately visible.',
    question: 'What invisible value is organising this group?',
    guidance: 'Observe without obstructing others and do not capture identifiable faces without permission.',
    acceptedEvidence: allEvidence,
  },
  {
    id: 'offline-famous', number: '08', difficulty: 'HARD', title: 'Offline Famous',
    summary: 'Find a locally recognised place with little active social media presence and discover how people know it.',
    hook: 'Some local places are well known offline but barely visible online.',
    question: 'How does this place stay locally known without social media?',
    guidance: 'Investigate through public signs, repeat visits, visible clues or respectful local enquiry.',
    acceptedEvidence: allEvidence,
  },
  {
    id: 'ghost-shop', number: '09', difficulty: 'EASY', title: 'Ghost Shop',
    summary: 'Find physical traces of a vanished business and reconstruct what used to operate there.',
    hook: 'A business has disappeared, but physical traces remain.',
    question: 'What former activity can still be read from this place?',
    guidance: 'Look for signage, fittings, packaging, marks or architectural clues in public view.',
    acceptedEvidence: allEvidence,
  },
  {
    id: 'secret-menu', number: '10', difficulty: 'HARD', title: 'Secret Menu',
    summary: 'Find a genuine off-menu option, ordering custom or customisable item and learn how people know it.',
    hook: 'A real option may exist without appearing on the main menu.',
    question: 'How does this option circulate without being formally advertised?',
    guidance: 'Confirm it through visible cues or ask staff once, respectfully and without pressure.',
    acceptedEvidence: allEvidence,
  },
  {
    id: 'after-hours', number: '11', difficulty: 'MEDIUM', title: 'After Hours',
    summary: 'Revisit a familiar public place at a safe, appropriate time and observe how its function changes.',
    hook: 'A familiar place may perform a different function when normal activity ends.',
    question: 'What second life appears when the usual activity stops?',
    guidance: 'Compare the usual expectation with the after-hours reality in a safe public setting.',
    acceptedEvidence: allEvidence,
  },
  {
    id: 'local-knowledge', number: '12', difficulty: 'HARD', title: 'Local Knowledge',
    summary: 'Find a local practice, shortcut, object, sign or place whose meaning is unclear to an outsider.',
    hook: 'A neighbourhood contains useful knowledge that search results do not explain well.',
    question: 'What can only be understood by paying attention locally?',
    guidance: 'Interpret it through observation, public clues or a respectful conversation when appropriate.',
    acceptedEvidence: allEvidence,
  },
];

export const activeMission = missions.find((mission) => mission.id === 'why-is-this-here')!;

export const nextMission = {
  ...missions.find((mission) => mission.id === 'wrong-dlc')!,
  locked: 'LOCKED · COMPLETE 03',
};

export const yourDiscovery = {
  title: 'A sealed doorway',
  note: 'The old entrance remains even though the building now opens from the other side.',
  observation: 'Layers of paint and an old step suggest this was once the main entrance.',
  location: 'Jordan',
};

export const otherDiscoveries = [
  { id: '1', index: '01', title: 'Numbers above a shop', location: 'Jordan', note: 'The faded numbers matched an older street-address system still visible on nearby buildings.' },
  { id: '2', index: '02', title: 'A chair chained outside', location: 'Sham Shui Po', note: 'It marks an informal waiting place shared by several small workshops.' },
  { id: '3', index: '03', title: 'A mirror at the corner', location: 'Wan Chai', note: 'The mirror helps delivery carts see around a blind service-lane turn.' },
];
