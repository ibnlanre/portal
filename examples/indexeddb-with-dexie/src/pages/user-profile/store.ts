import { createStore } from "@ibnlanre/portal";

import { createIndexedDBAdapter } from "@/utilities/create-indexeddb-adapter";

export interface UserProfile {
  avatar?: string;
  email: string;
  lastLogin: Date;
  name: string;
  preferences: Preferences;
}

interface Preferences {
  notifications: boolean;
  theme: "dark" | "light";
}

interface StoredUserProfile extends Omit<UserProfile, "lastLogin"> {
  lastLogin: string; // Store as ISO string for IndexedDB
}

const [getStoredProfile, setStoredProfile] = createIndexedDBAdapter<
  UserProfile,
  StoredUserProfile
>("userProfile", {
  beforeStorage(profile) {
    return {
      ...profile,
      lastLogin: profile.lastLogin.toISOString(),
    };
  },
  beforeUsage(profile) {
    return {
      ...profile,
      lastLogin: new Date(profile.lastLogin),
    };
  },
});

// Load initial state from IndexedDB
const initialProfile = await getStoredProfile();

export const profileStore = createStore({
  login: (profile: UserProfile) => {
    const loginProfile = { ...profile, lastLogin: new Date() };
    profileStore.profile.$set(loginProfile);
  },
  logout: () => {
    console.log("Logging out...");
    // Clear profile (from store, and IndexedDB)
    profileStore.profile.$set(undefined);
  },
  profile: initialProfile,
  updatePreferences: (preferences: Partial<UserProfile["preferences"]>) => {
    const currentProfile = profileStore.profile.$get();
    if (!currentProfile) return;

    const updatedProfile = {
      ...currentProfile,
      preferences: { ...currentProfile.preferences, ...preferences },
    };

    profileStore.profile.$set(updatedProfile);
  },
  updateProfile: (updates: Partial<UserProfile>) => {
    const currentProfile = profileStore.profile.$get();
    if (!currentProfile) return;

    const updatedProfile = { ...currentProfile, ...updates };
    profileStore.profile.$set(updatedProfile);
  },
});

// Subscribe to store changes and auto-persist
profileStore.profile.$act(setStoredProfile);
