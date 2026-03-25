import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import KeyValueBox from './KeyValueBox';
import { Mask } from '@/types/db';

export interface KeyValuePair {
  id: number;
  key: string;
  value: string;
}

interface KVBContainerProps {
  items: KeyValuePair[];
  onUpdate?: (id: number, key: string, value: string) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
  onBlur: (id: number, key: string, value: string) => void;
  showAddButton?: boolean;
  currentMask?: Mask | null;
  maskedFieldIds?: Set<number>;
  onMaskToggle?: (fieldId: number, isMasked: boolean) => void;
}

export default function KVBContainer({
  items,
  onUpdate,
  onDelete,
  onAdd,
  onBlur,
  showAddButton = true,
  currentMask,
  maskedFieldIds = new Set(),
  onMaskToggle,
}: KVBContainerProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleLongPress = (id: number) => {
    // Toggle edit mode for this row
    setEditingId(editingId === id ? null : id);
  };

  const handleKeyChange = (id: number, newKey: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      onUpdate?.(id, newKey, item.value);
    }
  };

  const handleValueChange = (id: number, newValue: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      onUpdate?.(id, item.key, newValue);
    }
  };

  const handleDelete = (id: number) => {
    // Exit edit mode if we're deleting the currently editing item
    if (editingId === id) {
      setEditingId(null);
    }
    onDelete?.(id);
  };

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isEditing = editingId === item.id;
        const isMasked = maskedFieldIds.has(item.id);
        return (
          <KeyValueBox
            key={item.id}
            initialKey={item.key}
            initialValue={item.value}
            keyEditable={isEditing}
            valueEditable={isEditing}
            onKeyChange={(newKey) => handleKeyChange(item.id, newKey)}
            onValueChange={(newValue) => handleValueChange(item.id, newValue)}
            onBlur={(key, value) => onBlur(item.id, key, value)}
            onLongPress={() => handleLongPress(item.id)}
            onDelete={onDelete ? () => handleDelete(item.id) : undefined}
            currentMask={currentMask}
            fieldId={item.id}
            isMasked={isMasked}
            onMaskToggle={onMaskToggle}
          />
        );
      })}

      {showAddButton && (
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>+ Add Field</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});
