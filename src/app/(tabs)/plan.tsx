import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityCard } from "@/components/home/activity-card";
import { SectionHeader } from "@/components/home/section-header";
import { TaskCard } from "@/components/home/task-card";
import {
  ACTIVITIES,
  bucketForDays,
  PALETTE,
  TASKS,
  type Activity,
  type PlanRange,
} from "@/data/plan";

type RangeFilter = "all" | PlanRange;

const RANGE_OPTIONS: { key: RangeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "later", label: "Later" },
];

const OVERDUE_BADGE = { bg: "#FBE1E1", text: "#C24343" };

function taskBadgeLabel(daysFromToday: number) {
  if (daysFromToday < 0) return `${Math.abs(daysFromToday)}d late`;
  if (daysFromToday === 0) return "Today";
  return `${daysFromToday}d`;
}

function activityDateLabel(daysFromToday: number, today: Date) {
  if (daysFromToday === 0) return "Today";
  if (daysFromToday === 1) return "Tomorrow";
  if (daysFromToday === -1) return "Yesterday";
  const d = new Date(today);
  d.setDate(d.getDate() + daysFromToday);
  const label = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return daysFromToday < 0 ? `${label} · overdue` : label;
}

export default function PlanScreen() {
  const [filter, setFilter] = useState<RangeFilter>("all");
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const matchesFilter = (daysFromToday: number) =>
    filter === "all" || bucketForDays(daysFromToday) === filter;

  const tasks = useMemo(
    () => TASKS.filter((t) => matchesFilter(t.daysFromToday)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter],
  );
  const activities = useMemo(
    () => ACTIVITIES.filter((a) => matchesFilter(a.daysFromToday)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter],
  );

  const counts = useMemo(() => {
    const all = [
      ...TASKS.map((t) => t.daysFromToday),
      ...ACTIVITIES.map((a) => a.daysFromToday),
    ];
    const result: Record<RangeFilter, number> = {
      all: all.length,
      overdue: 0,
      today: 0,
      week: 0,
      later: 0,
    };
    for (const days of all) result[bucketForDays(days)] += 1;
    return result;
  }, []);

  const activityColumns: [Activity[], Activity[]] = [[], []];
  activities.forEach((a, i) => activityColumns[i % 2].push(a));

  return (
    <View
      style={[styles.container, Platform.OS === "web" && styles.containerWeb]}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Plan</Text>
          <Text style={styles.subheading}>
            Every task and activity, in one place
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rangeRow}
          >
            {RANGE_OPTIONS.map((option) => {
              const selected = filter === option.key;
              const count = counts[option.key];
              if (option.key !== "all" && count === 0) return null;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setFilter(option.key)}
                  style={[
                    styles.rangeChip,
                    selected && styles.rangeChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.rangeChipText,
                      selected && styles.rangeChipTextSelected,
                    ]}
                  >
                    {option.label} · {count}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.section}>
            <SectionHeader title="Tasks" />
            {tasks.length === 0 ? (
              <Text style={styles.emptyText}>No tasks in this range.</Text>
            ) : (
              <View style={styles.taskList}>
                {tasks.map((t) => {
                  const palette = PALETTE[t.paletteIndex];
                  const overdue = t.daysFromToday < 0;
                  return (
                    <TaskCard
                      key={t.id}
                      title={t.title}
                      badgeLabel={taskBadgeLabel(t.daysFromToday)}
                      badgeColor={overdue ? OVERDUE_BADGE.bg : palette.bg}
                      badgeTextColor={
                        overdue ? OVERDUE_BADGE.text : palette.dark
                      }
                      avatars={t.avatars}
                      time={t.time}
                      progress={t.progress}
                      ringColor={palette.accent}
                      ringTrackColor={palette.bg}
                    />
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader title="Activity" />
            {activities.length === 0 ? (
              <Text style={styles.emptyText}>No activity in this range.</Text>
            ) : (
              <View style={styles.activityGrid}>
                {activityColumns.map((column, columnIndex) => (
                  <View key={columnIndex} style={styles.activityColumn}>
                    {column.map((a) => {
                      const palette = PALETTE[a.paletteIndex];
                      return (
                        <ActivityCard
                          key={a.id}
                          title={a.title}
                          label={a.label}
                          subtitle={activityDateLabel(a.daysFromToday, today)}
                          progress={a.progress}
                          backgroundColor={palette.bg}
                          accentColor={palette.accent}
                          avatars={a.avatars}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F2F2",
  },
  containerWeb: {
    position: "fixed" as "relative",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 25,
    paddingTop: 8,
    paddingBottom: 140,
  },
  heading: {
    fontSize: 26,
    fontFamily: "Saans-SemiBold",
    color: "#17171B",
  },
  subheading: {
    fontSize: 14,
    fontFamily: "Saans-Medium",
    color: "#8B8D96",
    marginTop: 4,
  },
  rangeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  rangeChip: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  rangeChipSelected: {
    backgroundColor: "#17171B",
  },
  rangeChipText: {
    fontSize: 13,
    fontFamily: "Saans-Medium",
    color: "#17171B",
  },
  rangeChipTextSelected: {
    color: "#ffffff",
  },
  section: {
    marginTop: 32,
  },
  taskList: {
    gap: 10,
  },
  activityGrid: {
    flexDirection: "row",
    gap: 12,
  },
  activityColumn: {
    flex: 1,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Saans-Medium",
    color: "#9A9CA5",
  },
});
