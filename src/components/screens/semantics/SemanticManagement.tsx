import {Animated, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from "react-native";
import {useRef, useState} from "react";
import PredicatesTab from "@/components/screens/semantics/Predicates";
import ObjectTypesTab from "@/components/screens/semantics/ObjectTypes";
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

const getStyles = (theme: Theme) => StyleSheet.create({
    container: {flex: 1},
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderAlt,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {borderBottomColor: theme.colors.accent},
    tabText: {fontSize: 14, fontWeight: '600', color: theme.colors.text.tertiary},
    tabTextActive: {color: theme.colors.accent},
    slideWindow: {flex: 1, overflow: 'hidden'},
    slideContainer: {flex: 1, flexDirection: 'row'},
    tabContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
});

const SemanticManagement = () => {
    const {width} = useWindowDimensions();
    const [activeTab, setActiveTab] = useState<0 | 1>(0);
    const translateX = useRef(new Animated.Value(0)).current;
    const { theme } = useTheme();
    const styles = getStyles(theme);

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

            <View style={styles.slideWindow}>
                <Animated.View style={[styles.slideContainer, {width: width * 2, transform: [{translateX}]}]}>
                    <View style={[styles.tabContent, {width}]}>
                        <PredicatesTab />
                    </View>
                    <View style={[styles.tabContent, {width}]}>
                        <ObjectTypesTab />
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

export default SemanticManagement;
