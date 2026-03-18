import { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import ProfileImage from '../components/screens/profile/ProfileImage';
import ContactInfo from '../components/screens/profile/ContactInfo';
import ProfileDisplayName from '../components/screens/profile/ProfileDisplayName';
import Masks from '@/components/screens/profile/Masks';
import { Mask } from '@/types/storage';

export default function ProfileScreen() {
  const [currentMask, setCurrentMask] = useState<Mask | null>(null);

  return (
    <ScrollView style={styles.container}>
      <Masks onMaskChange={setCurrentMask} />
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
  }
});
