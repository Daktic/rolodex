import {Modal, StyleSheet, TextInput, Text, TouchableOpacity, View, StyleProp, TextStyle, ViewStyle} from "react-native";
import DropDownPicker, {ItemType} from "react-native-dropdown-picker";
import {useEffect, useState} from "react";
import {getAllNodes, getAllPredicates} from "@/services/storage";
import {Predicate, Node, NodeType} from "@/types/db";

interface AddTripleProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    handleAdd: () => void;
    newLabel: Predicate | null;
    setNewLabel: (label: Predicate | null) => void;
    newValue: Node | null;
    setNewValue: (value: Node | null) => void;
    newType: NodeType | null;
    setNewType: (type: NodeType | null) => void;
}

const AddTriple = ({
                       visible,
                       setVisible,
                       handleAdd,
                       newLabel,
                       setNewLabel,
                       newValue,
                       setNewValue,
                       newType,
                       setNewType
                   }: AddTripleProps) => {

    const [labelOpen, setLabelOpen] = useState<boolean>(false)
    const [labelId, setLabelId] = useState<number | null>(null);
    const [predicates, setPredicates] = useState<Predicate[]>([])
    const [labelItems, setLabelItems] = useState<ItemType<number>[]>([]);

    const predicateRefresh = () => {
        getAllPredicates().then(predicates => setPredicates(predicates));
    }
    useEffect(() => {
        predicateRefresh();
    }, [])

    useEffect(() => {
        setLabelItems(predicates.map(p => ({ label: p.label, value: p.id })));
    }, [predicates]);

    const handlePredicateSelection = (item: ItemType<number>) => {
        setNewLabel(predicates.find(p => p.id === item.value) ?? { id: -1, label: item.label ?? '' });
    };


    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.dialogOverlay}>
                <View style={styles.dialogContainer}>
                    <Text style={styles.dialogTitle}>Add Annotation</Text>
                    <DropDownPicker
                        placeholder="Select a label"
                        searchable={true}
                        searchPlaceholder="Search or add new..."
                        items={labelItems}
                        setItems={setLabelItems}
                        value={labelId}
                        setValue={setLabelId}
                        onSelectItem={(item) =>  handlePredicateSelection(item)}
                        open={labelOpen}
                        setOpen={setLabelOpen}
                        addCustomItem={true}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Value"
                        placeholderTextColor="#999"
                        value={newValue?.value ?? ''}
                        onChangeText={text => setNewValue({ ...(newValue ?? { id: -1, type: null, label: '' }), value: text })}
                    />
                    <View style={styles.dialogButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => {
                                setVisible(false);
                                setNewLabel(null);
                                setNewValue(null);
                                setNewType(null);
                                predicateRefresh();
                            }}
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
    )
}

export default AddTriple;

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
        shadowOffset: { width: 0, height: 2 },
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
        fontSize: 16,
        marginBottom: 12,
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
})