import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_MISSION_IDS, CORE_MISSION_IDS, getMissionById, MissionDifficulty, MissionEvidenceMode } from './missions';

export type TrophyDiscovery = {
  missionId: string;
  evidenceType: MissionEvidenceMode;
  observation: string;
  location: string;
  completedAt: string;
};

type ActivityKey = 'retakeTotal' | 'maxMissionRetakes' | 'returnedAfterSevenDays' | 'deadLinkNoTrace' | 'deadLinkSurvived' | 'respectfulConversationCount' | 'resumedDraftAfter24h' | 'safeObservationCount';
type Criteria =
  | { type: 'missionCount'; count: number }
  | { type: 'difficultyCount'; difficulty: MissionDifficulty; count: number }
  | { type: 'missionSet'; missionIds: string[] }
  | { type: 'mission'; missionId: string }
  | { type: 'evidenceSet'; modes: MissionEvidenceMode[] }
  | { type: 'observationLength'; count: number }
  | { type: 'noLocationCount'; count: number }
  | { type: 'difficultySet'; difficulties: MissionDifficulty[] }
  | { type: 'activity'; key: ActivityKey; count: number }
  | { type: 'allMissionsAndHidden'; hiddenCount: number };

export type TrophyDefinition = {
  id: string;
  name: string;
  title: string;
  description: string;
  criteria: Criteria;
  hidden: boolean;
  launch: boolean;
  group: 'Achievement' | 'Secret' | 'Extended';
};

export type TrophyActivity = {
  retakeTotal: number;
  missionRetakes: Record<string, number>;
  returnedAfterSevenDays: boolean;
  deadLinkNoTrace: boolean;
  deadLinkSurvived: boolean;
  respectfulConversationCount: number;
  resumedDraftAfter24h: boolean;
  safeObservationCount: number;
};

export type TrophyState = {
  equippedTrophyId: string | null;
  unlockedAt: Record<string, string>;
  activity: TrophyActivity;
};

export type TrophyEvaluation = {
  definition: TrophyDefinition;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
  equipped: boolean;
};

const STORAGE_KEY = 'findout:trophy-state:v1';
export const DEFAULT_TROPHY_STATE: TrophyState = {
  equippedTrophyId: null,
  unlockedAt: {},
  activity: {
    retakeTotal: 0, missionRetakes: {}, returnedAfterSevenDays: false,
    deadLinkNoTrace: false, deadLinkSurvived: false, respectfulConversationCount: 0,
    resumedDraftAfter24h: false, safeObservationCount: 0,
  },
};

const make = (
  id: string, name: string, title: string, description: string, criteria: Criteria,
  hidden = false, launch = true, group: TrophyDefinition['group'] = 'Achievement',
): TrophyDefinition => ({ id, name, title, description, criteria, hidden, launch, group });
const secret = (id: string, name: string, title: string, description: string, criteria: Criteria, launch = false) =>
  make(id, name, title, description, criteria, true, launch, 'Secret');
const extended = (id: string, name: string, title: string, description: string, missionId: string) =>
  make(id, name, title, description, { type: 'mission', missionId }, true, true, 'Extended');

