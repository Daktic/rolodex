import { useRef } from 'react';
import { StyleSheet, View, Pressable, Text, Alert, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Connection, ConnectionField } from '@/types/db';
import ConnectionContact from './ConnectionContact';

interface ConnectionContainerProps {
  connection: Connection;
  fields: ConnectionField[];
  onPress: (connection: Connection) => void;
  onDelete: (connectionId: number) => void;
  onShare?: (connection: Connection) => void;
}

const ConnectionContainer = ({
  connection,
  fields,
  onPress,
  onDelete,
  onShare,
}: ConnectionContainerProps) => {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    Alert.alert(
      'Delete Connection',
      `Are you sure you want to delete ${connection.display_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(connection.id),
        },
      ]
    );
  };

  const handleShare = () => {
    onShare?.(connection);
    swipeableRef.current?.close();
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [-80, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.shareContainer,
          { transform: [{ translateX: trans }] },
        ]}
      >
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareText}>Share</Text>
        </Pressable>
      </Animated.View>
    );
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
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
    >
      <Pressable
        style={styles.container}
        onPress={() => onPress(connection)}
      >
        <ConnectionContact connection={connection} fields={fields} />
      </Pressable>
    </Swipeable>
  );
}

export default ConnectionContainer;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  shareContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  shareText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
