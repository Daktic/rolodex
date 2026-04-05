import { StyleSheet, View, Text, Image } from 'react-native';
import { Connection, ConnectionField } from '@/types/db';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

interface ConnectionContactProps {
  connection: Connection;
  fields: ConnectionField[];
}

export default function ConnectionContact({ connection, fields }: ConnectionContactProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

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

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surface,
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
    backgroundColor: theme.colors.borderAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  infoContainer: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
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
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  iconText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  ellipsis: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginLeft: 2,
  },
});
