import * as Haptics from "expo-haptics";

import { useSettingsStore } from "@/store/settings-store";

// Thin wrapper around expo-haptics that respects the user's haptics
// preference. Called from gesture worklets and event handlers alike (never
// during render), so reading the store via getState() — not the hook — is
// correct here.
function enabled() {
  return useSettingsStore.getState().hapticsEnabled;
}

export const haptics = {
  impact: (style: Haptics.ImpactFeedbackStyle) => {
    if (enabled()) Haptics.impactAsync(style);
  },
  notification: (type: Haptics.NotificationFeedbackType) => {
    if (enabled()) Haptics.notificationAsync(type);
  },
  selection: () => {
    if (enabled()) Haptics.selectionAsync();
  },
};
