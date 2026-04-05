import { Drama, ChevronDown, Plus, Trash2, Share } from "lucide-react-native";
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, TextInput, Animated } from "react-native";
import { useState, useEffect } from "react";
import {deleteMask, getMasks, upsertMask} from "@/services/storage";
import { getProfileId } from "@/services/wallet";
import {Mask} from "@/types/db";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';


interface MasksProps {
    onMaskChange?: (mask: Mask | null) => void;
    onSharePress?: () => void;
}

const getStyles = (theme: Theme) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    icon: {
        marginRight: 12,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    chevron: {
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        width: '80%',
        maxHeight: 400,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    scrollView: {
        maxHeight: 400,
    },
    dropdownItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surfaceAlt,
        backgroundColor: theme.colors.surface,
    },
    dropdownItemText: {
        fontSize: 18,
        color: theme.colors.text.primary,
    },
    deleteAction: {
        backgroundColor: theme.colors.danger,
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: 80,
    },
    deleteActionButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
    addNewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 0,
    },
    addNewText: {
        fontSize: 18,
        color: theme.colors.accent,
        marginLeft: 8,
    },
    dialogOverlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteDialogOverlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
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
        marginBottom: 20,
    },
    dialogButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
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
    deleteButton: {
        backgroundColor: theme.colors.danger,
    },
    deleteButtonText: {
        color: theme.colors.text.inverse,
        fontSize: 16,
        fontWeight: '600',
    },
    shareButton: {
        padding: 8,
        marginLeft: 'auto',
    },
});

export default function Masks({ onMaskChange, onSharePress }: MasksProps) {
    const [currentMask, setCurrentMask] = useState<Mask | null>(null);
    const [masks, setMasks] = useState<any[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [newMaskName, setNewMaskName] = useState("");
    const [profileId, setProfileId] = useState<string | null>(null);

    const { theme } = useTheme();
    const styles = getStyles(theme);

    useEffect(() => {
        getProfileId().then(id => {
            console.log("Masks: Got profile ID:", id);
            setProfileId(id);
        });
    }, []);

    useEffect(() => {
        console.log("Masks: profileId changed to:", profileId);
        if(!profileId) return;

        console.log("Masks: Fetching masks for profile:", profileId);
        getMasks(profileId).then(fetchedMasks => {
            console.log("Masks: Fetched masks:", fetchedMasks);
            setMasks(fetchedMasks);
            if (fetchedMasks.length > 0) {
                const firstMask = fetchedMasks[0];
                console.log("Masks: Setting current mask to:", firstMask);
                setCurrentMask(firstMask);
                onMaskChange?.(firstMask);
            } else {
                console.log("Masks: No masks found!");
            }
        }).catch(error => {
            console.error("Masks: Error fetching masks:", error);
        });
    }, [profileId]);

    const handleMaskSelect = (mask: Mask) => {
        setCurrentMask(mask);
        onMaskChange?.(mask);
        setDropdownVisible(false);
    };

    const handleAddNewMask = () => {
        setDropdownVisible(false);
        setDialogVisible(true);
    };

    const handleCreateMask = () => {
        if (!profileId) {
            console.error("Profile ID is not available");
            return;
        };
        if (newMaskName.trim()) {
            console.log("Creating new mask:", newMaskName);
            setDialogVisible(false);
            setNewMaskName("");
            upsertMask(newMaskName, profileId).then(() => {
                getMasks(profileId).then(fetchedMasks => {
                    setMasks(fetchedMasks);
                    // Find and set the newly created mask
                    const newMask = fetchedMasks.find(m => m.name === newMaskName);
                    if (newMask) {
                        setCurrentMask(newMask);
                        onMaskChange?.(newMask);
                    }
                });
            });
        }
    };

    const handleDeleteMask = (maskToDelete: Mask) => {
        // Prevent deleting "All" mask
        if (masks.length === 1) {
            alert("You must have at least one mask.");
            return;
        }
        if (!profileId) {
            console.error("Profile ID is not available");
            return;
        };
        console.log("Deleting mask:", maskToDelete.name);
        setDropdownVisible(false);
        deleteMask(maskToDelete.name).then(() => {
            getMasks(profileId).then(fetchedMasks => {
                setMasks(fetchedMasks);
                // Find and set the newly created mask
                const newMask = fetchedMasks[fetchedMasks.length - 1];
                if (newMask) {
                    setCurrentMask(newMask);
                    onMaskChange?.(newMask);
                }
            });
        })
    };

    const renderRightActions = (mask: any) => () => {
        return (
            <Animated.View style={styles.deleteAction}>
                <TouchableOpacity
                    style={styles.deleteActionButton}
                    onPress={() => handleDeleteMask(mask)}
                >
                    <Trash2 size={20} color={theme.colors.text.inverse} />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    if (!currentMask) {
        // Show loading state while masks are being fetched
        return (
            <View style={styles.header}>
                <Drama size={32} color={theme.colors.text.primary} style={styles.icon} />
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Loading...</Text>
                </View>
            </View>
        );
    }

    return (
        <>
            <View style={styles.header}>
                <Drama size={32} color={theme.colors.text.primary} style={styles.icon} />
                <TouchableOpacity
                    style={styles.titleContainer}
                    onPress={() => setDropdownVisible(true)}
                >
                    <Text style={styles.title}>{currentMask.name}</Text>
                    <ChevronDown size={24} color={theme.colors.text.primary} style={styles.chevron} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={onSharePress}
                >
                    <Share size={24} color={theme.colors.accent} />
                </TouchableOpacity>
            </View>

            {/* Dropdown Modal */}
            <Modal
                visible={dropdownVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setDropdownVisible(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.dropdownContainer}>
                            <ScrollView style={styles.scrollView}>
                                {masks.map((mask, index) => {
                                    return (
                                        <Swipeable
                                            key={mask.name || index}
                                            renderRightActions={renderRightActions(mask)}
                                            overshootRight={false}
                                        >
                                            <TouchableOpacity
                                                style={styles.dropdownItem}
                                                onPress={() => handleMaskSelect(mask)}
                                            >
                                                <Text style={styles.dropdownItemText}>{mask.name}</Text>
                                            </TouchableOpacity>
                                        </Swipeable>
                                    );
                                })}
                                <TouchableOpacity
                                    style={[styles.dropdownItem, styles.addNewItem]}
                                    onPress={handleAddNewMask}
                                >
                                    <Plus size={20} color={theme.colors.accent} />
                                    <Text style={styles.addNewText}>Add New Mask</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* New Mask Dialog */}
            <Modal
                visible={dialogVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDialogVisible(false)}
            >
                <View style={styles.dialogOverlay}>
                    <View style={styles.dialogContainer}>
                        <Text style={styles.dialogTitle}>Create New Mask</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter mask name"
                            value={newMaskName}
                            onChangeText={setNewMaskName}
                            autoFocus
                        />
                        <View style={styles.dialogButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => {
                                    setDialogVisible(false);
                                    setNewMaskName("");
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.createButton]}
                                onPress={handleCreateMask}
                            >
                                <Text style={styles.createButtonText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
