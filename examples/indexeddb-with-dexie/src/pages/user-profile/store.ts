import { z } from "zod";

import { createStore } from "@ibnlanre/portal";

import { createIndexedDBAdapter } from "@/utilities/create-indexeddb-adapter";

export const preferencesSchema = z.object({
  notifications: z.boolean(),
  theme: z.enum(["dark", "light"]),
});

export type Preferences = z.infer<typeof preferencesSchema>;

export const userProfileSchema = z.object({
  avatar: z.string().optional(),
  email: z.string(),
  lastLogin: z.date(),
  name: z.string(),
  preferences: preferencesSchema,
});

export type UserProfile = z.infer<typeof userProfileSchema>;

type StoredUserProfile = Omit<UserProfile, "lastLogin"> & {
  lastLogin: string; // Store as ISO string for IndexedDB
};

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

export const profileStore = {
  profile: createStore(userProfileSchema, initialProfile),

  login(profile: UserProfile) {
    const loginProfile = { ...profile, lastLogin: new Date() };
    profileStore.profile.$set(loginProfile);
  },

  logout() {
    console.log("Logging out...");
    // Clear profile (from store, and IndexedDB)
    profileStore.profile.$set(undefined as unknown as UserProfile);
  },

  updatePreferences(preferences: Partial<Preferences>) {
    const currentProfile = profileStore.profile.$get();
    if (!currentProfile) return;

    const updatedProfile = {
      ...currentProfile,
      preferences: { ...currentProfile.preferences, ...preferences },
    };

    profileStore.profile.$set(updatedProfile);
  },

  updateProfile(updates: Partial<UserProfile>) {
    const currentProfile = profileStore.profile.$get();
    if (!currentProfile) return;

    const updatedProfile = { ...currentProfile, ...updates };
    profileStore.profile.$set(updatedProfile);
  },
};

// Subscribe to store changes and auto-persist
profileStore.profile.$subscribe(setStoredProfile);
