import { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import ProfileImage from '../components/screens/profile/ProfileImage';
import ContactInfo from '../components/screens/profile/ContactInfo';
import ProfileDisplayName from '../components/screens/profile/ProfileDisplayName';
import Masks from '@/components/screens/profile/Masks';
import { Mask } from '@/types/db';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/ProfileStack';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: 100,
  },
});

export default function ProfileScreen() {
  const [currentMask, setCurrentMask] = useState<Mask | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const handleSharePress = () => {
    if (currentMask?.id) {
      navigation.navigate('Share', { maskId: currentMask.id });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Masks
        onMaskChange={setCurrentMask}
        onSharePress={handleSharePress}
        />
        <ProfileImage />
        <ProfileDisplayName />
        <ContactInfo currentMask={currentMask} />
    </ScrollView>
  );
}
