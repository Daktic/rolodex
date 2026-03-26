import {Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import DropDownPicker, {ItemType} from "react-native-dropdown-picker";
import {useEffect, useState} from "react";
import {getAllObjectTypes, upsertObjectType} from "@/services/storage";
import {ObjectType} from "@/types/db";

const ICON_ITEMS: ItemType<string>[] = [
    {label: 'Briefcase', value: 'BriefcaseBusiness'},
    {label: 'Handshake', value: 'Handshake'},
];

interface AddObjectTypeProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    onAdd: () => void;
}

const AddObjectType = ({visible, setVisible, onAdd}: AddObjectTypeProps) => {
    const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
    const [labelItems, setLabelItems] = useState<ItemType<number>[]>([]);
    const [labelOpen, setLabelOpen] = useState(false);
    const [labelId, setLabelId] = useState<number | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

    const [iconItems] = useState<ItemType<string>[]>(ICON_ITEMS);
    const [iconOpen, setIconOpen] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            getAllObjectTypes().then(types => {
                setObjectTypes(types);
                setLabelItems(types.map(t => ({label: t.label, value: t.id})));
            });
        }
    }, [visible]);

    useEffect(() => {
        setLabelItems(objectTypes.map(t => ({label: t.label, value: t.id})));
    }, [objectTypes]);

    const handleLabelSelection = (item: ItemType<number>) => {
        setSelectedLabel(item.label ?? null);
    };

    const handleAdd = async () => {
        if (!selectedLabel) return;
        await upsertObjectType(selectedLabel, selectedIcon ?? undefined);
        handleClose();
        onAdd();
    };

    const handleClose = () => {
        setVisible(false);
        setLabelId(null);
        setSelectedLabel(null);
        setSelectedIcon(null);
        setLabelOpen(false);
        setIconOpen(false);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.dialogOverlay}>
                <View style={styles.dialogContainer}>
                    <Text style={styles.dialogTitle}>Add Object Type</Text>

                    <View style={[styles.pickerRow, labelOpen && {zIndex: 2000}]}>
                        <DropDownPicker
                            placeholder="Select or add type..."
                            searchable={true}
                            searchPlaceholder="Search or add new..."
                            addCustomItem={true}
                            items={labelItems}
                            setItems={setLabelItems}
                            value={labelId}
                            setValue={setLabelId}
                            onSelectItem={handleLabelSelection}
                            open={labelOpen}
                            setOpen={(open) => {
                                setLabelOpen(open);
                                if (open) setIconOpen(false);
                            }}
                            listMode="SCROLLVIEW"
                        />
                    </View>

                    <View style={[styles.pickerRow, iconOpen && {zIndex: 1000}]}>
                        <DropDownPicker
                            placeholder="Select an icon (optional)"
                            items={iconItems}
                            value={selectedIcon}
                            setValue={setSelectedIcon}
                            open={iconOpen}
                            setOpen={(open) => {
                                setIconOpen(open);
                                if (open) setLabelOpen(false);
                            }}
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

export default AddObjectType;

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
        zIndex: 1,
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
