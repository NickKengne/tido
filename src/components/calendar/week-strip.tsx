import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

import { DayPill } from "@/components/calendar/day-pill";

export type WeekDay = {
  date: Date;
  weekday: string;
  day: number;
};

type WeekStripProps = {
  days: WeekDay[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

// Strong ease-in-out for on-screen movement (the dot repositioning), per the
// animation decision framework: moving/morphing elements use ease-in-out.
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

export function WeekStrip({ days, selectedIndex, onSelect }: WeekStripProps) {
  // Worklets copy their JS closure to the UI thread, and `days` holds `Date`
  // objects that Reanimated can't clone — so only the primitive length
  // (not the `days` array itself) may be referenced inside the worklets below.
  const dayCount = days.length;

  const progress = useDerivedValue(
    () => withTiming(selectedIndex, { duration: 220, easing: EASE_IN_OUT }),
    [selectedIndex],
  );

  const markerStyle = useAnimatedStyle(() => {
    const percent = ((progress.value + 0.5) / dayCount) * 100;
    return {
      left: `${percent}%`,
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    const percent = ((progress.value + 0.5) / dayCount) * 100;
    return {
      width: `${percent}%`,
    };
  });

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  return (
    <View>
      <View style={styles.row}>
        {days.map((d, index) => (
          <DayPill
            key={d.date.toISOString()}
            weekday={d.weekday}
            day={d.day}
            selected={index === selectedIndex}
            isFuture={d.date.getTime() > today.getTime()}
            onPress={() => onSelect(index)}
          />
        ))}
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
        <Animated.View style={[styles.dot, markerStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  track: {
    height: 1,
    backgroundColor: "#E7E7EC",
    marginTop: 18,
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 1,
    backgroundColor: "#8FCB7C",
  },
  dot: {
    position: "absolute",
    top: -3.5,
    width: 8,
    height: 8,
    marginLeft: -4,
    borderRadius: 4,
    backgroundColor: "#8FCB7C",
  },
});
