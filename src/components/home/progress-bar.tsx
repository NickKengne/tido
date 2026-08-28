import { StyleSheet, View, type ViewStyle } from 'react-native';

type ProgressBarProps = {
  progress: number;
  fillColor: string;
  trackColor?: string;
  style?: ViewStyle;
};

export function ProgressBar({ progress, fillColor, trackColor = 'rgba(255,255,255,0.75)', style }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.track, { backgroundColor: trackColor }, style]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
