import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import KeyValueBox from './KeyValueBox';
import { Mask } from '@/types/db';
import ContextMenu from './ContextMenu';
import {
  ContextMenuActionDescriptor,
  ContextMenuSelection,
  KVBContextMenuActionId,
} from '@/services/contextMenu';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

export interface KeyValuePair {
  id: number;
  key: string;
  value: string;
  icon?: string;
}

interface KVBContainerProps {
  items: KeyValuePair[];
  onUpdate?: (id: number, key: string, value: string) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
  onBlur: (id: number, key: string, value: string) => void;
  onItemPress?: (id: number) => void;
  showAddButton?: boolean;
  currentMask?: Mask | null;
  maskedFieldIds?: Set<number>;
  onMaskToggle?: (fieldId: number, isMasked: boolean) => void;
  enableShortPressEdit?: boolean;
  getContextActions?: (item: KeyValuePair) => ContextMenuActionDescriptor[];
  onContextAction?: (event: {
    item: KeyValuePair;
    selection: ContextMenuSelection;
  }) => void;
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    width: '100%',
  },
  addButton: {
    borderWidth: 1,
    borderColor: theme.colors.borderAlt,
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
});

export default function KVBContainer({
  items,
  onUpdate,
  onDelete,
  onAdd,
  onBlur,
  onItemPress,
  showAddButton = true,
  currentMask,
  maskedFieldIds = new Set(),
  onMaskToggle,
  enableShortPressEdit = true,
  getContextActions,
  onContextAction,
}: KVBContainerProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuItem, setMenuItem] = useState<KeyValuePair | null>(null);
  const [menuActions, setMenuActions] = useState<ContextMenuActionDescriptor[]>([]);

  const { theme } = useTheme();
  const styles = getStyles(theme);

  const handleLongPress = (item: KeyValuePair) => {
    const actions = getContextActions?.(item) ?? [];
    if (actions.length === 0) return;
    setMenuItem(item);
    setMenuActions(actions);
    setMenuVisible(true);
  };

  const handlePress = (item: KeyValuePair) => {
    if (onItemPress) {
      onItemPress(item.id);
      return;
    }
    if (!enableShortPressEdit) return;
    setEditingId((prev) => (prev === item.id ? null : item.id));
  };

  const handleContextSelect = (selection: ContextMenuSelection) => {
    if (!menuItem) return;
    if (selection.actionId === KVBContextMenuActionId.Edit) {
      setEditingId(menuItem.id);
    }
    onContextAction?.({
      item: menuItem,
      selection,
    });
    setMenuVisible(false);
    setMenuItem(null);
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
            onPress={() => handlePress(item)}
            onLongPress={() => handleLongPress(item)}
            onDelete={onDelete ? () => handleDelete(item.id) : undefined}
            currentMask={currentMask}
            fieldId={item.id}
            isMasked={isMasked}
            onMaskToggle={onMaskToggle}
            nubIcon={item.icon}
          />
        );
      })}

      {showAddButton && (
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>+ Add Field</Text>
        </TouchableOpacity>
      )}

      <ContextMenu
        visible={menuVisible}
        actions={menuActions}
        onClose={() => {
          setMenuVisible(false);
          setMenuItem(null);
        }}
        onSelect={handleContextSelect}
      />
    </View>
  );
}
