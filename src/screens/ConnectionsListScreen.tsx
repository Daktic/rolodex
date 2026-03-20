import { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { Connection, ConnectionField } from '@/types/storage';
import { getAllConnections, getConnectionFields, deleteConnection } from '@/services/storage';
import ConnectionContainer from '@/components/screens/connectionList/ConnectionContainer';


interface ConnectionWithFields {
  connection: Connection;
  fields: ConnectionField[];
}

const ConnectionsListScreen = () => {
  const [connections, setConnections] = useState<ConnectionWithFields[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadConnections = async () => {
    try {
      setLoading(true);
      const allConnections = await getAllConnections();

      // Fetch fields for each connection
      const connectionsWithFields = await Promise.all(
        allConnections.map(async (connection) => {
          const fields = await getConnectionFields(connection.id);
          return { connection, fields };
        })
      );

      setConnections(connectionsWithFields);
    } catch (error) {
      console.error('Failed to load connections:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reload connections when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadConnections();
    }, [])
  );

  const handlePress = (connection: Connection) => {
    navigation.navigate('ConnectionDetail', { connectionId: connection.id });
  };

  const handleDelete = async (connectionId: string) => {
    try {
      await deleteConnection(connectionId);
      // Remove from local state
      setConnections(connections.filter(c => c.connection.id !== connectionId));
    } catch (error) {
      console.error('Failed to delete connection:', error);
    }
  };

  const handleShare = (connection: Connection) => {
    // TODO: Implement share functionality
    console.log('Share connection:', connection.display_name);
  };

  if (loading) {
    return <Text>Loading</Text>
  }

  if (connections.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Connections</Text>
        </View>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>No connections yet</Text>
          <Text style={styles.emptySubtext}>
            Scan a QR code or use NFC to add connections
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connections</Text>
      </View>
      <FlatList
        data={connections}
        keyExtractor={(item) => item.connection.id}
        renderItem={({ item }) => (
          <ConnectionContainer
            connection={item.connection}
            fields={item.fields}
            onPress={handlePress}
            onDelete={handleDelete}
            onShare={handleShare}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

export default ConnectionsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
