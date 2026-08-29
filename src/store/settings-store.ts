import { create } from "zustand";

export type WeekStart = "monday" | "sunday";

type SettingsStore = {
  hapticsEnabled: boolean;
  weekStartsOn: WeekStart;
  toggleHaptics: () => void;
  setWeekStartsOn: (day: WeekStart) => void;
};

// App-wide preferences. Not decorative — hapticsEnabled actually gates every
// Haptics.* call (see src/lib/haptics.ts) and weekStartsOn actually changes
// which day the calendar's week strip starts on.
export const useSettingsStore = create<SettingsStore>((set) => ({
  hapticsEnabled: true,
  weekStartsOn: "monday",
  toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),
  setWeekStartsOn: (day) => set({ weekStartsOn: day }),
}));
