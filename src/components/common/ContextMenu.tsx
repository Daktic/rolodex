import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ContextMenuActionDescriptor,
  ContextMenuSelection,
} from '@/services/contextMenu';
import { convertStringToIcon } from '@/utils/icons';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

interface ContextMenuProps {
  visible: boolean;
  actions: ContextMenuActionDescriptor[];
  onClose: () => void;
  onSelect: (selection: ContextMenuSelection) => void;
}

const getStyles = (theme: Theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menu: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderAlt,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceAlt,
  },
  actionIcon: {
    width: 22,
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 15,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  destructiveLabel: {
    color: theme.colors.danger,
  },
  disabledLabel: {
    color: theme.colors.text.disabled,
  },
});

export default function ContextMenu({
  visible,
  actions,
  onClose,
  onSelect,
}: ContextMenuProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menu} onStartShouldSetResponder={() => true}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionRow}
              onPress={() =>
                onSelect({
                  actionId: action.id,
                  payload: action.payload,
                })
              }
              disabled={action.disabled}
            >
              <View style={styles.actionIcon}>
                {convertStringToIcon(action.iconName, 18, theme.colors.text.primary)}
              </View>
              <Text
                style={[
                  styles.actionLabel,
                  action.destructive && styles.destructiveLabel,
                  action.disabled && styles.disabledLabel,
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
