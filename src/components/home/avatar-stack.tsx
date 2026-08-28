import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

export type Avatar = {
  uri: string;
};

type AvatarStackProps = {
  avatars: Avatar[];
  size?: number;
};

export function AvatarStack({ avatars, size = 28 }: AvatarStackProps) {
  return (
    <View style={styles.row}>
      {avatars.map((avatar, index) => (
        <View
          key={avatar.uri}
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: index === 0 ? 0 : -size * 0.32,
            },
          ]}
        >
          <Image source={{ uri: avatar.uri }} style={styles.image} contentFit="cover" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ring: {
    borderWidth: 2,
    borderColor: '#ffffff',
    overflow: 'hidden',
    backgroundColor: '#F0F0F3',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
