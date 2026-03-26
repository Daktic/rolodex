import {Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import DropDownPicker, {ItemType} from "react-native-dropdown-picker";
import {useEffect, useState} from "react";
import {getAllPredicates, upsertPredicate} from "@/services/storage";
import {Predicate} from "@/types/db";

interface AddPredicateProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    onAdd: () => void;
}

const AddPredicate = ({visible, setVisible, onAdd}: AddPredicateProps) => {
    const [predicates, setPredicates] = useState<Predicate[]>([]);
    const [labelItems, setLabelItems] = useState<ItemType<number>[]>([]);
    const [labelOpen, setLabelOpen] = useState(false);
    const [labelId, setLabelId] = useState<number | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            getAllPredicates().then(p => {
                setPredicates(p);
                setLabelItems(p.map(pred => ({label: pred.label, value: pred.id})));
            });
        }
    }, [visible]);

    useEffect(() => {
        setLabelItems(predicates.map(p => ({label: p.label, value: p.id})));
    }, [predicates]);

    const handleLabelSelection = (item: ItemType<number>) => {
        setSelectedLabel(item.label ?? null);
    };

    const handleAdd = async () => {
        if (!selectedLabel) return;
        await upsertPredicate(selectedLabel);
        handleClose();
        onAdd();
    };

    const handleClose = () => {
        setVisible(false);
        setLabelId(null);
        setSelectedLabel(null);
        setLabelOpen(false);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.dialogOverlay}>
                <View style={styles.dialogContainer}>
                    <Text style={styles.dialogTitle}>Add Predicate</Text>

                    <View style={styles.pickerRow}>
                        <DropDownPicker
                            placeholder="Search or add predicate..."
                            searchable={true}
                            searchPlaceholder="Search or add new..."
                            addCustomItem={true}
                            items={labelItems}
                            setItems={setLabelItems}
                            value={labelId}
                            setValue={setLabelId}
                            onSelectItem={handleLabelSelection}
                            open={labelOpen}
                            setOpen={setLabelOpen}
                            listMode="SCROLLVIEW"
                        />
                    </View>

                    <View style={styles.dialogButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.createButton]}
                            onPress={handleAdd}
                        >
                            <Text style={styles.createButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AddPredicate;

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
    pickerRow: {
        marginBottom: 12,
        zIndex: 1000,
    },
    dialogButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        backgroundColor: '#007AFF',
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
