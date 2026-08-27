export type MissionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type EvidenceType = 'photo' | 'video' | 'audio';
export type MissionSet = 'CORE' | 'EXTENDED';

export type Mission = {
  id: string;
  number: string;
  set: MissionSet;
  difficulty: MissionDifficulty;
  title: string;
  summary: string;
  hook: string;
  find: string;
  investigate: string;
  document: string;
  question: string;
  guidance: string;
  acceptedEvidence: EvidenceType[];
  shortFindingRequired: true;
  safetyNote?: string;
};

const photo: EvidenceType[] = ['photo'];
const photoVideo: EvidenceType[] = ['photo', 'video'];
const audioVideo: EvidenceType[] = ['audio', 'video'];
const allEvidence: EvidenceType[] = ['photo', 'video', 'audio'];

export const missions: Mission[] = [
  {
    id: 'dead-link', number: '01', set: 'CORE', difficulty: 'MEDIUM', title: 'Dead Link',
    hook: 'A place still exists online, but reality may have moved on.',
    summary: 'Choose a business, service or place linked from an outdated, broken or inactive webpage.',
    find: 'Choose a business, service or place linked from an outdated, broken or inactive webpage.',
    investigate: 'Visit the area and find out what exists there now.',
    document: 'Photograph the present trace and explain the difference between the online clue and the current reality.',
    question: 'What replaced, survived or disappeared beyond the dead link?',
    guidance: 'Choose the link yourself. Compare its online trace with what exists in the real world now.',
    acceptedEvidence: photo, shortFindingRequired: true,
  },
  {
    id: 'unofficial-landmark', number: '02', set: 'CORE', difficulty: 'MEDIUM', title: 'Unofficial Landmark',
    hook: 'Some places matter locally without appearing on official guides.',
    summary: 'Identify a place, object or meeting point that people use as a local reference.',
    find: 'Identify a place, object or meeting point that people use as a local reference.',
    investigate: 'Discover how people recognise it and what role it plays in the neighbourhood.',
    document: 'Photograph the landmark and describe why it matters despite lacking official status.',
    question: 'What makes this place meaningful without formal recognition?',
    guidance: 'Look for a reference people recognise or use, then investigate the role it plays nearby.',
    acceptedEvidence: photo, shortFindingRequired: true,
  },
  {
    id: 'why-is-this-here', number: '03', set: 'CORE', difficulty: 'EASY', title: 'Why Is This Here?',
    hook: 'An ordinary setting contains something that seems out of place.',
    summary: 'Locate an object, sign, structure or feature whose purpose is not immediately clear.',
    find: 'Locate an object, sign, structure or feature whose purpose is not immediately clear.',
    investigate: 'Examine nearby clues or publicly available information to form a grounded explanation.',
    document: 'Photograph the feature and explain your best-supported interpretation.',
    question: 'Why might this unexpected feature exist here?',
    guidance: 'Start anywhere nearby. Examine the feature and the clues around it before forming an explanation.',
    acceptedEvidence: photo, shortFindingRequired: true,
  },
  {
    id: 'wrong-dlc', number: '04', set: 'CORE', difficulty: 'EASY', title: 'Wrong DLC',
    hook: 'A fragment of another time, culture or visual world appears inside an ordinary place.',
    summary: 'Locate a place or object that feels disconnected from its surroundings.',
    find: 'Locate a place or object that feels disconnected from its surroundings.',
    investigate: 'Look for clues explaining how it arrived, who uses it or why it remains.',
    document: 'Photograph the contrast and describe the story suggested by the evidence.',
    question: 'What hidden context makes this apparent mismatch belong here?',
    guidance: 'Look for surrounding clues that explain how it arrived, who uses it or why it remains.',
    acceptedEvidence: photo, shortFindingRequired: true,
  },
  {
    id: 'who-is-buying-this', number: '05', set: 'CORE', difficulty: 'HARD', title: 'Who Is Buying This?',
    hook: 'A product or service survives even though its audience is not obvious.',
    summary: 'Locate an unusual, highly specific or seemingly outdated product or service.',
    find: 'Locate an unusual, highly specific or seemingly outdated product or service.',
    investigate: 'Use visible clues or a respectful conversation, when appropriate, to understand its audience.',
    document: 'Photograph the item or storefront and explain who may still value it and why.',
    question: 'What need, habit or community keeps this offer alive?',
    guidance: 'Use visible clues first. If appropriate, ask once and do not pressure staff or customers.',
    acceptedEvidence: photo, shortFindingRequired: true,
    safetyNote: 'Keep conversations optional and respectful. Do not pressure staff or photograph identifiable people without permission.',
  },
  {
    id: 'no-reviews-yet', number: '06', set: 'CORE', difficulty: 'MEDIUM', title: 'No Reviews Yet',
    hook: 'A place has little or no useful online review information.',
    summary: 'Choose a publicly accessible place that is difficult to judge through rating platforms.',
    find: 'Choose a publicly accessible place that is difficult to judge through rating platforms.',
    investigate: 'Experience or observe it directly without relying on a recommendation ranking.',
    document: 'Photograph a non-identifying detail and record what online reviews failed to reveal.',
    question: 'What can direct experience reveal before a rating exists?',
    guidance: 'Select the place yourself and record a detail that online reviews do not reveal.',
    acceptedEvidence: photo, shortFindingRequired: true,
  },
  {
    id: 'the-queue', number: '07', set: 'CORE', difficulty: 'EASY', title: 'The Queue',
    hook: 'People are waiting, but the reason is not immediately visible.',
    summary: 'Notice a queue or repeated gathering in a public place without joining blindly or obstructing others.',
    find: 'Notice a queue or repeated gathering in a public place without joining blindly or obstructing others.',
    investigate: 'Observe the pattern and identify what people are waiting for.',
    document: 'Photograph the place without identifiable faces and explain the reason behind the queue.',
    question: 'What invisible value is organising this group?',
    guidance: 'Observe from a respectful distance without blocking movement or joining the queue just to investigate it.',
    acceptedEvidence: photo, shortFindingRequired: true,
    safetyNote: 'Do not obstruct the queue or photograph identifiable faces without permission.',
  },
  {
    id: 'offline-famous', number: '08', set: 'CORE', difficulty: 'HARD', title: 'Offline Famous',
    hook: 'Some local places are well known in the neighbourhood despite having little or no social media presence.',
    summary: 'Find a local shop, service or place people seem to know despite little or no active social media presence.',
    find: 'Find a local shop, service or place that people in the neighbourhood seem to know, but that has little or no active social media presence.',
    investigate: 'Discover how people know about it through signs, word of mouth, repeat visits or local knowledge.',
    document: 'Photograph a public detail and explain how the place remains locally known without relying on social media or recommendation platforms.',
    question: 'How does this place stay locally known despite having little or no social media presence?',
    guidance: 'Use public signs and visible clues first; local enquiry should be respectful and optional.',
    acceptedEvidence: photo, shortFindingRequired: true,
  },
  {
    id: 'ghost-shop', number: '09', set: 'CORE', difficulty: 'EASY', title: 'Ghost Shop',
    hook: 'A business has disappeared, but physical traces remain.',
    summary: 'Locate signage, fittings, packaging, marks or architectural clues left by a closed business.',
    find: 'Locate signage, fittings, packaging, marks or architectural clues left by a closed business.',
    investigate: 'Use the remaining evidence to identify what used to operate there.',
    document: 'Photograph the trace and reconstruct the most credible account you can support.',
    question: 'What former activity can still be read from this place?',
    guidance: 'Look for traces visible from public space and build the explanation only from evidence you can support.',
    acceptedEvidence: photo, shortFindingRequired: true,
  },
  {
    id: 'secret-menu', number: '10', set: 'CORE', difficulty: 'HARD', title: 'Secret Menu',
    hook: 'A real option may exist without appearing on the main menu or display.',
    summary: 'Identify an off-menu variation, local ordering custom or customisable option the business genuinely offers.',
    find: 'Identify an off-menu variation, local ordering custom or customisable option that the business genuinely offers.',
    investigate: 'Confirm it respectfully through visible cues or by asking staff once, without pressuring them.',
    document: 'With permission where required, photograph the result and explain how people learn about it.',
    question: 'How does this option circulate without being formally advertised?',
    guidance: 'Confirm through visible cues first. If needed, ask staff once and accept the answer without pressure.',
    acceptedEvidence: photo, shortFindingRequired: true,
    safetyNote: 'Do not pressure staff or request anything the business has not offered. Ask permission before photographing where required.',
  },
  {
    id: 'after-hours', number: '11', set: 'CORE', difficulty: 'MEDIUM', title: 'After Hours',
    hook: 'A familiar place may perform a different function when its normal activity ends.',
    summary: 'Revisit a publicly accessible area at a safe, appropriate time outside its usual busy period.',
    find: 'Revisit a publicly accessible area at a safe, appropriate time outside its usual busy period.',
    investigate: 'Observe how its users, atmosphere or purpose changes.',
    document: 'Photograph a public detail and compare the visible daytime expectation with the after-hours reality.',
    question: 'What second life appears when the usual activity stops?',
    guidance: 'Choose a safe, well-used public setting and an appropriate time; the mission never requires late-night exploration.',
    acceptedEvidence: photo, shortFindingRequired: true,
    safetyNote: 'Stay in safe, publicly accessible areas. Do not enter isolated, closed or private places, and do not stay out later just to complete the mission.',
  },
  {
    id: 'local-knowledge', number: '12', set: 'CORE', difficulty: 'HARD', title: 'Local Knowledge',
    hook: 'A neighbourhood contains useful knowledge that search results do not explain well.',
    summary: 'Notice a local practice, shortcut, object, sign or place whose meaning is unclear to an outsider.',
    find: 'Notice a local practice, shortcut, object, sign or place whose meaning is unclear to an outsider.',
    investigate: 'Interpret it through observation, public clues or a respectful conversation when appropriate.',
    document: 'Photograph a non-identifying detail and explain the knowledge needed to understand it.',
    question: 'What can only be understood by paying attention locally?',
    guidance: 'Use observation and public clues first. Keep any local conversation brief, optional and respectful.',
    acceptedEvidence: photo, shortFindingRequired: true,
  },
  {
    id: 'permanent-temporary', number: '13', set: 'EXTENDED', difficulty: 'EASY', title: 'Permanent Temporary',
    hook: 'A temporary repair has quietly become part of the permanent landscape.',
    summary: 'Find a patched, taped, propped-up or improvised solution that appears to have outlived its temporary purpose.',
    find: 'Find a patched, taped, propped-up or improvised solution that appears to have outlived its temporary purpose.',
    investigate: 'Look for wear, additions or surrounding clues that reveal how long it has remained and why nobody replaced it.',
    document: 'Capture the solution using Photo or Video and explain what keeps the temporary fix alive.',
    question: 'When does a temporary solution become the official solution?',
    guidance: 'Look for wear, additions and nearby clues before deciding why the temporary fix has lasted.',
    acceptedEvidence: photoVideo, shortFindingRequired: true,
  },
  {
    id: 'instructions-for-nobody', number: '14', set: 'EXTENDED', difficulty: 'EASY', title: 'Instructions for Nobody',
    hook: 'A sign is still giving orders to people, objects or activities that no longer exist.',
    summary: 'Find an obsolete, contradictory or strangely specific public instruction.',
    find: 'Find an obsolete, contradictory or strangely specific public instruction.',
    investigate: 'Compare the instruction with the present environment and work out who it originally addressed.',
    document: 'Capture the sign and its context using Photo or Video, then explain what changed around it.',
    question: 'Who was this instruction originally for, and why is it still here?',
    guidance: 'Compare the instruction with the current surroundings and look for traces of its former audience.',
    acceptedEvidence: photoVideo, shortFindingRequired: true,
  },
  {
    id: 'one-job', number: '15', set: 'EXTENDED', difficulty: 'EASY', title: 'One Job',
    hook: 'An object is doing a job it was clearly not designed to do.',
    summary: 'Find an everyday object being repurposed as a weight, barrier, marker, repair, support or tool.',
    find: 'Find an everyday object being repurposed as a weight, barrier, marker, repair, support or tool.',
    investigate: 'Observe how it is used and what problem the unofficial function solves.',
    document: 'Capture the repurposed object using Photo or Video and describe its new job.',
    question: 'What failure, shortage or local habit gave this object a second career?',
    guidance: 'Observe the repurposed use without touching or moving the object.',
    acceptedEvidence: photoVideo, shortFindingRequired: true,
  },
  {
    id: 'everybody-walks-around-it', number: '16', set: 'EXTENDED', difficulty: 'EASY', title: 'Everybody Walks Around It',
    hook: 'One small feature silently changes how everybody moves.',
    summary: 'Find an obstacle, mark, surface or object that causes people to alter their path in a public place.',
    find: 'Find an obstacle, mark, surface or object that causes people to alter their path in a public place.',
    investigate: 'Observe the movement pattern without photographing identifiable people.',
    document: 'Use Video of the environment without identifiable faces, or Photo of the feature, and explain the behaviour it produces.',
    question: 'What invisible rule has formed around this object?',
    guidance: 'Observe from a fixed, safe position and focus on the environmental pattern rather than individuals.',
    acceptedEvidence: photoVideo, shortFindingRequired: true,
    safetyNote: 'Do not block pedestrian movement or capture identifiable faces without permission.',
  },
  {
    id: 'the-sound-behind-the-wall', number: '17', set: 'EXTENDED', difficulty: 'MEDIUM', title: 'The Sound Behind the Wall',
    hook: 'A sound is clearly present, but its source is hidden or misleading.',
    summary: 'Find a recurring public sound whose source cannot be identified immediately.',
    find: 'Find a recurring public sound whose source cannot be identified immediately.',
    investigate: 'Follow it safely through publicly accessible space and use timing, direction or nearby clues to identify the most credible source.',
    document: 'Use Audio or Video and add a short explanation of what produced the sound.',
    question: 'What ordinary system creates this unexplained sound?',
    guidance: 'Use timing and direction to investigate, but remain in public space and stop if the source leads somewhere private or restricted.',
    acceptedEvidence: audioVideo, shortFindingRequired: true,
    safetyNote: 'Do not follow a sound into private, restricted, isolated or unsafe areas.',
  },
  {
    id: 'nobody-uses-this-door', number: '18', set: 'EXTENDED', difficulty: 'MEDIUM', title: 'Nobody Uses This Door',
    hook: 'A doorway remains visible even though people appear to have stopped using it.',
    summary: 'Find a blocked, sealed, ceremonial, redundant or strangely avoided entrance visible from public space.',
    find: 'Find a blocked, sealed, ceremonial, redundant or strangely avoided entrance visible from public space.',
    investigate: 'Study wear, signage, architecture and nearby routes to infer its former or current function.',
    document: 'Capture the entrance using Photo or Video and explain why it may have become functionally invisible.',
    question: 'What happened to the route this doorway once promised?',
    guidance: 'Study only what is visible from public space; do not test, open or enter unused doors.',
    acceptedEvidence: photoVideo, shortFindingRequired: true,
  },
  {
    id: 'accidental-museum', number: '19', set: 'EXTENDED', difficulty: 'MEDIUM', title: 'Accidental Museum',
    hook: 'An ordinary place has begun displaying its own history without officially becoming a museum.',
    summary: 'Find a shop, lobby, workshop or public-facing place where old tools, products, photographs or remains have accumulated.',
    find: 'Find a shop, lobby, workshop or public-facing place where old tools, products, photographs or remains have accumulated.',
    investigate: 'Investigate whether the display is deliberate, practical, sentimental or simply never removed.',
    document: 'Capture a non-sensitive detail using Photo or Video and explain what story the collection tells.',
    question: 'When does stored clutter become local history?',
    guidance: 'Focus on public-facing, non-sensitive details and ask permission when a private display is involved.',
    acceptedEvidence: photoVideo, shortFindingRequired: true,
  },
  {
    id: 'same-place-different-rules', number: '20', set: 'EXTENDED', difficulty: 'MEDIUM', title: 'Same Place, Different Rules',
    hook: 'Crossing an almost invisible boundary changes what people do.',
    summary: 'Find two adjoining public areas where behaviour, language, sound, movement or use changes without a dramatic physical barrier.',
    find: 'Find two adjoining public areas where behaviour, language, sound, movement or use changes without a dramatic physical barrier.',
    investigate: 'Identify the boundary through repeated visible or audible clues.',
    document: 'Use Photo, Video or Audio to capture the contrast and explain the unwritten rule on each side.',
    question: 'What changes at this boundary even though the city appears continuous?',
    guidance: 'Compare both sides from public space and focus on environmental cues rather than identifiable individuals.',
    acceptedEvidence: allEvidence, shortFindingRequired: true,
  },
  {
    id: 'last-one-standing', number: '21', set: 'EXTENDED', difficulty: 'HARD', title: 'Last One Standing',
    hook: 'One place, object or service survives after similar examples around it have disappeared.',
    summary: 'Find a remaining example of a once-common local feature, trade, machine, service or design.',
    find: 'Find a remaining example of a once-common local feature, trade, machine, service or design.',
    investigate: 'Use physical evidence and public clues to understand what allowed it to survive.',
    document: 'Capture the survivor using Photo, Video or Audio and explain what keeps it operating or meaningful.',
    question: 'Why did this example remain when the others disappeared?',
    guidance: 'Use physical evidence and reliable public clues; keep any conversation optional and respectful.',
    acceptedEvidence: allEvidence, shortFindingRequired: true,
  },
  {
    id: 'public-secret', number: '22', set: 'EXTENDED', difficulty: 'HARD', title: 'Public Secret',
    hook: 'Many people seem to know something that is barely written down.',
    summary: 'Find a public-facing shortcut, custom, service, timing pattern or informal rule shared through local knowledge.',
    find: 'Find a public-facing shortcut, custom, service, timing pattern or informal rule shared through local knowledge.',
    investigate: 'Confirm it through repeated observation, visible clues or one respectful enquiry without pressuring anyone.',
    document: 'Choose Photo, Video or Audio evidence that does not expose private information, then explain how the knowledge circulates.',
    question: 'How does everybody know this when almost nobody announces it?',
    guidance: 'Use repeated observation and public clues first; if you ask someone, ask once and do not seek private information.',
    acceptedEvidence: allEvidence, shortFindingRequired: true,
    safetyNote: 'Do not pressure staff or locals, reveal private information, trespass or document anything that is not public-facing.',
  },
  {
    id: 'urban-fossil', number: '23', set: 'EXTENDED', difficulty: 'HARD', title: 'Urban Fossil',
    hook: 'A piece of infrastructure survives after the system it belonged to has vanished.',
    summary: 'Find a rail, bracket, cable mount, loading feature, machine base, road marking or architectural fragment visible from public space.',
    find: 'Find a rail, bracket, cable mount, loading feature, machine base, road marking or architectural fragment visible from public space.',
    investigate: 'Reconstruct the lost system through surrounding evidence and reliable public information.',
    document: 'Capture the fossil using Photo or Video and explain the larger system it once served.',
    question: 'What missing system can still be reconstructed from this fragment?',
    guidance: 'Stay in public space and reconstruct the system from visible evidence and reliable public information.',
    acceptedEvidence: photoVideo, shortFindingRequired: true,
  },
  {
    id: 'copy-paste-error', number: '24', set: 'EXTENDED', difficulty: 'HARD', title: 'Copy-Paste Error',
    hook: 'A repeated urban pattern contains one version that breaks the rule.',
    summary: 'Find a row, series or repeated system of signs, windows, objects, sounds or structures with one meaningful variation.',
    find: 'Find a row, series or repeated system of signs, windows, objects, sounds or structures with one meaningful variation.',
    investigate: 'Compare several examples and investigate whether the difference comes from repair, ownership, time, use or accident.',
    document: 'Use Photo, Video or Audio to document the pattern and its exception, then explain the most credible reason for the difference.',
    question: 'Why did this one copy refuse to match the others?',
    guidance: 'Compare several examples before deciding which difference is meaningful and what may explain it.',
    acceptedEvidence: allEvidence, shortFindingRequired: true,
  },
];

export const activeMission = missions.find(mission => mission.id === 'why-is-this-here')!;

export const nextMission = {
  ...missions.find(mission => mission.id === 'wrong-dlc')!,
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