export const TROPHIES: TrophyDefinition[] = [
  make('first-finding', 'First Finding', 'CURIOUS STARTER', 'Complete and submit your first real-world discovery.', { type: 'missionCount', count: 1 }),
  make('sharp-observer', 'Sharp Observer', 'DETAIL HUNTER', 'Complete three Easy missions.', { type: 'difficultyCount', difficulty: 'Easy', count: 3 }),
  make('field-investigator', 'Field Investigator', 'FIELD INVESTIGATOR', 'Complete three Medium missions.', { type: 'difficultyCount', difficulty: 'Medium', count: 3 }),
  make('deep-diver', 'Deep Diver', 'DEEP RESEARCHER', 'Complete three Hard missions.', { type: 'difficultyCount', difficulty: 'Hard', count: 3 }),
  make('trace-reader', 'Trace Reader', 'TRACE READER', 'Read physical remains, mismatches and changes over time.', { type: 'missionSet', missionIds: ['dead-link', 'why-is-this-here', 'ghost-shop'] }, true),
  make('neighbourhood-decoder', 'Neighbourhood Decoder', 'LOCAL DECODER', 'Notice how informal behaviour and local knowledge circulate.', { type: 'missionSet', missionIds: ['the-queue', 'offline-famous', 'secret-menu'] }, true),
  make('mixed-evidence', 'Mixed Evidence', 'MULTI-FORMAT EXPLORER', 'Submit at least one Photo, one Video and one Audio discovery.', { type: 'evidenceSet', modes: ['photo', 'video', 'audio'] }, true),
  make('night-observer', 'Night Observer', 'NIGHT OBSERVER', 'Complete After Hours at a safe and appropriate time.', { type: 'mission', missionId: 'after-hours' }, true),
  make('independent-route', 'Independent Route', 'INDEPENDENT EXPLORER', 'Complete six different missions.', { type: 'missionCount', count: 6 }),
  make('open-discovery', 'Open Discovery', 'INFORMATION-GAP EXPLORER', 'Complete all twelve Core missions.', { type: 'missionSet', missionIds: CORE_MISSION_IDS }),

  secret('flushed-five-times', 'Flushed Five Times', 'QUALITY CONTROL DEPARTMENT', 'Five pieces of evidence went down the drain. No water was wasted.', { type: 'activity', key: 'retakeTotal', count: 5 }, true),
  secret('three-retakes-later', 'Three Retakes Later', 'PERFECTIONIST, ALLEGEDLY', 'The discovery stayed the same. Your standards did not.', { type: 'activity', key: 'maxMissionRetakes', count: 3 }, true),
  secret('nobody-asked', 'Nobody Asked', 'CERTIFIED OVER-EXPLAINER', 'The app requested a short finding. You submitted a minor thesis.', { type: 'observationLength', count: 300 }, true),
  secret('touch-grass', 'Touch Grass', 'BACK OUTSIDE', 'You returned to the physical world. It had not updated its terms and conditions.', { type: 'activity', key: 'returnedAfterSevenDays', count: 1 }),
  secret('reality-not-found', '404: Reality Not Found', 'ERROR IN THE WILD', 'The internet was wrong. Reality declined to comment.', { type: 'activity', key: 'deadLinkNoTrace', count: 1 }, true),
  secret('still-here-somehow', 'Still Here, Somehow', 'UNKILLABLE WITNESS', 'Outdated online, alive offline, operating on pure stubbornness.', { type: 'activity', key: 'deadLinkSurvived', count: 1 }),
  secret('map-failed-to-load', 'Map Failed to Load', 'WRONG SERVER', 'The object belongs here. The surrounding world may be the mistake.', { type: 'mission', missionId: 'wrong-dlc' }, true),
  secret('who-approved-this', 'Who Approved This?', 'URBAN QUALITY CONTROL', 'You found two design decisions and no responsible adult.', { type: 'missionSet', missionIds: ['why-is-this-here', 'wrong-dlc'] }),
  secret('ghosted-by-commerce', 'Ghosted by Commerce', 'RETAIL NECROMANCER', 'The business is gone. The sign is still working unpaid overtime.', { type: 'mission', missionId: 'ghost-shop' }, true),
  secret('queue-has-lore', 'The Queue Has Lore', 'LINE DETECTIVE', 'You discovered why everyone was waiting. You are still not moving any faster.', { type: 'mission', missionId: 'the-queue' }, true),
  secret('npc-dialogue-unlocked', 'NPC Dialogue Unlocked', 'SOCIAL SIDE QUEST', 'You spoke to a real person. No dialogue wheel was provided.', { type: 'activity', key: 'respectfulConversationCount', count: 1 }),
  secret('order-at-own-risk', 'Order at Own Risk', 'UNOFFICIAL CUSTOMER', 'It was not on the menu. It is now part of your permanent record.', { type: 'mission', missionId: 'secret-menu' }),
  secret('main-character-after-dark', 'Main Character After Dark', 'NIGHT-SHIFT NPC', 'Same location, different atmosphere, suspiciously cinematic lighting.', { type: 'mission', missionId: 'after-hours' }),
  secret('local-but-confused', 'Local, but Confused', 'HONORARY OUTSIDER', 'You understood one local rule and discovered four more questions.', { type: 'mission', missionId: 'local-knowledge' }, true),
  secret('all-formats-no-answers', 'All Formats, No Answers', 'MULTIMEDIA CONFUSION', 'Three evidence formats. The mystery remains professionally unresolved.', { type: 'evidenceSet', modes: ['photo', 'video', 'audio'] }),
  secret('this-seemed-important', 'This Seemed Important', 'LATE WITNESS', 'You came back to the clue before forgetting why it mattered.', { type: 'activity', key: 'resumedDraftAfter24h', count: 1 }),
  secret('not-a-tourist', 'Not a Tourist', 'OFF-GRID EXPLORER', 'Three discoveries, zero geotags, no content creator voice-over.', { type: 'noLocationCount', count: 3 }),
  secret('professional-bystander', 'Professional Bystander', 'BACKGROUND CHARACTER', 'You noticed everything and became evidence in nobody else’s story.', { type: 'activity', key: 'safeObservationCount', count: 3 }),
  secret('came-for-a-clue', 'Came for a Clue', 'CURIOUSLY CONCERNED', 'You came for a small mystery and left with questions about urban civilisation.', { type: 'difficultySet', difficulties: ['Easy', 'Medium', 'Hard'] }),

  extended('fixed-enough', 'Fixed Enough', 'UNLICENSED ENGINEER', 'Temporary since further notice.', 'permanent-temporary'),
  extended('last-person-reading', 'Last Person Reading', 'TERMS & CONDITIONS', 'The sign survived its audience. You became the replacement.', 'instructions-for-nobody'),
  extended('not-my-job', 'Not My Job', 'PROFESSIONAL IMPROVISER', 'Wrong tool, correct result, no warranty.', 'one-job'),
  extended('human-traffic-cone', 'Human Traffic Cone', 'MOVEMENT CONSULTANT', 'One object redesigned an entire walking pattern without submitting a proposal.', 'everybody-walks-around-it'),
  extended('wall-spoke-first', 'The Wall Spoke First', 'CERTIFIED WALL LISTENER', 'You followed the noise. The building would like legal representation.', 'the-sound-behind-the-wall'),
  extended('access-denied-forever', 'Access Denied Forever', 'DOOR HISTORIAN', 'The entrance still exists. Entry has become a historical concept.', 'nobody-uses-this-door'),
  extended('curated-by-neglect', 'Curated by Neglect', 'UNPAID CURATOR', 'Nothing was officially collected. Nothing was ever thrown away.', 'accidental-museum'),
  extended('border-without-customs', 'Border Without Customs', 'INVISIBLE BORDER AGENT', 'You crossed three metres and entered a different social operating system.', 'same-place-different-rules'),
  extended('final-boss-of-retail', 'Final Boss of Retail', 'LAST CUSTOMER ALIVE', 'Everything similar disappeared. This one refused the update.', 'last-one-standing'),
  extended('everyone-knows', 'Everyone Knows', 'WORST-KEPT SECRET', 'No advertisement, no instructions, apparently no confusion except yours.', 'public-secret'),
  extended('city-bone-collector', 'City Bone Collector', 'INFRASTRUCTURE NECROMANCER', 'You reconstructed a dead system from one suspicious metal bracket.', 'urban-fossil'),
  extended('ctrl-c-ctrl-what', 'Ctrl+C, Ctrl+What?', 'URBAN BUG TESTER', 'The pattern repeated perfectly until reality introduced a typo.', 'copy-paste-error'),
  secret('you-have-seen-too-much', 'You Have Seen Too Much', 'THE APP KNOWS YOUR NAME', 'You found everything the app refused to recommend. The app now knows your name.', { type: 'allMissionsAndHidden', hiddenCount: 5 }, true),
];

