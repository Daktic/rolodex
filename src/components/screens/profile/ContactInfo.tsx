import { useState, useEffect, useCallback } from 'react';
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import KVBContainer, { KeyValuePair } from '../../common/KVBContainer';
import {
  getAllPredicateObjects,
  getProfileFields,
  upsertProfileField,
  updateProfileField,
  deleteProfileField,
  getMaskFields,
} from '@/services/storage';
import {Mask, ObjectType, Predicate, Predicates, SemanticNode} from '@/types/db';
import { getProfileId } from '@/services/wallet';
import AddTriple from "@/dialogs/AddTriple";
import { useFocusEffect } from '@react-navigation/native';
import {
  ContextMenuSelection,
  KVBContextMenuActionId,
  resolveProfileFieldContextActions,
} from '@/services/contextMenu';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

interface ContactInfoProps {
  currentMask: Mask | null;
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  qrOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
  },
});

export default function ContactInfo({ currentMask }: ContactInfoProps) {
  const [fields, setFields] = useState<KeyValuePair[]>([]);
  const [maskedFieldIds, setMaskedFieldIds] = useState<Set<number>>(new Set());
  const [profileId, setProfileId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLabel, setNewLabel] = useState<Predicate | null>(null);
  const [newValue, setNewValue] = useState<SemanticNode | null>(null);
  const [newType, setNewType] = useState<ObjectType | null>(null);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [predicateObjects, setPredicateObjects] = useState<Predicates[]>([]);

  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Load profile ID on mount
  useEffect(() => {
    const getPID = async () => {
      const pID = await getProfileId();
      setProfileId(pID);
    }
    getPID();
  }, []);

  // Load profile fields on focus (and whenever profileId first becomes available)
  const loadFields = useCallback(async () => {
    if (!profileId) return;
    try {
      const profileFields = await getProfileFields(profileId);
      setFields(profileFields.map(field => ({
        id: field.id,
        key: field.label,
        value: field.value,
        icon: field.icon,
      })));
    } catch (error) {
      console.error("Failed to load profile fields:", error);
    }
  }, [profileId]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  useFocusEffect(useCallback(() => {
    loadFields();
  }, [loadFields]));

  const loadPredicateObjects = useCallback(async () => {
    try {
      const predicates = await getAllPredicateObjects();
      setPredicateObjects(predicates);
    } catch (error) {
      console.error("Failed to load predicate object types:", error);
    }
  }, []);

  useEffect(() => {
    loadPredicateObjects();
  }, [loadPredicateObjects]);

  useFocusEffect(useCallback(() => {
    loadPredicateObjects();
  }, [loadPredicateObjects]));

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
        icon: field.icon,
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

  const getContextActions = (item: KeyValuePair) =>
    resolveProfileFieldContextActions({
      key: item.key,
      value: item.value,
      predicateObjects,
    });

  const handleContextAction = async ({
    item,
    selection,
  }: {
    item: KeyValuePair;
    selection: ContextMenuSelection;
  }) => {
    const payloadValue = String(selection.payload ?? item.value ?? '');

    switch (selection.actionId) {
      case KVBContextMenuActionId.Copy:
        await Clipboard.setStringAsync(payloadValue);
        break;
      case KVBContextMenuActionId.OpenUrl:
        if (payloadValue) {
          await Linking.openURL(payloadValue);
        }
        break;
      case KVBContextMenuActionId.ShowQr:
        setQrValue(payloadValue);
        break;
      default:
        break;
    }
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
        getContextActions={getContextActions}
        onContextAction={handleContextAction}
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
      <Modal
        visible={Boolean(qrValue)}
        transparent
        animationType="fade"
        onRequestClose={() => setQrValue(null)}
      >
        <TouchableOpacity
          style={styles.qrOverlay}
          onPress={() => setQrValue(null)}
          activeOpacity={1}
        >
          <View
            style={styles.qrContainer}
            onStartShouldSetResponder={() => true}
          >
            {qrValue ? <QRCode value={qrValue} size={220} /> : null}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
