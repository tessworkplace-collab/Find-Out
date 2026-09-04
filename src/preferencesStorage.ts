import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserPreferences = {
  displayName: string;
  missionReminders: boolean;
  locationAccess: boolean;
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  displayName: 'Tess',
  missionReminders: true,
  locationAccess: false,
};

const PREFERENCES_KEY = 'findout:user-preferences:v1';

export async function loadUserPreferences(): Promise<UserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_USER_PREFERENCES;

    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      displayName:
        typeof parsed.displayName === 'string' && parsed.displayName.trim()
          ? parsed.displayName.trim().slice(0, 24)
          : DEFAULT_USER_PREFERENCES.displayName,
      missionReminders:
        typeof parsed.missionReminders === 'boolean'
          ? parsed.missionReminders
          : DEFAULT_USER_PREFERENCES.missionReminders,
      locationAccess:
        typeof parsed.locationAccess === 'boolean'
          ? parsed.locationAccess
          : DEFAULT_USER_PREFERENCES.locationAccess,
    };
  } catch {
    return DEFAULT_USER_PREFERENCES;
  }
}

export async function saveUserPreferences(preferences: UserPreferences) {
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}
