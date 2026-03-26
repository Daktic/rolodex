import {Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {useState} from "react";
import {upsertObjectType} from "@/services/storage";

interface AddObjectTypeProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    onAdd: () => void;
}

const ObjectTypes = ({visible, setVisible, onAdd}: AddObjectTypeProps) => {
    const [label, setLabel] = useState('');

    const handleAdd = async () => {
        if (!label.trim()) return;
        await upsertObjectType(label.trim());
        handleClose();
        onAdd();
    };

    const handleClose = () => {
        setVisible(false);
        setLabel('');
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.dialogOverlay}>
                <View style={styles.dialogContainer}>
                    <Text style={styles.dialogTitle}>Add Object Type</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Type label..."
                        placeholderTextColor="#999"
                        value={label}
                        onChangeText={setLabel}
                        autoFocus
                    />

                    <View style={styles.dialogButtons}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.createButton]} onPress={handleAdd}>
                            <Text style={styles.createButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ObjectTypes;

const styles = StyleSheet.create({
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
        shadowOffset: {width: 0, height: 2},
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
        marginBottom: 12,
        fontSize: 15,
        color: '#333',
    },
    dialogButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {backgroundColor: '#f0f0f0'},
    cancelButtonText: {color: '#666', fontSize: 16, fontWeight: '600'},
    createButton: {backgroundColor: '#007AFF'},
    createButtonText: {color: 'white', fontSize: 16, fontWeight: '600'},
});
