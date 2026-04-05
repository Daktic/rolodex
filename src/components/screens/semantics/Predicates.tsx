import {Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {useCallback, useState} from "react";
import {deletePredicate, getAllPredicateObjects, upsertPredicate} from "@/services/storage";
import {Predicates as PredicateWithObject} from "@/types/db";
import KVBContainer from "@/components/common/KVBContainer";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {SemanticStackParamList} from "@/navigation/SemanticsStack";
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

interface AddPredicateModalProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    onAdd: (id: number) => void;
}

const getStyles = (theme: Theme) => StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    columnHeaders: {
        flexDirection: 'row',
        flex: 1,
    },
    columnHeaderKey: {
        width: '35%',
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    columnHeaderValue: {
        flex: 1,
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
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
        borderColor: theme.colors.borderAlt,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 15,
        color: theme.colors.text.primary,
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
    cancelButton: {backgroundColor: theme.colors.surfaceAlt},
    cancelButtonText: {color: theme.colors.text.secondary, fontSize: 16, fontWeight: '600'},
    createButton: {backgroundColor: theme.colors.accent},
    createButtonText: {color: theme.colors.text.inverse, fontSize: 16, fontWeight: '600'},
});

const AddPredicateModal = ({visible, setVisible, onAdd}: AddPredicateModalProps) => {
    const [label, setLabel] = useState('');
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const handleAdd = async () => {
        if (!label.trim()) return;
        const id = await upsertPredicate(label.trim());
        handleClose();
        onAdd(id);
    };

    const handleClose = () => {
        setVisible(false);
        setLabel('');
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.dialogOverlay}>
                <View style={styles.dialogContainer}>
                    <Text style={styles.dialogTitle}>Add Predicate</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Predicate label..."
                        placeholderTextColor={theme.colors.placeholder}
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

const PredicatesTab = () => {
    const navigation = useNavigation<NativeStackNavigationProp<SemanticStackParamList>>();
    const [predicateObjects, setPredicateObjects] = useState<PredicateWithObject[]>([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const refresh = () => getAllPredicateObjects().then(setPredicateObjects);

    useFocusEffect(useCallback(() => {
        refresh();
    }, []));

    const handleDelete = (id: number) => deletePredicate(id).then(refresh);

    const handleAdd = (id: number) => {
        navigation.navigate('PredicateDetail', {predicateId: id});
    };

    return (
        <>
            <AddPredicateModal visible={dialogVisible} setVisible={setDialogVisible} onAdd={handleAdd} />
            <View style={styles.sectionHeader}>
                <View style={styles.columnHeaders}>
                    <Text style={styles.columnHeaderKey}>Name</Text>
                    <Text style={styles.columnHeaderValue}>Types</Text>
                </View>
            </View>
            <KVBContainer
                items={predicateObjects.map((p) => ({
                    id: p.id,
                    key: p.label,
                    value: p.objectLabel ?? 'No type',
                    icon: p.iconName ?? undefined,
                }))}
                onBlur={() => {}}
                onAdd={() => setDialogVisible(true)}
                onDelete={handleDelete}
                onItemPress={(id: number) => navigation.navigate('PredicateDetail', {predicateId: id})}
            />
        </>
    );
};

export default PredicatesTab;
