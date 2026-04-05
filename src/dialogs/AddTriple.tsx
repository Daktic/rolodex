import {Modal, StyleSheet, TextInput, Text, TouchableOpacity, View} from "react-native";
import DropDownPicker, {ItemType} from "react-native-dropdown-picker";
import {useEffect, useState} from "react";
import {getAllPredicates} from "@/services/storage";
import {Predicate, SemanticNode, ObjectType} from "@/types/db";
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

interface AddTripleProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    handleAdd: () => void;
    newLabel: Predicate | null;
    setNewLabel: (label: Predicate | null) => void;
    newValue: SemanticNode | null;
    setNewValue: (value: SemanticNode | null) => void;
    newType: ObjectType | null;
    setNewType: (type: ObjectType | null) => void;
}

const getStyles = (theme: Theme) => StyleSheet.create({
    dialogOverlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialogContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 24,
        width: '80%',
        shadowColor: theme.colors.shadow,
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
        borderColor: theme.colors.borderAlt,
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
        backgroundColor: theme.colors.surfaceAlt,
    },
    cancelButtonText: {
        color: theme.colors.text.secondary,
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        backgroundColor: theme.colors.accent,
    },
    createButtonText: {
        color: theme.colors.text.inverse,
        fontSize: 16,
        fontWeight: '600',
    },
});

const AddTriple = ({
                       visible,
                       setVisible,
                       handleAdd,
                       setNewLabel,
                       newValue,
                       setNewValue,
                       setNewType
                   }: AddTripleProps) => {

    const [labelOpen, setLabelOpen] = useState<boolean>(false)
    const [labelId, setLabelId] = useState<number | null>(null);
    const [predicates, setPredicates] = useState<Predicate[]>([])
    const [labelItems, setLabelItems] = useState<ItemType<number>[]>([]);

    const { theme } = useTheme();
    const styles = getStyles(theme);

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
        setNewLabel(predicates.find(p => p.id === item.value) ?? { id: -1, label: item.label ?? '', icon_id: null });
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
                        placeholderTextColor={theme.colors.placeholder}
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
