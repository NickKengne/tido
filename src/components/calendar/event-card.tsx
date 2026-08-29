import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AvatarStack, type Avatar } from "@/components/home/avatar-stack";

type EventCardProps = {
  backgroundColor: string;
  title: string;
  subtitle: string;
  time: string;
  avatars: Avatar[];
  // Single-line title/subtitle — used inside EventStack, where every layer
  // must resolve to the same height for the stack to line up.
  compact?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function EventCard({
  backgroundColor,
  title,
  subtitle,
  time,
  avatars,
  compact = false,
  onPress,
  onLongPress,
}: EventCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.card, { backgroundColor }]}
    >
      <Text style={styles.title} numberOfLines={compact ? 1 : undefined}>
        {title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={compact ? 1 : undefined}>
        {subtitle}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.time}>{time}</Text>
        <AvatarStack avatars={avatars} size={26} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
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
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  time: {
    fontSize: 13,
    fontFamily: "Saans-SemiBold",
    color: "#17171B",
  },
});
