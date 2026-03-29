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

interface ContextMenuProps {
  visible: boolean;
  actions: ContextMenuActionDescriptor[];
  onClose: () => void;
  onSelect: (selection: ContextMenuSelection) => void;
}

export default function ContextMenu({
  visible,
  actions,
  onClose,
  onSelect,
}: ContextMenuProps) {
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
                {convertStringToIcon(action.iconName, 18, '#444')}
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menu: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  actionIcon: {
    width: 22,
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  destructiveLabel: {
    color: '#d42f2f',
  },
  disabledLabel: {
    color: '#aaa',
  },
});
