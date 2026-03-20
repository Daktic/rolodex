import { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import ProfileImage from '../components/screens/profile/ProfileImage';
import ContactInfo from '../components/screens/profile/ContactInfo';
import ProfileDisplayName from '../components/screens/profile/ProfileDisplayName';
import Masks from '@/components/screens/profile/Masks';
import ShareDrawer from '@/components/screens/profile/share/ShareDrawer';
import { Mask } from '@/types/storage';


export default function ProfileScreen() {
  const [currentMask, setCurrentMask] = useState<Mask | null>(null);
  const [shareDrawerVisible, setShareDrawerVisible] = useState(false);

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Masks
          onMaskChange={setCurrentMask}
          onSharePress={() => setShareDrawerVisible(true)}
        />
        <ProfileImage />
        <ProfileDisplayName />
        <ContactInfo currentMask={currentMask} />
      </ScrollView>
      <ShareDrawer
          visible={shareDrawerVisible}
          onClose={() => setShareDrawerVisible(false)} maskId={currentMask?.id!}      />
    </>
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
