import { StyleSheet, View } from 'react-native';
import KVBContainer, { KeyValuePair as KVPair } from '@/components/common/KVBContainer';
import { useState, useEffect } from "react";
import { getProfile, updateProfileDisplayName } from '@/services/storage';

// TODO: Replace with actual profile ID from wallet/auth
const PROFILE_ID = "temp-profile-id";

export default function ProfileDisplayName() {
  const [displayNameField, setDisplayNameField] = useState<KVPair[]>([
    { id: 'display-name', key: 'Display Name', value: '' }
  ]);

  // Load profile display name on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile(PROFILE_ID);
        console.log("Loaded profile:", JSON.stringify(profile, null, 2));
        if (profile) {
          console.log("Setting display name to:", profile.display_name);
          setDisplayNameField([
            { id: 'display-name', key: 'Display Name', value: profile.display_name }
          ]);
          console.log("Display name field updated");
        } else {
          console.log("No profile found, keeping empty field");
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };
    loadProfile();
  }, []);

  const handleUpdate = async (id: string, key: string, value: string) => {
    // Update local state
    setDisplayNameField([{ id, key, value }]);

    // Save to storage
    try {
      console.log("Updating profile display name to:", value);
      await updateProfileDisplayName(PROFILE_ID, value);
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update display name:", error);
    }
  };

  return (
    <View style={styles.container}>
      <KVBContainer
        items={displayNameField}
        onUpdate={handleUpdate}
        onDelete={() => {}} // No delete for display name
        onAdd={() => {}} // No add for display name
        showAddButton={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
