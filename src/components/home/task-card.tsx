import { Clock01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AvatarStack, type Avatar } from '@/components/home/avatar-stack';
import { CircularProgress } from '@/components/home/circular-progress';

type TaskCardProps = {
  title: string;
  badgeLabel: string;
  badgeColor: string;
  badgeTextColor: string;
  avatars: Avatar[];
  time: string;
  progress: number;
  ringColor: string;
  ringTrackColor: string;
};

export function TaskCard({
  title,
  badgeLabel,
  badgeColor,
  badgeTextColor,
  avatars,
  time,
  progress,
  ringColor,
  ringTrackColor,
}: TaskCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={[styles.badgeText, { color: badgeTextColor }]}>{badgeLabel}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.details}>
          <Text style={styles.memberLabel}>Team member</Text>
          <AvatarStack avatars={avatars} size={30} />

          <View style={styles.timeRow}>
            <View style={styles.clockBadge}>
              <HugeiconsIcon icon={Clock01Icon} size={12} color="#B08D34" strokeWidth={2} />
            </View>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        </View>

        <CircularProgress progress={progress} color={ringColor} trackColor={ringTrackColor} size={64} strokeWidth={6} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontFamily: 'Saans-SemiBold',
    color: '#17171B',
    flex: 1,
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: 'Saans-SemiBold',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  details: {
    flex: 1,
  },
  memberLabel: {
    fontSize: 13,
    fontFamily: 'Saans-Medium',
    color: 'rgba(23,23,27,0.5)',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  clockBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FCEFC9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 13,
    fontFamily: 'Saans-Medium',
    color: 'rgba(23,23,27,0.65)',
  },
});