function activityValue(activity: TrophyActivity, key: ActivityKey) {
  if (key === 'maxMissionRetakes') return Math.max(0, ...Object.values(activity.missionRetakes));
  const value = activity[key];
  return typeof value === 'boolean' ? Number(value) : value;
}

function progressFor(criteria: Criteria, discoveries: TrophyDiscovery[], activity: TrophyActivity) {
  const missionIds = new Set(discoveries.map((item) => item.missionId));
  if (criteria.type === 'missionCount') return { progress: missionIds.size, target: criteria.count };
  if (criteria.type === 'difficultyCount') return { progress: [...missionIds].filter((id) => getMissionById(id)?.difficulty === criteria.difficulty).length, target: criteria.count };
  if (criteria.type === 'missionSet') return { progress: criteria.missionIds.filter((id) => missionIds.has(id)).length, target: criteria.missionIds.length };
  if (criteria.type === 'mission') return { progress: Number(missionIds.has(criteria.missionId)), target: 1 };
  if (criteria.type === 'evidenceSet') {
    const modes = new Set(discoveries.map((item) => item.evidenceType));
    return { progress: criteria.modes.filter((mode) => modes.has(mode)).length, target: criteria.modes.length };
  }
  if (criteria.type === 'observationLength') return { progress: Math.min(Math.max(0, ...discoveries.map((item) => item.observation.length)), criteria.count), target: criteria.count };
  if (criteria.type === 'noLocationCount') return { progress: new Set(discoveries.filter((item) => !item.location.trim()).map((item) => item.missionId)).size, target: criteria.count };
  if (criteria.type === 'difficultySet') {
    const completed = new Set([...missionIds].map((id) => getMissionById(id)?.difficulty).filter(Boolean) as MissionDifficulty[]);
    return { progress: criteria.difficulties.filter((item) => completed.has(item)).length, target: criteria.difficulties.length };
  }
  if (criteria.type === 'activity') return { progress: Math.min(activityValue(activity, criteria.key), criteria.count), target: criteria.count };
  return { progress: ALL_MISSION_IDS.filter((id) => missionIds.has(id)).length, target: ALL_MISSION_IDS.length };
}

