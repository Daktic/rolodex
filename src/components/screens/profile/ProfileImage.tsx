import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateProfileAvatar, getProfile } from '@/services/storage';
import {getProfileId} from "@/services/wallet";

const PROFILE_ID = getProfileId();

const updateProfileImage = async (imageUri: string) => {
  await updateProfileAvatar(PROFILE_ID, imageUri);
};

export default function ProfileImage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Load profile image on mount
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        console.log("Loading profile image for ID:", PROFILE_ID);
        const profile = await getProfile(PROFILE_ID);
        console.log("Profile loaded:", profile);
        if (profile?.avatar_uri) {
          console.log("Setting profile image to:", profile.avatar_uri);
          setProfileImage(profile.avatar_uri);
        } else {
          console.log("No avatar_uri found in profile");
        }
      } catch (error) {
        console.error("Failed to load profile image:", error);
      }
    };
    loadProfileImage();
  }, []);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to upload a profile photo.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const pic = result.assets[0].uri
      console.log("Image picked:", pic);
      setProfileImage(pic);
      console.log("Saving image to storage...");
      await updateProfileImage(pic);
      console.log("Image saved to storage");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageTouchable}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>+</Text>
            <Text style={styles.imagePlaceholderSubtext}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageTouchable: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 40,
    color: '#999',
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
