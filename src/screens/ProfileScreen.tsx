import { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import ProfileImage from '../components/screens/profile/ProfileImage';
import ContactInfo from '../components/screens/profile/ContactInfo';
import ProfileDisplayName from '../components/screens/profile/ProfileDisplayName';
import Masks from '@/components/screens/profile/Masks';
import { Mask } from '@/types/storage';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const [currentMask, setCurrentMask] = useState<Mask | null>(null);
  const navigation = useNavigation();

  const handleSharePress = () => {
    if (currentMask?.id) {
      navigation.navigate('Share' as never, { maskId: currentMask.id } as never);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 100,
  }
});
