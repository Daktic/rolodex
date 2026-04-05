import { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Alert, Animated, Pressable } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { getConnectionFields, getAnnotations, upsertAnnotation, deleteAnnotation } from '@/services/storage';
import AddTriple from "@/dialogs/AddTriple";
import {SemanticNode, ObjectType, Predicate} from "@/types/db";
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

interface AttributionItem {
  id: number;
  label: string;
  value: string;
  isLocked: boolean; // true for connection fields, false for annotations
  type?: string; // only for annotations
}

interface AttributionsProps {
  connectionId: number;
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  kvBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.colors.borderAlt,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  lockedBox: {
    borderColor: theme.colors.highlight,
    borderWidth: 2,
    shadowColor: theme.colors.highlight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  keyContainer: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: theme.colors.borderAlt,
  },
  valueContainer: {
    flex: 2,
    backgroundColor: theme.colors.surface,
    padding: 12,
  },
  keyInput: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  keyText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  valueInput: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  valueText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  deleteActionButton: {
    backgroundColor: theme.colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  deleteText: {
    color: theme.colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
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

export default function Attributions({ connectionId }: AttributionsProps) {
  const [items, setItems] = useState<AttributionItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLabel, setNewLabel] = useState<Predicate | null>(null);
  const [newValue, setNewValue] = useState<SemanticNode | null>(null);
  const [newType, setNewType] = useState<ObjectType | null>(null);

  const { theme } = useTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    loadAttributions();
  }, [connectionId]);

  useFocusEffect(useCallback(() => {
    loadAttributions();
  }, [connectionId]));

  const loadAttributions = async () => {
    try {
      // Load connection fields (locked)
      const connectionFields = await getConnectionFields(connectionId);
      const lockedItems: AttributionItem[] = connectionFields.map((field) => ({
        id: field.id,
        label: field.label,
        value: field.value,
        isLocked: true,
      }));

      // Load annotations (editable)
      const annotations = await getAnnotations(connectionId);
      const editableItems: AttributionItem[] = annotations.map((annotation) => ({
        id: annotation.id,
        label: annotation.label,
        value: annotation.value,
        isLocked: false,
        type: annotation.type,
        created_at: annotation.created_at,
      }));

      // Combine: locked fields first, then annotations
      setItems([...lockedItems, ...editableItems]);
    } catch (error) {
      console.error('Failed to load attributions:', error);
    }
  };

  const handleLongPress = (id: number, isLocked: boolean) => {
    if (isLocked) return; // Can't edit locked fields
    setEditingId(editingId === id ? null : id);
  };

  const handleUpdate = async (id: number, label: string, value: string) => {
    try {
      const item = items.find((i) => i.id === id);
      if (!item || item.isLocked) return;

      await upsertAnnotation(connectionId, label, value);
      await loadAttributions();
    } catch (error) {
      console.error('Failed to update annotation:', error);
    }
  };

  const handleDelete = (id: number, label: string) => {
    Alert.alert(
      'Delete Annotation',
      `Are you sure you want to delete "${label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAnnotation(id);
              await loadAttributions();
              if (editingId === id) {
                setEditingId(null);
              }
            } catch (error) {
              console.error('Failed to delete annotation:', error);
            }
          },
        },
      ]
    );
  };

  const handleAdd = async () => {
    if (!newLabel || !newValue || !newValue.value) {
      console.error('Missing required fields for annotation');
      return;
    }

    try {
      await upsertAnnotation(connectionId, newLabel.label, newValue?.value);
      await loadAttributions();
      setShowAddDialog(false);
      setNewLabel(null);
      setNewValue(null);
      setNewType(null);
    } catch (error) {
      console.error('Failed to add annotation:', error);
    }
  };

  const AttributionItemComponent = ({ item }: { item: AttributionItem }) => {
    const swipeableRef = useRef<Swipeable>(null);
    const isEditing = editingId === item.id && !item.isLocked;

    const renderRightActions = (
      progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>
    ) => {
      const trans = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [0, 80],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          style={[
            styles.deleteContainer,
            { transform: [{ translateX: trans }] },
          ]}
        >
          <Pressable
            style={styles.deleteActionButton}
            onPress={() => handleDelete(item.id, item.label)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </Animated.View>
      );
    };

    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={item.isLocked ? undefined : renderRightActions}
        overshootRight={false}
      >
        <Pressable
          onPress={() => handleLongPress(item.id, item.isLocked)}
          disabled={item.isLocked}
        >
          <View style={[styles.kvBox, item.isLocked && styles.lockedBox]}>
            <View style={styles.keyContainer}>
              {isEditing ? (
                <TextInput
                  style={styles.keyInput}
                  value={item.label}
                  onChangeText={(text) => {
                    const updated = items.map((i) =>
                      i.id === item.id ? { ...i, label: text } : i
                    );
                    setItems(updated);
                  }}
                  onBlur={() => handleUpdate(item.id, item.label, item.value)}
                  placeholder="Label"
                  placeholderTextColor={theme.colors.placeholder}
                />
              ) : (
                <Text style={styles.keyText}>{item.label}</Text>
              )}
            </View>

            <View style={styles.valueContainer}>
              {isEditing ? (
                <TextInput
                  style={styles.valueInput}
                  value={item.value}
                  onChangeText={(text) => {
                    const updated = items.map((i) =>
                      i.id === item.id ? { ...i, value: text } : i
                    );
                    setItems(updated);
                  }}
                  onBlur={() => handleUpdate(item.id, item.label, item.value)}
                  placeholder="Value"
                  placeholderTextColor={theme.colors.placeholder}
                />
              ) : (
                <Text style={styles.valueText}>{item.value}</Text>
              )}
            </View>
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <AttributionItemComponent key={`${item.isLocked ? 'field' : 'annotation'}-${item.id}`} item={item} />
      ))}

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddDialog(true)}>
        <Text style={styles.addButtonText}>+ Add Annotation</Text>
      </TouchableOpacity>

      {/* Add Annotation Dialog */}
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
