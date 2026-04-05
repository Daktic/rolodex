import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, Image } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { ConnectionsStackParamList } from '@/navigation/ConnectionsStack';
import { getConnection } from '@/services/storage';
import { Connection } from '@/types/db';
import Attributions from '@/components/screens/connectionDetail/Attributions';
import Loading from '@/components/common/Loading';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

type ConnectionDetailRouteProp = RouteProp<ConnectionsStackParamList, 'ConnectionDetail'>;

export default function ConnectionDetailScreen() {
  const route = useRoute<ConnectionDetailRouteProp>();
  const { connectionId } = route.params;
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    const loadConnection = async () => {
      try {
        setLoading(true);
        const conn = await getConnection(connectionId);
        setConnection(conn);
      } catch (error) {
        console.error('Failed to load connection:', error);
      } finally {
        setLoading(false);
      }
    };
    loadConnection();
  }, [connectionId]);

  if (loading) {
    return <Loading visible={true} />;
  }

  if (!connection) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Connection not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Image */}
      <View style={styles.imageContainer}>
        {connection.avatar_uri ? (
          <Image source={{ uri: connection.avatar_uri }} style={styles.profileImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              {connection.display_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Display Name */}
      <View style={styles.nameContainer}>
        <Text style={styles.displayName}>{connection.display_name}</Text>
      </View>

      {/* Attributions (Connection Fields + Annotations) */}
      <Attributions connectionId={connectionId} />
    </ScrollView>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.borderAlt,
  },
  imagePlaceholderText: {
    fontSize: 48,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  nameContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  displayName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.text.secondary,
  },
});
