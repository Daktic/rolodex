import { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import KVBContainer, { KeyValuePair } from '../../common/KVBContainer';
import { getProfileFields, upsertProfileField, deleteProfileField, getMaskFields } from '@/services/storage';
import { Mask } from '@/types/storage';
import { getProfileId } from '@/services/wallet';

interface ContactInfoProps {
  currentMask: Mask | null;
}

export default function ContactInfo({ currentMask }: ContactInfoProps) {
  const [fields, setFields] = useState<KeyValuePair[]>([]);
  const [maskedFieldIds, setMaskedFieldIds] = useState<Set<string>>(new Set());
  const [profileId, setProfileId] = useState<string | null>(null);


  // Load profile ID on mount
  useEffect(() => {
    const getPID = async () => {
      const pID = await getProfileId();
      setProfileId(pID);
    }
    getPID();
  }, []);

  // Load profile fields when profileId is available
  useEffect(() => {
    if (!profileId) return;

    const loadFields = async () => {
      try {
        const profileFields = await getProfileFields(profileId);
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
  }, [profileId]);

  // Load masked fields when mask changes
  useEffect(() => {
    const loadMaskedFields = async () => {
      if (!currentMask) {
        setMaskedFieldIds(new Set());
        return;
      }

      try {
        const maskFields = await getMaskFields(currentMask.id);
        const maskedIds = new Set(maskFields.map(field => field.id));
        setMaskedFieldIds(maskedIds);
      } catch (error) {
        console.error("Failed to load masked fields:", error);
      }
    };
    loadMaskedFields();
  }, [currentMask]);

  const handleUpdate = async (id: string, key: string, value: string) => {
    // Update local state
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, key, value } : field
      )
    );
    if (!profileId) return;

    // Save to storage
    try {
      await upsertProfileField(id, profileId, key, value, true);
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

  const handleMaskToggle = (fieldId: string, isMasked: boolean) => {
    if (!currentMask) return;

    setMaskedFieldIds(prev => {
      const newSet = new Set(prev);
      if (isMasked) {
        newSet.add(fieldId);
      } else {
        newSet.delete(fieldId);
      }
      return newSet;
    });
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
        currentMask={currentMask}
        maskedFieldIds={maskedFieldIds}
        onMaskToggle={handleMaskToggle}
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
