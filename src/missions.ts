export type MissionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type MissionPool = 'Core' | 'Extended';
export type MissionEvidenceMode = 'photo' | 'video' | 'audio';

export type MissionDefinition = {
  id: string;
  number: string;
  pool: MissionPool;
  difficulty: MissionDifficulty;
  title: string;
  prompt: string;
  find: string;
  investigate: string;
  document: string;
  question: string;
  evidenceModes: MissionEvidenceMode[];
};

const ALL_EVIDENCE: MissionEvidenceMode[] = ['photo', 'video', 'audio'];

export const MISSIONS: MissionDefinition[] = [
  {
    id: 'dead-link', number: '01', pool: 'Core', difficulty: 'Medium', title: 'Dead Link',
    prompt: 'A place still exists online, but reality may have moved on.',
    find: 'Choose a business, service or place linked from an outdated, broken or inactive webpage.',
    investigate: 'Visit the area and find out what exists there now.',
    document: 'Capture the present trace and explain the difference between the online clue and current reality.',
    question: 'What replaced, survived or disappeared beyond the dead link?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'unofficial-landmark', number: '02', pool: 'Core', difficulty: 'Medium', title: 'Unofficial Landmark',
    prompt: 'Some places matter locally without appearing on official guides.',
    find: 'Identify a place, object or meeting point that people use as a local reference.',
    investigate: 'Discover how people recognise it and what role it plays in the neighbourhood.',
    document: 'Capture the landmark and describe why it matters despite lacking official status.',
    question: 'What makes this place meaningful without formal recognition?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'why-is-this-here', number: '03', pool: 'Core', difficulty: 'Easy', title: 'Why Is This Here?',
    prompt: 'An ordinary setting contains something that seems out of place.',
    find: 'Locate an object, sign, structure or feature whose purpose is not immediately clear.',
    investigate: 'Examine nearby clues or public information to form a grounded explanation.',
    document: 'Capture the feature and explain your best-supported interpretation.',
    question: 'Why might this unexpected feature exist here?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'wrong-dlc', number: '04', pool: 'Core', difficulty: 'Easy', title: 'Wrong DLC',
    prompt: 'A fragment of another time, culture or visual world appears inside an ordinary place.',
    find: 'Locate a place or object that feels disconnected from its surroundings.',
    investigate: 'Look for clues explaining how it arrived, who uses it or why it remains.',
    document: 'Capture the contrast and describe the story suggested by the evidence.',
    question: 'What hidden context makes this apparent mismatch belong here?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'who-is-buying-this', number: '05', pool: 'Core', difficulty: 'Hard', title: 'Who Is Buying This?',
    prompt: 'A product or service survives even though its audience is not obvious.',
    find: 'Locate an unusual, highly specific or seemingly outdated product or service.',
    investigate: 'Use visible clues or one respectful conversation, when appropriate, to understand its audience.',
    document: 'Capture the item or storefront and explain who may still value it and why.',
    question: 'What need, habit or community keeps this offer alive?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'no-reviews-yet', number: '06', pool: 'Core', difficulty: 'Medium', title: 'No Reviews Yet',
    prompt: 'A place has little or no useful online review information.',
    find: 'Choose a publicly accessible place that is difficult to judge through rating platforms.',
    investigate: 'Experience or observe it directly without relying on a recommendation ranking.',
    document: 'Capture a non-identifying detail and record what online reviews failed to reveal.',
    question: 'What can direct experience reveal before a rating exists?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'the-queue', number: '07', pool: 'Core', difficulty: 'Easy', title: 'The Queue',
    prompt: 'People are waiting, but the reason is not immediately visible.',
    find: 'Notice a queue or repeated gathering in public without joining blindly or obstructing others.',
    investigate: 'Observe the pattern and identify what people are waiting for.',
    document: 'Capture the place without identifiable faces and explain the reason behind the queue.',
    question: 'What invisible value is organising this group?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'offline-famous', number: '08', pool: 'Core', difficulty: 'Hard', title: 'Offline Famous',
    prompt: 'Some local places are well known despite having little or no social media presence.',
    find: 'Find a local shop, service or place known in the neighbourhood but barely visible online.',
    investigate: 'Discover how people know it and why it remains locally recognised.',
    document: 'Capture a public detail and explain how its reputation circulates offline.',
    question: 'How does this place stay locally known without strong online visibility?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'ghost-shop', number: '09', pool: 'Core', difficulty: 'Easy', title: 'Ghost Shop',
    prompt: 'A business has disappeared, but physical traces remain.',
    find: 'Locate signage, fittings, packaging, marks or architectural clues left by a closed business.',
    investigate: 'Use the remaining evidence to identify what used to operate there.',
    document: 'Capture the trace and reconstruct the most credible account you can support.',
    question: 'What former activity can still be read from this place?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'secret-menu', number: '10', pool: 'Core', difficulty: 'Hard', title: 'Secret Menu',
    prompt: 'A real option may exist without appearing on the main menu or display.',
    find: 'Identify an off-menu variation, local ordering custom or option the business genuinely offers.',
    investigate: 'Confirm it through visible cues or one respectful enquiry without pressuring staff.',
    document: 'With permission where required, capture the result and explain how people learn about it.',
    question: 'How does this option circulate without being formally advertised?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'after-hours', number: '11', pool: 'Core', difficulty: 'Medium', title: 'After Hours',
    prompt: 'A familiar place may perform a different function when its normal activity ends.',
    find: 'Revisit a publicly accessible area at a safe, appropriate time outside its busy period.',
    investigate: 'Observe how its users, atmosphere or purpose changes.',
    document: 'Capture a public detail and compare the daytime expectation with the after-hours reality.',
    question: 'What second life appears when the usual activity stops?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'local-knowledge', number: '12', pool: 'Core', difficulty: 'Hard', title: 'Local Knowledge',
    prompt: 'A neighbourhood contains useful knowledge that search results do not explain well.',
    find: 'Notice a local practice, shortcut, object, sign or place whose meaning is unclear to an outsider.',
    investigate: 'Interpret it through observation, public clues or one respectful conversation.',
    document: 'Capture a non-identifying detail and explain the knowledge needed to understand it.',
    question: 'What can only be understood by paying attention locally?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'permanent-temporary', number: '13', pool: 'Extended', difficulty: 'Easy', title: 'Permanent Temporary',
    prompt: 'A temporary repair has quietly become part of the permanent landscape.',
    find: 'Find a patched, taped, propped-up or improvised solution that outlived its temporary purpose.',
    investigate: 'Look for wear or additions showing how long it remained and why nobody replaced it.',
    document: 'Capture the solution and explain what keeps the temporary fix alive.',
    question: 'When does a temporary solution become the official solution?', evidenceModes: ['photo', 'video'],
  },
  {
    id: 'instructions-for-nobody', number: '14', pool: 'Extended', difficulty: 'Easy', title: 'Instructions for Nobody',
    prompt: 'A sign is still giving orders to people, objects or activities that no longer exist.',
    find: 'Find an obsolete, contradictory or strangely specific public instruction.',
    investigate: 'Compare it with the present environment and work out who it originally addressed.',
    document: 'Capture the sign and context, then explain what changed around it.',
    question: 'Who was this instruction originally for, and why is it still here?', evidenceModes: ['photo', 'video'],
  },
  {
    id: 'one-job', number: '15', pool: 'Extended', difficulty: 'Easy', title: 'One Job',
    prompt: 'An object is doing a job it was clearly not designed to do.',
    find: 'Find an everyday object repurposed as a weight, barrier, marker, repair, support or tool.',
    investigate: 'Observe how it is used and what problem the unofficial function solves.',
    document: 'Capture the repurposed object and describe its new job.',
    question: 'What failure, shortage or local habit gave this object a second career?', evidenceModes: ['photo', 'video'],
  },
  {
    id: 'everybody-walks-around-it', number: '16', pool: 'Extended', difficulty: 'Easy', title: 'Everybody Walks Around It',
    prompt: 'One small feature silently changes how everybody moves.',
    find: 'Find an obstacle, mark, surface or object that makes people alter their path in public.',
    investigate: 'Observe the movement pattern without photographing identifiable people.',
    document: 'Capture the environment or feature and explain the behaviour it produces.',
    question: 'What invisible rule has formed around this object?', evidenceModes: ['video', 'photo'],
  },
  {
    id: 'the-sound-behind-the-wall', number: '17', pool: 'Extended', difficulty: 'Medium', title: 'The Sound Behind the Wall',
    prompt: 'A sound is clearly present, but its source is hidden or misleading.',
    find: 'Find a recurring public sound whose source cannot be identified immediately.',
    investigate: 'Follow it safely and use timing, direction or nearby clues to identify its source.',
    document: 'Capture the sound and explain what most credibly produced it.',
    question: 'What ordinary system creates this unexplained sound?', evidenceModes: ['audio', 'video'],
  },
  {
    id: 'nobody-uses-this-door', number: '18', pool: 'Extended', difficulty: 'Medium', title: 'Nobody Uses This Door',
    prompt: 'A doorway remains visible even though people appear to have stopped using it.',
    find: 'Find a blocked, sealed, ceremonial, redundant or strangely avoided entrance visible publicly.',
    investigate: 'Study wear, signage, architecture and nearby routes to infer its function.',
    document: 'Capture the entrance and explain why it became functionally invisible.',
    question: 'What happened to the route this doorway once promised?', evidenceModes: ['photo', 'video'],
  },
  {
    id: 'accidental-museum', number: '19', pool: 'Extended', difficulty: 'Medium', title: 'Accidental Museum',
    prompt: 'An ordinary place has begun displaying its own history without becoming a museum.',
    find: 'Find a public-facing place where old tools, products, photographs or remains have accumulated.',
    investigate: 'Find out whether the display is deliberate, practical, sentimental or simply never removed.',
    document: 'Capture a non-sensitive detail and explain what story the collection tells.',
    question: 'When does stored clutter become local history?', evidenceModes: ['photo', 'video'],
  },
  {
    id: 'same-place-different-rules', number: '20', pool: 'Extended', difficulty: 'Medium', title: 'Same Place, Different Rules',
    prompt: 'Crossing an almost invisible boundary changes what people do.',
    find: 'Find two adjoining public areas where behaviour, sound, movement or use changes.',
    investigate: 'Identify the boundary through repeated visible or audible clues.',
    document: 'Capture the contrast and explain the unwritten rule on each side.',
    question: 'What changes at this boundary even though the city appears continuous?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'last-one-standing', number: '21', pool: 'Extended', difficulty: 'Hard', title: 'Last One Standing',
    prompt: 'One place, object or service survives after similar examples have disappeared.',
    find: 'Find a remaining example of a once-common local feature, trade, machine, service or design.',
    investigate: 'Use physical evidence and public clues to understand what allowed it to survive.',
    document: 'Capture the survivor and explain what keeps it operating or meaningful.',
    question: 'Why did this example remain when the others disappeared?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'public-secret', number: '22', pool: 'Extended', difficulty: 'Hard', title: 'Public Secret',
    prompt: 'Many people seem to know something that is barely written down.',
    find: 'Find a public-facing shortcut, custom, service, timing pattern or informal rule.',
    investigate: 'Confirm it through observation, visible clues or one respectful enquiry.',
    document: 'Capture non-private evidence and explain how the knowledge circulates.',
    question: 'How does everybody know this when almost nobody announces it?', evidenceModes: ALL_EVIDENCE,
  },
  {
    id: 'urban-fossil', number: '23', pool: 'Extended', difficulty: 'Hard', title: 'Urban Fossil',
    prompt: 'A piece of infrastructure survives after the system it belonged to has vanished.',
    find: 'Find a rail, bracket, cable mount, machine base, road marking or architectural fragment.',
    investigate: 'Reconstruct the lost system through surrounding evidence and reliable public information.',
    document: 'Capture the fossil and explain the larger system it once served.',
    question: 'What missing system can still be reconstructed from this fragment?', evidenceModes: ['photo', 'video'],
  },
  {
    id: 'copy-paste-error', number: '24', pool: 'Extended', difficulty: 'Hard', title: 'Copy-Paste Error',
    prompt: 'A repeated urban pattern contains one version that breaks the rule.',
    find: 'Find a repeated system of signs, windows, objects, sounds or structures with one variation.',
    investigate: 'Compare examples and investigate whether the difference comes from repair, ownership, time or accident.',
    document: 'Capture the pattern and exception, then explain the most credible reason for the difference.',
    question: 'Why did this one copy refuse to match the others?', evidenceModes: ALL_EVIDENCE,
  },
];

export const FEATURED_MISSION_ID = 'why-is-this-here';
export const CORE_MISSION_IDS = MISSIONS.filter((mission) => mission.pool === 'Core').map((mission) => mission.id);
export const ALL_MISSION_IDS = MISSIONS.map((mission) => mission.id);

export function getMissionById(id?: string | null) {
  return MISSIONS.find((mission) => mission.id === id);
}

export function formatEvidenceModes(modes: MissionEvidenceMode[]) {
  return modes.map((mode) => mode.charAt(0).toUpperCase() + mode.slice(1)).join(' · ');
}
