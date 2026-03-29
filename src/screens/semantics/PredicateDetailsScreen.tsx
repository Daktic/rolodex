import {useEffect, useState} from 'react';
import {Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import DropDownPicker, {ItemType} from 'react-native-dropdown-picker';
import {SemanticStackParamList} from '@/navigation/SemanticsStack';
import {Icon, ObjectType} from '@/types/db';
import {
    getAllIcons,
    getAllObjectTypes,
    getPredicateById,
    getPredicateObjectTypes,
    updatePredicateIcon,
    updatePredicateLabel,
    upsertObjectType,
    upsertPredicateObjectType,
    deletePredicateObjectType,
} from '@/services/storage';
import KVBContainer from '@/components/common/KVBContainer';
import {convertStringToIcon} from '@/utils/icons';

type Props = NativeStackScreenProps<SemanticStackParamList, 'PredicateDetail'>;

const PredicateDetailsScreen = ({route}: Props) => {
    const {predicateId} = route.params;

    const [label, setLabel] = useState('');
    const [iconId, setIconId] = useState<number | null>(null);
    const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
    const [icons, setIcons] = useState<Icon[]>([]);
    const [iconOpen, setIconOpen] = useState(false);
    const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);

    const [addModalVisible, setAddModalVisible] = useState(false);
    const [allObjectTypes, setAllObjectTypes] = useState<ObjectType[]>([]);
    const [pickerItems, setPickerItems] = useState<ItemType<string>[]>([]);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [selectedObjectTypeLabel, setSelectedObjectTypeLabel] = useState<string | null>(null);
    const [selectedObjectTypeValue, setSelectedObjectTypeValue] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const [predicate, allIcons] = await Promise.all([
                getPredicateById(predicateId),
                getAllIcons(),
            ]);
            setLabel(predicate.label);
            setIconId(predicate.icon_id);
            setIcons(allIcons);
            setSelectedIcon(allIcons.find(i => i.id === predicate.icon_id) ?? null);
            const ots = await getPredicateObjectTypes(predicateId);
            setObjectTypes(ots);
        };
        init();
    }, []);

    const handleLabelBlur = async () => {
        if (label.trim()) {
            await updatePredicateLabel(predicateId, label.trim());
        }
    };

    const handleIconItemPress = async (item: ItemType<number>, pickerOnPress: (val: number) => void) => {
        pickerOnPress(item.value!);
        const icon = item.value !== -1 ? (icons.find(i => i.id === item.value) ?? null) : null;
        setSelectedIcon(icon);
        setIconId(icon?.id ?? null);
        await updatePredicateIcon(predicateId, icon?.id ?? null);
    };

    const handleDeleteObjectType = async (objectTypeId: number) => {
        console.log('Deleting object type:', {objectTypeId, predicateId});
        await deletePredicateObjectType(predicateId, objectTypeId);
        setObjectTypes(prev => prev.filter(ot => ot.id !== objectTypeId));
    };

    const openAddModal = async () => {
        const ots = await getAllObjectTypes();
        setAllObjectTypes(ots);
        setPickerItems(ots.map(ot => ({label: ot.label, value: ot.label})));
        setSelectedObjectTypeLabel(null);
        setSelectedObjectTypeValue(null);
        setPickerOpen(false);
        setAddModalVisible(true);
    };

    const handleAdd = async () => {
        if (!selectedObjectTypeValue) return;
        const objectTypeId = await upsertObjectType(selectedObjectTypeValue);
        await upsertPredicateObjectType(predicateId, objectTypeId);
        const ots = await getPredicateObjectTypes(predicateId);
        setObjectTypes(ots);
        setAddModalVisible(false);
    };

    const iconItems: ItemType<number>[] = [
        {label: 'None', value: -1},
        ...icons.map(icon => ({label: icon.label, value: icon.id})),
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* Add Object Type Modal */}
            <Modal visible={addModalVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Add Object Type</Text>
                        <View style={styles.pickerRow}>
                            <DropDownPicker
                                placeholder="Search or add object type..."
                                searchable
                                searchPlaceholder="Search or add new..."
                                addCustomItem
                                items={pickerItems}
                                setItems={setPickerItems}
                                value={selectedObjectTypeValue}
                                setValue={setSelectedObjectTypeValue}
                                onSelectItem={(item) => setSelectedObjectTypeLabel(item.label ?? null)}
                                open={pickerOpen}
                                setOpen={setPickerOpen}
                                listMode="SCROLLVIEW"
                            />
                        </View>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setAddModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.addButton]}
                                onPress={handleAdd}
                            >
                                <Text style={styles.addButtonText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Name */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Name</Text>
                <TextInput
                    style={styles.input}
                    value={label}
                    onChangeText={setLabel}
                    onBlur={handleLabelBlur}
                    placeholder="Predicate name..."
                    placeholderTextColor="#999"
                />
            </View>

            {/* Icon */}
            <View style={[styles.section, styles.iconSection]}>
                <Text style={styles.sectionLabel}>Icon</Text>

                <TouchableOpacity
                    style={styles.selectedIconField}
                    onPress={() => setIconOpen(prev => !prev)}
                    activeOpacity={0.8}
                >
                    <View style={styles.iconItemIcon}>
                        {selectedIcon ? convertStringToIcon(selectedIcon.label) : null}
                    </View>
                    <Text style={[styles.selectedIconText, !selectedIcon && styles.placeholderText]}>
                        {selectedIcon?.label ?? 'Select icon...'}
                    </Text>
                </TouchableOpacity>

                <DropDownPicker
                    placeholder="Search icons..."
                    searchable
                    searchPlaceholder="Search icons..."
                    items={iconItems}
                    value={iconId}
                    setValue={setIconId}
                    open={iconOpen}
                    setOpen={setIconOpen}
                    listMode="SCROLLVIEW"
                    renderListItem={({item, onPress, isSelected}) => (
                        <TouchableOpacity
                            style={[styles.iconItem, isSelected && styles.iconItemSelected]}
                            onPress={() => handleIconItemPress(item, onPress)}
                        >
                            <View style={styles.iconItemIcon}>
                                {item.value !== -1 && convertStringToIcon(item.label as string)}
                            </View>
                            <Text style={[styles.iconItemLabel, item.value === -1 && styles.noneLabel]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Object Types */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Object Types</Text>
                <KVBContainer
                    items={objectTypes.map(ot => ({id: ot.id, key: ot.label, value: ''}))}
                    onBlur={() => {}}
                    onDelete={handleDeleteObjectType}
                    onAdd={openAddModal}
                    enableShortPressEdit={false}
                />
            </View>

        </ScrollView>
    );
};

export default PredicateDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    iconSection: {
        zIndex: 1000,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#333',
    },
    iconItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconItemSelected: {
        backgroundColor: '#f0f0f0',
    },
    iconItemIcon: {
        width: 28,
        alignItems: 'center',
    },
    iconItemLabel: {
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
    },
    // Modal
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
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
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    pickerRow: {
        marginBottom: 12,
        zIndex: 1000,
    },
    modalButtons: {
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
    addButton: {backgroundColor: '#007AFF'},
    addButtonText: {color: 'white', fontSize: 16, fontWeight: '600'},
    selectedIconField: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    selectedIconText: {
        fontSize: 15,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    noneLabel: {
        color: '#999',
        fontStyle: 'italic',
    },
});
