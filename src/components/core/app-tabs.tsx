import {
    Calendar01Icon,
    Home02Icon,
    Settings01Icon,
    TaskDaily01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { GlassView } from "expo-glass-effect";
import { useSegments } from "expo-router";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = [
  { name: "index", href: "/", icon: Home02Icon },
  { name: "calendar", href: "/calendar", icon: Calendar01Icon },
  { name: "plan", href: "/plan", icon: TaskDaily01Icon },
  { name: "settings", href: "/settings", icon: Settings01Icon },
] as const;

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  // At the tabs root, segments is just ["(tabs)"] — map that to the "index" tab.
  const currentRoute =
    segments.length === 1 ? "index" : segments[segments.length - 1];

  return (
    <Tabs>
      <TabSlot />

      <TabList
        asChild
        style={[styles.tabBar, { bottom: Math.max(insets.bottom, 20) + 8 }]}
      >
        <GlassView glassEffectStyle="regular" style={glassBarStyle}>
          {TABS.map((tab) => {
            const focused = currentRoute === tab.name;

            return (
              <TabTrigger
                key={tab.name}
                name={tab.name}
                href={tab.href as any}
                asChild
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.tabItem,
                    pressed && styles.tabItemPressed,
                  ]}
                >
                  {focused ? (
                    <GlassView
                      glassEffectStyle={{ style: "clear", animate: true }}
                      tintColor="#000000"
                      isInteractive
                      style={styles.iconWrapFocused}
                    >
                      <HugeiconsIcon
                        icon={tab.icon!}
                        size={24}
                        color="#fff"
                        strokeWidth={1.75}
                      />
                    </GlassView>
                  ) : (
                    <View style={styles.iconWrap}>
                      <HugeiconsIcon
                        icon={tab.icon!}
                        size={24}
                        color="#888888"
                        strokeWidth={1.5}
                      />
                    </View>
                  )}
                </Pressable>
              </TabTrigger>
            );
          })}
        </GlassView>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  slot: {
    flex: 1,
  },
  tabBar: {
    position: "absolute",
    left: "23%",
    right: "23%",
  },
  glassBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 100,
    height: 60,
    paddingHorizontal: 8,
    overflow: "hidden",
  },
  glassBarFallback: {
    backgroundColor: "#fff",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  tabItemPressed: {
    transform: [{ scale: 0.9 }],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapFocused: {
    width: 40,
    height: 40,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
});

// GlassView falls back to a plain (transparent) View on platforms other than
// iOS 26+, so it needs an opaque style of its own there.
const glassBarStyle = StyleSheet.flatten([
  styles.glassBar,
  Platform.OS !== "ios" && styles.glassBarFallback,
]);