export function evaluateTrophies(discoveries: TrophyDiscovery[], state: TrophyState): TrophyEvaluation[] {
  const evaluations = TROPHIES.map((definition) => {
    const result = progressFor(definition.criteria, discoveries, state.activity);
    const criteriaMet =
      definition.criteria.type !== 'allMissionsAndHidden' &&
      result.progress >= result.target;
    return {
      definition, ...result,
      unlocked: Boolean(state.unlockedAt[definition.id]) || criteriaMet,
      unlockedAt: state.unlockedAt[definition.id],
      equipped: state.equippedTrophyId === definition.id,
    };
  });
  const hiddenUnlocked = evaluations.filter((item) => item.definition.hidden && item.unlocked && item.definition.id !== 'you-have-seen-too-much').length;
  const finalTrophy = evaluations.find((item) => item.definition.id === 'you-have-seen-too-much');
  if (finalTrophy && ALL_MISSION_IDS.every((id) => discoveries.some((item) => item.missionId === id)) && hiddenUnlocked >= 5) {
    finalTrophy.unlocked = true;
    finalTrophy.progress = finalTrophy.target;
  }
  return evaluations;
}

export function visibleTrophyCabinet(evaluations: TrophyEvaluation[]) {
  return evaluations.filter((item) => item.definition.launch || item.unlocked).sort((a, b) => Number(b.unlocked) - Number(a.unlocked));
}

export function syncTrophyState(discoveries: TrophyDiscovery[], state: TrophyState, now = new Date().toISOString()) {
  const newlyUnlocked = evaluateTrophies(discoveries, state).filter((item) => item.unlocked && !state.unlockedAt[item.definition.id]).map((item) => item.definition.id);
  if (!newlyUnlocked.length) return { state, newlyUnlocked };
  return { state: { ...state, unlockedAt: { ...state.unlockedAt, ...Object.fromEntries(newlyUnlocked.map((id) => [id, now])) } }, newlyUnlocked };
}

export function recordEvidenceRetake(state: TrophyState, missionId: string) {
  return { ...state, activity: { ...state.activity, retakeTotal: state.activity.retakeTotal + 1, missionRetakes: { ...state.activity.missionRetakes, [missionId]: (state.activity.missionRetakes[missionId] ?? 0) + 1 } } };
}

export function equipTrophyTitle(state: TrophyState, trophyId: string | null) {
  return { ...state, equippedTrophyId: trophyId };
}

export function getEquippedTitle(state: TrophyState) {
  if (!state.equippedTrophyId || !state.unlockedAt[state.equippedTrophyId]) return null;
  return TROPHIES.find((item) => item.id === state.equippedTrophyId)?.title ?? null;
}

export async function loadTrophyState(): Promise<TrophyState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TROPHY_STATE;
    const stored = JSON.parse(raw) as Partial<TrophyState>;
    return {
      equippedTrophyId: typeof stored.equippedTrophyId === 'string' ? stored.equippedTrophyId : null,
      unlockedAt: stored.unlockedAt && typeof stored.unlockedAt === 'object' ? stored.unlockedAt : {},
      activity: { ...DEFAULT_TROPHY_STATE.activity, ...(stored.activity ?? {}), missionRetakes: { ...(stored.activity?.missionRetakes ?? {}) } },
    };
  } catch { return DEFAULT_TROPHY_STATE; }
}

export async function saveTrophyState(state: TrophyState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
