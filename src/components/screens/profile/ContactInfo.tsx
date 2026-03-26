import { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import KVBContainer, { KeyValuePair } from '../../common/KVBContainer';
import { getProfileFields, upsertProfileField, updateProfileField, deleteProfileField, getMaskFields } from '@/services/storage';
import {Mask, ObjectType, Predicate, SemanticNode} from '@/types/db';
import { getProfileId } from '@/services/wallet';
import AddTriple from "@/dialogs/AddTriple";

interface ContactInfoProps {
  currentMask: Mask | null;
}

export default function ContactInfo({ currentMask }: ContactInfoProps) {
  const [fields, setFields] = useState<KeyValuePair[]>([]);
  const [maskedFieldIds, setMaskedFieldIds] = useState<Set<number>>(new Set());
  const [profileId, setProfileId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLabel, setNewLabel] = useState<Predicate | null>(null);
  const [newValue, setNewValue] = useState<SemanticNode | null>(null);
  const [newType, setNewType] = useState<ObjectType | null>(null);


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

  const handleUpdate = async (id: number, key: string, value: string) => {
    // Update local state
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, key, value } : field
      )
    );
  };

  const handleSave = async (id: number, key: string, value: string) => {
    // Save to storage
    if (!profileId || !key.trim() || !value.trim()) return;
    try {
      await updateProfileField(id, key, value, true);
    } catch (error) {
      console.error("Failed to update profile field:", error);
    }
  }

  const handleDelete = async (id: number) => {
    // Update local state
    setFields((prev) => prev.filter((field) => field.id !== id));

    // Delete from storage
    try {
      await deleteProfileField(id);
    } catch (error) {
      console.error("Failed to delete profile field:", error);
    }
  };

  const handleAdd = async () => {
    if (!profileId || !newLabel || !newValue) return;
    try {
      await upsertProfileField(profileId, newLabel.label, newValue.value ?? newValue.label, false);
      const profileFields = await getProfileFields(profileId);
      setFields(profileFields.map(field => ({
        id: field.id,
        key: field.label,
        value: field.value,
      })));
    } catch (error) {
      console.error("Failed to add profile field:", error);
    }
    setShowAddDialog(false);
  };


  const handleMaskToggle = (fieldId: number, isMasked: boolean) => {
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
        onBlur={handleSave}
        currentMask={currentMask}
        maskedFieldIds={maskedFieldIds}
        onMaskToggle={handleMaskToggle}
        onAdd={() => setShowAddDialog(true)}
      />
      <AddTriple
          visible={showAddDialog}
          setVisible={setShowAddDialog}
          handleAdd={handleAdd}
          newLabel={newLabel}
          setNewLabel={setNewLabel}
          newValue={newValue}
          setNewValue={setNewValue}
          newType={newType}
          setNewType={setNewType}
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
