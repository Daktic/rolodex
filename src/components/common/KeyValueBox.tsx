import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Mask } from '@/types/db';
import { setMaskFields, getMaskFields } from '@/services/storage';
import {convertStringToIcon} from "@/utils/icons";

interface KeyValueBoxProps {
  initialKey?: string;
  initialValue?: string;
  keyEditable?: boolean;
  valueEditable?: boolean;
  onKeyChange?: (key: string) => void;
  onValueChange?: (value: string) => void;
  onLongPress?: () => void;
  onBlur?: (key: string, value: string) => void;
  onDelete?: () => void;
  currentMask?: Mask | null;
  fieldId?: number;
  isMasked?: boolean;
  onMaskToggle?: (fieldId: number, isMasked: boolean) => void;
  nubIcon?: string;
}

export default function KeyValueBox({
  initialKey = '',
  initialValue = '',
  keyEditable = false,
  valueEditable = false,
  onKeyChange,
  onValueChange,
  onLongPress,
  onBlur,
  onDelete,
  currentMask,
  fieldId,
  isMasked = false,
  onMaskToggle,
  nubIcon,
}: KeyValueBoxProps) {
  const [key, setKey] = useState(initialKey);
  const [value, setValue] = useState(initialValue);
  const [expanded, setExpanded] = useState(false);
  const swipeableRef = useRef<Swipeable>(null);

  // Update local state when props change
  useEffect(() => {
    setKey(initialKey);
  }, [initialKey]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleKeyChange = (newKey: string) => {
    setKey(newKey);
    onKeyChange?.(newKey);
  };

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    onValueChange?.(newValue);
  };

  const handleBlur = () => {
    if (key.trim() && value.trim()) {
      onBlur?.(key, value);
    }
  };

  const handleDelete = () => {
    if (isMasked) {
      swipeableRef.current?.close();
      return;
    }
    Alert.alert(
      'Delete Field',
      `Are you sure you want to delete "${key || 'this field'}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(),
        },
      ]
    );
  };

  const handleSwipeRight = async () => {
    if (!currentMask || !fieldId) {
      swipeableRef.current?.close();
      return;
    }

    const newMaskedState = !isMasked;

    // Update parent state immediately for UI responsiveness
    onMaskToggle?.(fieldId, newMaskedState);

    // Persist to database
    try {
      const currentMaskFields = await getMaskFields(currentMask.id);
      const currentFieldIds = currentMaskFields.map(f => f.id);

      let updatedFieldIds: number[];
      if (newMaskedState) {
        // Add field to mask
        updatedFieldIds = [...currentFieldIds, fieldId];
      } else {
        // Remove field from mask
        updatedFieldIds = currentFieldIds.filter(id => id !== fieldId);
      }

      await setMaskFields(currentMask.id, updatedFieldIds);
    } catch (error) {
      console.error("Failed to update mask fields:", error);
      // Revert UI state on error
      onMaskToggle?.(fieldId, !newMaskedState);
    }

    // Close the swipeable to bounce back
    swipeableRef.current?.close();
  };

  const renderLeftActions = () => {
    // Invisible action area that triggers mask/unmask
    return <View style={{ width: 80 }} />;
  };

  const renderRightActions = () => {
    return (
      <View style={[styles.deleteButton, isMasked && styles.deleteButtonDisabled]}>
        <Text style={styles.deleteText}>Delete</Text>
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={onDelete ? renderRightActions : undefined}
        overshootLeft={false}
        overshootRight={false}
        onSwipeableOpen={(direction) => {
          if (direction === 'left') {
            handleSwipeRight();
          }
          if (direction === 'right') {
            handleDelete();
          }
        }}
      >
        <Pressable
          style={styles.container}
          onPress={() => setExpanded(e => !e)}
          onLongPress={onLongPress}
        >

          <View style={styles.keyContainer}>
            {nubIcon && (
              <View style={styles.keyIconSection}>
                {convertStringToIcon(nubIcon)}
              </View>
            )}
            <View style={styles.keyTextSection}>
              <Text style={styles.keyText} numberOfLines={expanded ? undefined : 1} ellipsizeMode="tail">
                {key || 'Key'}
              </Text>
            </View>
          </View>

          <View style={[styles.valueContainer, isMasked && styles.blurredValue]}>
            {isMasked ? (
              <Text style={styles.maskedText}>Masked</Text>
            ) : valueEditable ? (
              <TextInput
                style={styles.valueInput}
                value={value}
                onChangeText={handleValueChange}
                onBlur={handleBlur}
                placeholder="Value"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.valueText} numberOfLines={expanded ? undefined : 1} ellipsizeMode="tail">
                {value || 'Value'}
              </Text>
            )}
          </View>

        </Pressable>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 12,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  keyContainer: {
    width: '35%',
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  keyIconSection: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyTextSection: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  valueContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    justifyContent: 'center',
  },
  keyInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  keyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  valueInput: {
    fontSize: 12,
    color: '#333',
  },
  valueText: {
    fontSize: 12,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginLeft: -8,
    paddingLeft: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButtonDisabled: {
    backgroundColor: '#ccc',
  },
  blurredValue: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  maskedText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
