import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

interface KeyValueBoxProps {
  initialKey?: string;
  initialValue?: string;
  keyEditable?: boolean;
  valueEditable?: boolean;
  onKeyChange?: (key: string) => void;
  onValueChange?: (value: string) => void;
  onLongPress?: () => void;
  onDelete?: () => void;
}

export default function KeyValueBox({
  initialKey = '',
  initialValue = '',
  keyEditable = false,
  valueEditable = false,
  onKeyChange,
  onValueChange,
  onLongPress,
  onDelete,
}: KeyValueBoxProps) {
  const [key, setKey] = useState(initialKey);
  const [value, setValue] = useState(initialValue);
  const [isBlurred, setIsBlurred] = useState(false);
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

  const handleDelete = () => {
    if (isBlurred) {
      // Don't allow deletion of blurred fields
      return;
    }
    Alert.alert(
      'Delete Field',
      `Are you sure you want to delete "${key || 'this field'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(),
        },
      ]
    );
  };

  const handleSwipeRight = () => {
    setIsBlurred(!isBlurred);
    // Close the swipeable to bounce back
    swipeableRef.current?.close();
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    // Invisible action area that triggers mask/unmask
    return <View style={{ width: 80 }} />;
  };

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
          style={[styles.deleteButton, isBlurred && styles.deleteButtonDisabled]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
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
      }}
    >
      <Pressable
        style={styles.container}
        onPress={onLongPress}
      >
        <View style={styles.keyContainer}>
          {keyEditable && !isBlurred ? (
            <TextInput
              style={styles.keyInput}
              value={key}
              onChangeText={handleKeyChange}
              placeholder="Key"
              placeholderTextColor="#999"
            />
          ) : (
            <Text style={styles.keyText}>{key || 'Key'}</Text>
          )}
        </View>

        <View style={[styles.valueContainer, isBlurred && styles.blurredValue]}>
          {isBlurred ? (
            <Text style={styles.maskedText}>Masked</Text>
          ) : valueEditable ? (
            <TextInput
              style={styles.valueInput}
              value={value}
              onChangeText={handleValueChange}
              placeholder="Value"
              placeholderTextColor="#999"
            />
          ) : (
            <Text style={styles.valueText}>
              {value || 'Value'}
            </Text>
          )}
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#fff',
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
  deleteButton: {
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
