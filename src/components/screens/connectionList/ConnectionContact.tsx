import { StyleSheet, View, Text, Image } from 'react-native';
import { Connection, ConnectionField } from '@/types/storage';

interface ConnectionContactProps {
  connection: Connection;
  fields: ConnectionField[];
}

export default function ConnectionContact({ connection, fields }: ConnectionContactProps) {
  return (
    <View style={styles.container}>
      {/* Avatar Circle */}
      <View style={styles.avatarContainer}>
        {connection.avatar_uri ? (
          <Image source={{ uri: connection.avatar_uri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {connection.display_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Display Name */}
      <View style={styles.infoContainer}>
        <Text style={styles.displayName} numberOfLines={1}>
          {connection.display_name}
        </Text>

        {/* Icon List - placeholder for now */}
        <View style={styles.iconList}>
          {fields.slice(0, 5).map((field) => (
            <View key={field.id} style={styles.iconPlaceholder}>
              <Text style={styles.iconText}>{field.label.charAt(0).toUpperCase()}</Text>
            </View>
          ))}
          {fields.length > 5 && (
            <Text style={styles.ellipsis}>+{fields.length - 5}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  infoContainer: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  iconList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  iconText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  ellipsis: {
    fontSize: 12,
    color: '#999',
    marginLeft: 2,
  },
});
