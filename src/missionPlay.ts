import {
  getMissionById,
  MISSIONS,
  MissionDefinition,
  MissionDifficulty,
  MissionEvidenceMode,
} from './missions';

export type MissionRemix = {
  id: string;
  label: string;
  description: string;
  evidenceMode?: MissionEvidenceMode;
};

export type WeeklyCase = {
  key: string;
  startsAt: string;
  requiredDifficulties: MissionDifficulty[];
};

type Completion = {
  missionId: string;
  completedAt: string;
};

export type MissionDeckCard = {
  mission: MissionDefinition;
  isWildCard: boolean;
};

const difficulties: MissionDifficulty[] = ['Easy', 'Medium', 'Hard'];

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function pickByDifficulty(
  difficulty: MissionDifficulty,
  seed: string,
  offset = 0,
  excludedIds: Set<string> = new Set(),
) {
  const all = MISSIONS.filter((mission) => mission.difficulty === difficulty);
  const available = all.filter((mission) => !excludedIds.has(mission.id));
  const pool = available.length > 0 ? available : all;
  return pool[(hash(`${seed}:${difficulty}`) + offset) % pool.length];
}

export function getMissionDeck(
  seed: string,
  shuffleRound = 0,
  completedMissionIds: string[] = [],
): MissionDeckCard[] {
  const completed = new Set(completedMissionIds);
  const selectedIds = new Set<string>();
  const excludedIds = new Set([...completed, ...selectedIds]);
  const draw = (difficulty: MissionDifficulty, offset: number) => {
    const mission = pickByDifficulty(difficulty, seed, shuffleRound * 5 + offset, excludedIds);
    selectedIds.add(mission.id);
    excludedIds.add(mission.id);
    return mission;
  };

  const easyOne = draw('Easy', 0);
  const easyTwo = draw('Easy', 1);
  const medium = draw('Medium', 2);
  const hard = draw('Hard', 3);
  const wildDifficulty = difficulties[hash(`${seed}:wild:${shuffleRound}`) % difficulties.length];
  const wild = draw(wildDifficulty, 4);

  return [
    { mission: easyOne, isWildCard: false },
    { mission: easyTwo, isWildCard: false },
    { mission: medium, isWildCard: false },
    { mission: hard, isWildCard: false },
    { mission: wild, isWildCard: true },
  ];
}

export function getDailyDeckKey(now = new Date()) {
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

function mondayFor(date: Date) {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  const day = monday.getDay() || 7;
  monday.setDate(monday.getDate() - day + 1);
  return monday;
}

export function getWeeklyCase(now = new Date()): WeeklyCase {
  const startsAt = mondayFor(now);
  const key = [
    startsAt.getFullYear(),
    String(startsAt.getMonth() + 1).padStart(2, '0'),
    String(startsAt.getDate()).padStart(2, '0'),
  ].join('-');
  return {
    key,
    startsAt: startsAt.toISOString(),
    requiredDifficulties: difficulties,
  };
}

export function getWeeklyCaseProgress(
  completions: Completion[],
  weeklyCase = getWeeklyCase(),
) {
  const startsAt = Date.parse(weeklyCase.startsAt);
  return new Set(
    completions
      .filter(
        (item) =>
          Number.isFinite(Date.parse(item.completedAt)) &&
          Date.parse(item.completedAt) >= startsAt,
      )
      .map((item) => getMissionById(item.missionId)?.difficulty)
      .filter(
        (difficulty): difficulty is MissionDifficulty =>
          difficulty !== undefined &&
          weeklyCase.requiredDifficulties.includes(difficulty as MissionDifficulty),
      ),
  ).size;
}

const REMIXES: Omit<MissionRemix, 'evidenceMode'>[] = [
  {
    id: 'new-context',
    label: 'NEW CONTEXT',
    description: 'Repeat the same question in a different environment and compare the outcome.',
  },
  {
    id: 'quick-field-note',
    label: '15-MINUTE FIELD NOTE',
    description: 'Complete a focused version in fifteen minutes without rushing or taking risks.',
  },
  {
    id: 'no-location',
    label: 'NO LOCATION',
    description: 'Let the evidence explain the discovery without adding a place name.',
  },
  {
    id: 'second-reading',
    label: 'SECOND READING',
    description: 'Look for an interpretation that is meaningfully different from your first finding.',
  },
];

export function getNextMissionRemix(
  missionId: string,
  completionCount: number,
  previousEvidenceMode?: MissionEvidenceMode,
): MissionRemix {
  const mission = getMissionById(missionId) ?? MISSIONS[0];
  const canSwitchFormat = mission.evidenceModes.length > 1;
  const cycleLength = REMIXES.length + Number(canSwitchFormat);
  const index = Math.max(0, completionCount - 1) % cycleLength;

  if (canSwitchFormat && index === 0) {
    const currentIndex = Math.max(
      0,
      mission.evidenceModes.indexOf(previousEvidenceMode ?? mission.evidenceModes[0]),
    );
    const evidenceMode =
      mission.evidenceModes[(currentIndex + 1) % mission.evidenceModes.length];
    return {
      id: `switch-format-${evidenceMode}`,
      label: `SWITCH TO ${evidenceMode.toUpperCase()}`,
      description: `Repeat the mission using ${evidenceMode} evidence instead of your previous format.`,
      evidenceMode,
    };
  }

  return REMIXES[(index - Number(canSwitchFormat) + REMIXES.length) % REMIXES.length];
}

export function getMissionRemixById(
  missionId: string,
  remixId?: string | null,
): MissionRemix | null {
  if (!remixId) return null;
  const stored = REMIXES.find((remix) => remix.id === remixId);
  if (stored) return stored;
  if (!remixId.startsWith('switch-format-')) return null;
  const evidenceMode = remixId.replace('switch-format-', '') as MissionEvidenceMode;
  const mission = getMissionById(missionId);
  if (!mission?.evidenceModes.includes(evidenceMode)) return null;
  return {
    id: remixId,
    label: `SWITCH TO ${evidenceMode.toUpperCase()}`,
    description: `Repeat the mission using ${evidenceMode} evidence instead of your previous format.`,
    evidenceMode,
  };
}
