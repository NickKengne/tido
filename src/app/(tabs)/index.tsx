import { Image } from "expo-image";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityCard } from "@/components/home/activity-card";
import { SectionHeader } from "@/components/home/section-header";
import { TaskCard } from "@/components/home/task-card";

const memoji = (n: number) =>
  `https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_${n}.png`;

const teamAvatars = [
  { uri: memoji(7) },
  { uri: memoji(15) },
  { uri: memoji(22) },
];

export default function HomeScreen() {
  return (
    <View
      style={[styles.container, Platform.OS === "web" && styles.containerWeb]}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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

          <SectionHeader title="Recent activity" />
          <View style={styles.activityGrid}>
            <View style={styles.activityColumn}>
              <ActivityCard
                backgroundColor="#DEE7FE"
                accentColor="#8A9CD7"
                title="Astha App Redesign"
                subtitle="One more week"
                progress={75}
              />
              <ActivityCard
                backgroundColor="#F9EBC9"
                accentColor="#E4C87B"
                title="Slack App Redesign"
                subtitle="Wed, 22 Nov 2024"
                progress={50}
              />
            </View>
            <View style={styles.activityColumn}>
              <ActivityCard
                backgroundColor="#D5F6F0"
                accentColor="#86C8B7"
                label="User interview"
                title="Slack App Redesign"
                subtitle="Wed, 22 Nov 2024"
                progress={25}
                avatars={teamAvatars}
              />
              <ActivityCard
                backgroundColor="#EFD6FA"
                accentColor="#BC97CF"
                title="Gideon Project"
                progress={25}
              />
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
  scrollContent: {
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
