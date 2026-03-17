import { StyleSheet, Text, View, ScrollView } from 'react-native';
import ProfileImage from '../components/screens/profile/ProfileImage';
import ContactInfo from '../components/screens/profile/ContactInfo';
import ProfileDisplayName from '../components/screens/profile/ProfileDisplayName';
import { useState } from "react";
import { Drama } from "lucide-react-native";

export default function ProfileScreen() {
  const [currentMask, setCurrentMask] = useState('all');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Drama size={32} color="#000" style={styles.icon} />
        <Text style={styles.title}>{currentMask}</Text>
      </View>
      <ProfileImage />
      <ProfileDisplayName />
      <ContactInfo />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
