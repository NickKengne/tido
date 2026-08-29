import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  onPressViewAll?: () => void;
};

export function SectionHeader({ title, onPressViewAll }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onPressViewAll ? (
        <TouchableOpacity activeOpacity={0.5} onPress={onPressViewAll} hitSlop={8}>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Saans-SemiBold',
    color: '#17171B',
  },
  viewAll: {
    fontSize: 14,
    fontFamily: 'Saans-Medium',
    color: '#9A9CA5',
  },
});
