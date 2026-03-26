import {Animated, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from "react-native";
import {useEffect, useRef, useState} from "react";
import {Predicates} from "@/types/db";
import {getAllPredicateObjects, getObjectTypesWithUsage} from "@/services/storage";
import KVBContainer from "@/components/common/KVBContainer";
import ObjectTypes from "@/components/screens/semantics/ObjectTypes";
import PredicatesDialog from "@/components/screens/semantics/Predicates";

const SemanticManagement = () => {
    const {width} = useWindowDimensions();
    const [activeTab, setActiveTab] = useState<0 | 1>(0);
    const translateX = useRef(new Animated.Value(0)).current;

    const [objectTypes, setObjectTypes] = useState<{ id: number; label: string; useCount: number }[]>([]);
    const [predicateObjects, setPredicateObjects] = useState<Predicates[]>([]);
    const [objectTypeDialogVisible, setObjectTypeDialogVisible] = useState(false);
    const [predicateDialogVisible, setPredicateDialogVisible] = useState(false);

    const refresh = () => {
        getObjectTypesWithUsage().then(setObjectTypes);
        getAllPredicateObjects().then(setPredicateObjects);
    };

    useEffect(() => {
        refresh();
    }, []);

    const switchTab = (tab: 0 | 1) => {
        setActiveTab(tab);
        Animated.timing(translateX, {
            toValue: tab === 0 ? 0 : -width,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={styles.container}>
            <PredicatesDialog
                visible={predicateDialogVisible}
                setVisible={setPredicateDialogVisible}
                onAdd={refresh}
            />
            <ObjectTypes
                visible={objectTypeDialogVisible}
                setVisible={setObjectTypeDialogVisible}
                onAdd={refresh}
            />

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 0 && styles.tabActive]}
                    onPress={() => switchTab(0)}
                >
                    <Text style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}>
                        Predicates
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 1 && styles.tabActive]}
                    onPress={() => switchTab(1)}
                >
                    <Text style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}>
                        Object Types
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Sliding Content */}
            <View style={styles.slideWindow}>
                <Animated.View style={[styles.slideContainer, {width: width * 2, transform: [{translateX}]}]}>

                    {/* Predicates Tab */}
                    <View style={[styles.tabContent, {width}]}>
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
                            onAdd={() => setPredicateDialogVisible(true)}
                        />
                    </View>

                    {/* Object Types Tab */}
                    <View style={[styles.tabContent, {width}]}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.columnHeaders}>
                                <Text style={styles.columnHeaderKey}>Name</Text>
                                <Text style={styles.columnHeaderValue}>Uses</Text>
                            </View>
                        </View>
                        <KVBContainer
                            items={objectTypes.map(ot => ({id: ot.id, key: ot.label, value: String(ot.useCount)}))}
                            onBlur={() => {}}
                            onAdd={() => setObjectTypeDialogVisible(true)}
                        />
                    </View>

                </Animated.View>
            </View>
        </View>
    );
};

export default SemanticManagement;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
    },
    tabTextActive: {
        color: '#007AFF',
    },
    slideWindow: {
        flex: 1,
        overflow: 'hidden',
    },
    slideContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    tabContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
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
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    columnHeaderValue: {
        flex: 1,
        fontSize: 11,
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
