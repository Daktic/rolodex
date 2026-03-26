import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import {useEffect, useState} from "react";
import {ObjectType, Predicates} from "@/types/db";
import {getAllObjectTypes, getAllPredicateObjects} from "@/services/storage";
import KVBContainer from "@/components/common/KVBContainer";
import AddObjectType from "@/components/screens/semantics/AddObjectType";
import AddPredicate from "@/components/screens/semantics/AddPredicate";
import {convertStringToIcon} from "@/utils/icons";

const NodeType = () => {
    const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
    const [predicateObjects, setPredicateObjects] = useState<Predicates[]>([]);
    const [objectTypeDialogVisible, setObjectTypeDialogVisible] = useState(false);
    const [predicateDialogVisible, setPredicateDialogVisible] = useState(false);

    const refresh = () => {
        getAllObjectTypes().then(setObjectTypes);
        getAllPredicateObjects().then(setPredicateObjects);
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <View style={styles.container}>
            <AddObjectType
                visible={objectTypeDialogVisible}
                setVisible={setObjectTypeDialogVisible}
                onAdd={refresh}
            />
            <AddPredicate
                visible={predicateDialogVisible}
                setVisible={setPredicateDialogVisible}
                onAdd={refresh}
            />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Object Types</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setObjectTypeDialogVisible(true)}>
                    <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
            </View>
            <KVBContainer
                items={objectTypes.map(ot => ({id: ot.id, key: ot.label, value: ot.icon ?? 'No icon'}))}
                onBlur={() => {}}
                showAddButton={false}
            />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Predicates</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setPredicateDialogVisible(true)}>
                    <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
            </View>
            <KVBContainer
                items={predicateObjects.map((p, idx) => ({id: idx, key: p.label, value: p.objectLabel ?? 'No type'}))}
                onBlur={() => {}}
                showAddButton={false}
            />

        </View>
    );
};

export default NodeType;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    addButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
