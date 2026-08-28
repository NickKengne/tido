import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AvatarStack, type Avatar } from "@/components/home/avatar-stack";
import { ProgressBar } from "@/components/home/progress-bar";

type ActivityCardProps = {
  backgroundColor: string;
  accentColor: string;
  title: string;
  label?: string;
  subtitle?: string;
  progress: number;
  avatars?: Avatar[];
};

export function ActivityCard({
  backgroundColor,
  accentColor,
  title,
  label,
  subtitle,
  progress,
  avatars,
}: ActivityCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor }]}
    >
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {avatars ? (
        <View style={styles.avatars}>
          <AvatarStack avatars={avatars} size={28} />
        </View>
      ) : null}
      <View style={styles.progressRow}>
        <ProgressBar
          progress={progress}
          fillColor={accentColor}
          style={styles.bar}
        />
        <Text style={styles.percent}>{progress}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
  },
  label: {
    fontSize: 12,
    fontFamily: "Saans-Medium",
    color: "rgba(23,23,27,0.55)",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: "Saans-SemiBold",
    color: "#17171B",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Saans-Medium",
    color: "rgba(23,23,27,0.55)",
    marginTop: 10,
  },
  avatars: {
    marginTop: 12,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  bar: {
    flex: 1,
  },
  percent: {
    fontSize: 13,
    fontFamily: "Saans-SemiBold",
    color: "#17171B",
  },
});
