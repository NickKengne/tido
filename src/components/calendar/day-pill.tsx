import { GlassView } from "expo-glass-effect";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

type DayPillProps = {
  weekday: string;
  day: number;
  selected: boolean;
  isFuture: boolean;
  onPress: () => void;
};

export function DayPill({ weekday, day, selected, isFuture, onPress }: DayPillProps) {
  return (
    // `style` must stay a plain object here, not the usual `({ pressed }) => [...]`
    // callback — under this project's nativewind jsxImportSource that callback
    // form silently drops `flex: 1` on native (fine on web), which was
    // collapsing every pill to its content width instead of the shared column.
    // Pressed feedback instead goes on the inner wrapper via `children`.
    <Pressable onPress={onPress} hitSlop={4} style={styles.column}>
      {({ pressed }) => (
        <View style={[styles.inner, pressed && styles.innerPressed]}>
          <Text style={[styles.weekday, selected && styles.weekdaySelected]}>
            {weekday}
          </Text>
          <Animated.View style={styles.pillSlot}>
            {selected ? (
              <Animated.View
                entering={FadeIn.duration(150)}
                exiting={FadeOut.duration(100)}
                style={StyleSheet.absoluteFill}
              >
                {isFuture ? (
                  <View style={styles.futurePill} />
                ) : (
                  <GlassView
                    glassEffectStyle={{ style: "clear", animate: true }}
                    tintColor="#000000"
                    isInteractive
                    style={pillGlassStyle}
                  />
                )}
              </Animated.View>
            ) : null}
            <Text style={[styles.day, selected && !isFuture && styles.daySelected]}>
              {day}
            </Text>
          </Animated.View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
  },
  inner: {
    alignItems: "center",
    gap: 8,
  },
  innerPressed: {
    opacity: 0.7,
  },
  weekday: {
    fontSize: 13,
    fontFamily: "Saans-Medium",
    color: "#A6A8B0",
  },
  weekdaySelected: {
    color: "#17171B",
  },
  pillSlot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  day: {
    fontSize: 15,
    fontFamily: "Saans-SemiBold",
    color: "#17171B",
  },
  daySelected: {
    color: "#ffffff",
  },
  futurePill: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "#E4E4EA",
  },
});

// GlassView falls back to a plain (transparent) View on platforms other than
// iOS 26+, so it needs an opaque fallback color there (mirrors app-tabs.tsx).
const pillGlassStyle = StyleSheet.flatten([
  { width: 44, height: 44, borderRadius: 22 },
  Platform.OS !== "ios" && { backgroundColor: "#17171B" },
]);
