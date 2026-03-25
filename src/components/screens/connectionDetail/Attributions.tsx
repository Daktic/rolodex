import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Modal, TextInput, Alert, Animated, Pressable } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { getConnectionFields, getAnnotations, upsertAnnotation, deleteAnnotation } from '@/services/storage';
import {AnnotationField} from "@/types/db";

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

export default function Attributions({ connectionId }: AttributionsProps) {
  const [items, setItems] = useState<AttributionItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState('general');

  useEffect(() => {
    loadAttributions();
  }, [connectionId]);

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

      await upsertAnnotation(connectionId, item.type || 'general', label, value);
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
    if (!newLabel.trim() || !newValue.trim()) return;

    try {
      await upsertAnnotation(connectionId, newType, newLabel, newValue);
      await loadAttributions();
      setShowAddDialog(false);
      setNewLabel('');
      setNewValue('');
      setNewType('general');
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
                  placeholderTextColor="#999"
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
                  placeholderTextColor="#999"
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
        <AttributionItemComponent key={item.id} item={item} />
      ))}

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddDialog(true)}>
        <Text style={styles.addButtonText}>+ Add Annotation</Text>
      </TouchableOpacity>

      {/* Add Annotation Dialog */}
      <Modal visible={showAddDialog} transparent animationType="fade">
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>Add Annotation</Text>
            <TextInput
              style={styles.input}
              placeholder="Label"
              placeholderTextColor="#999"
              value={newLabel}
              onChangeText={setNewLabel}
            />
            <TextInput
              style={styles.input}
              placeholder="Value"
              placeholderTextColor="#999"
              value={newValue}
              onChangeText={setNewValue}
            />
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowAddDialog(false);
                  setNewLabel('');
                  setNewValue('');
                  setNewType('general');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleAdd}
              >
                <Text style={styles.createButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  kvBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  lockedBox: {
    borderColor: '#DAA520',
    borderWidth: 2,
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  keyContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  valueContainer: {
    flex: 2,
    backgroundColor: '#fff',
    padding: 12,
  },
  keyInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  keyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  valueInput: {
    fontSize: 14,
    color: '#333',
  },
  valueText: {
    fontSize: 14,
    color: '#333',
  },
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  deleteActionButton: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
