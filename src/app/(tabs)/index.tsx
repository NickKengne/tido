import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useCallback, useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

import { ActivityCard } from "@/components/home/activity-card";
import { RefreshIndicator } from "@/components/home/refresh-indicator";
import { SectionHeader } from "@/components/home/section-header";
import { TaskCard } from "@/components/home/task-card";
import { haptics } from "@/lib/haptics";

const memoji = (n: number) =>
  `https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_${n}.png`;

const teamAvatars = [
  { uri: memoji(7) },
  { uri: memoji(15) },
  { uri: memoji(22) },
];

const activities = [
  {
    backgroundColor: "#DEE7FE",
    accentColor: "#8A9CD7",
    title: "Astha App Redesign",
    subtitle: "One more week",
    progress: 75,
  },
  {
    backgroundColor: "#F9EBC9",
    accentColor: "#E4C87B",
    title: "Slack App Redesign",
    subtitle: "Wed, 22 Nov 2024",
    progress: 50,
  },
  {
    backgroundColor: "#D5F6F0",
    accentColor: "#86C8B7",
    label: "User interview",
    title: "Slack App Redesign",
    subtitle: "Wed, 22 Nov 2024",
    progress: 25,
    avatars: teamAvatars,
  },
  {
    backgroundColor: "#EFD6FA",
    accentColor: "#BC97CF",
    title: "Gideon Project",
    progress: 25,
  },
] as const;

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

// Apple's exponential-decay rubber-band curve — the further past the edge,
// the less the pull follows the finger.
function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  "worklet";
  return (
    (overshoot * dimension * constant) / (dimension + constant * overshoot)
  );
}

const PULL_MAX = 96;
const REFRESH_THRESHOLD = 60;
const REFRESH_HEIGHT = 54;
const REFRESH_SLOT_HEIGHT = 70;

export default function HomeScreen() {
  const scrollY = useSharedValue(0);
  const pull = useSharedValue(0);
  const pullOrigin = useSharedValue(0);
  const refreshing = useSharedValue(false);
  const armed = useSharedValue(false);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  const handleRefresh = useCallback(() => {
    // No real data layer yet — simulated network delay stands in for a refetch.
    setTimeout(() => {
      refreshing.set(false);
      pull.set(withSpring(0, { duration: 400, dampingRatio: 0.8 }));
      haptics.notification(Haptics.NotificationFeedbackType.Success);
    }, 1100);
  }, [pull, refreshing]);

  useAnimatedReaction(
    () => pull.get() > REFRESH_THRESHOLD && !refreshing.get(),
    (isArmed, wasArmed) => {
      if (isArmed !== wasArmed) {
        armed.set(isArmed);
        if (isArmed) {
          scheduleOnRN(haptics.impact, Haptics.ImpactFeedbackStyle.Light);
        }
      }
    },
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-1000, 12])
        .onUpdate((e) => {
          if (refreshing.get()) return;

          if (scrollY.get() > 0) {
            pullOrigin.set(e.translationY);
            if (pull.get() !== 0) {
              pull.set(withTiming(0, { duration: 150, easing: EASE_OUT }));
            }
            return;
          }

          const delta = e.translationY - pullOrigin.get();
          pull.set(delta > 0 ? rubberband(delta, PULL_MAX) : 0);
        })
        .onEnd(() => {
          if (refreshing.get()) return;

          if (armed.get()) {
            refreshing.set(true);
            pull.set(
              withTiming(REFRESH_HEIGHT, { duration: 180, easing: EASE_OUT }),
            );
            scheduleOnRN(handleRefresh);
          } else {
            pull.set(withSpring(0, { duration: 300, dampingRatio: 0.85 }));
          }
        }),
    [armed, handleRefresh, pull, pullOrigin, refreshing, scrollY],
  );

  const nativeGesture = useMemo(() => Gesture.Native(), []);
  const composedGesture = useMemo(
    () => Gesture.Simultaneous(nativeGesture, panGesture),
    [nativeGesture, panGesture],
  );

  const pullContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pull.get() }],
  }));

  return (
    <View
      style={[styles.container, Platform.OS === "web" && styles.containerWeb]}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <GestureDetector gesture={composedGesture}>
          <Animated.ScrollView
            style={styles.scroll}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.refreshSlot}>
              <RefreshIndicator
                pull={pull}
                refreshing={refreshing}
                threshold={REFRESH_THRESHOLD}
                color="#000000"
                trackColor="#E5E5EA"
              />
            </View>

            <Animated.View style={[styles.pageContent, pullContentStyle]}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.welcome}>Your Space</Text>
                  <View style={styles.greetingRow}>
                    <Text style={styles.greeting}>Nick Dibrilain !</Text>
                    <Text style={styles.wave}>👋</Text>
                  </View>
                </View>
                <View style={styles.avatar}>
                  <Image
                    source={{ uri: memoji(3) }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                </View>
              </View>

              <View>
                <SectionHeader title="Recent activity" />
                <View style={styles.activityGrid}>
                  <View style={styles.activityColumn}>
                    <ActivityCard {...activities[0]} />
                    <ActivityCard {...activities[1]} />
                  </View>
                  <View style={styles.activityColumn}>
                    <ActivityCard {...activities[2]} />
                    <ActivityCard {...activities[3]} />
                  </View>
                </View>
              </View>

              <View style={styles.tasksSection}>
                <SectionHeader title="Today's task" />
                <View style={styles.taskList}>
                  <TaskCard
                    title="Banking App Design"
                    badgeLabel="6d"
                    badgeColor="#DFF7F0"
                    badgeTextColor="#1F8A6E"
                    avatars={teamAvatars}
                    time="2.30 PM - 6.30 PM"
                    progress={46}
                    ringColor="#4FAF95"
                    ringTrackColor="#DFF7F0"
                  />
                  <TaskCard
                    title="Wallet App Design"
                    badgeLabel="3d"
                    badgeColor="#FBE4EF"
                    badgeTextColor="#C25E8B"
                    avatars={teamAvatars}
                    time="9.00 AM - 1.00 PM"
                    progress={32}
                    ringColor="#C97FB0"
                    ringTrackColor="#FBE4EF"
                  />
                </View>
              </View>
            </Animated.View>
          </Animated.ScrollView>
        </GestureDetector>
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
    // expo-router's web Screen wrapper won't shrink below its content height,
    // so it silently grows past the viewport instead of letting this ScrollView
    // clip and scroll internally. Pinning to the real viewport breaks that chain.
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
  refreshSlot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: REFRESH_SLOT_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  pageContent: {
    backgroundColor: "#F7F2F2",
    paddingHorizontal: 25,
    paddingTop: 8,
    paddingBottom: 140,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  welcome: {
    fontSize: 24,
    fontFamily: "Saans-SemiBold",
    color: "#17171B",
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  greeting: {
    fontSize: 15,
    fontFamily: "Saans-Medium",
    color: "#8B8D96",
  },
  wave: {
    fontSize: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#F0F0F3",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  activityGrid: {
    flexDirection: "row",
    gap: 12,
  },
  activityColumn: {
    flex: 1,
    gap: 10,
  },
  tasksSection: {
    marginTop: 32,
  },
  taskList: {
    gap: 16,
  },
});
