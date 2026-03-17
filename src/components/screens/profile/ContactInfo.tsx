import { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import KVBContainer, { KeyValuePair } from '../../common/KVBContainer';
import { getProfileFields, upsertProfileField, deleteProfileField } from '@/services/storage';

// TODO: Replace with actual profile ID from wallet/auth
const PROFILE_ID = "temp-profile-id";

export default function ContactInfo() {
  const [fields, setFields] = useState<KeyValuePair[]>([]);

  // Load profile fields on mount
  useEffect(() => {
    const loadFields = async () => {
      try {
        const profileFields = await getProfileFields(PROFILE_ID);
        const mappedFields = profileFields.map(field => ({
          id: field.id,
          key: field.label,
          value: field.value,
        }));
        setFields(mappedFields);
      } catch (error) {
        console.error("Failed to load profile fields:", error);
      }
    };
    loadFields();
  }, []);

  const handleUpdate = async (id: string, key: string, value: string) => {
    // Update local state
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, key, value } : field
      )
    );

    // Save to storage
    try {
      await upsertProfileField(id, PROFILE_ID, key, value, true);
    } catch (error) {
      console.error("Failed to update profile field:", error);
    }
  };

  const handleDelete = async (id: string) => {
    // Update local state
    setFields((prev) => prev.filter((field) => field.id !== id));

    // Delete from storage
    try {
      await deleteProfileField(id);
    } catch (error) {
      console.error("Failed to delete profile field:", error);
    }
  };

  const handleAdd = () => {
    const newId = String(Date.now());
    setFields((prev) => [
      ...prev,
      { id: newId, key: '', value: '' },
    ]);
    // Note: Field will be saved when user types (via handleUpdate)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Contact Fields</Text>
      <KVBContainer
        items={fields}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onAdd={handleAdd}
        showAddButton={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
});
