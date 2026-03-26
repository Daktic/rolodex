import { StyleSheet, View } from 'react-native';
import KVBContainer, { KeyValuePair as KVPair } from '@/components/common/KVBContainer';
import { useState, useEffect } from "react";
import { getProfile, updateProfileDisplayName } from '@/services/storage';
import {getProfileId} from "@/services/wallet";



export default function ProfileDisplayName() {
  const [displayNameField, setDisplayNameField] = useState<KVPair[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  // Load profile ID on mount
  useEffect(() => {
    const getPID = async () => {
      const pID = await getProfileId();
      setProfileId(pID);
    }
    getPID();
  }, []);

  // Load profile display name when profileId is available
  useEffect(() => {
    if (!profileId) return;

    const loadProfile = async () => {
      try {
        const profile = await getProfile(profileId);
        console.log("Loaded profile:", JSON.stringify(profile, null, 2));
        if (profile) {
          console.log("Setting display name to:", profile.display_name);
          setDisplayNameField([
            { id:0, key: 'Display Name', value: profile.display_name }
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
  }, [profileId]);

  const handleUpdate = async (id: number, key: string, value: string) => {
    // Update local state
    setDisplayNameField([{ id, key, value }]);
    if (!profileId) return;

    // Save to storage
    try {
      console.log("Updating profile display name to:", value);
      await updateProfileDisplayName(profileId, value);
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update display name:", error);
    }
  };

  return (
    <View style={styles.container}>
      <KVBContainer
          items={displayNameField}
          onDelete={() => {
          }} // No delete for display name
          onAdd={() => {
          }} // No add for display name
          showAddButton={false}
          onBlur={handleUpdate}      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
