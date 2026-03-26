import {Animated, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from "react-native";
import {useRef, useState} from "react";
import PredicatesTab from "@/components/screens/semantics/Predicates";
import ObjectTypesTab from "@/components/screens/semantics/ObjectTypes";

const SemanticManagement = () => {
    const {width} = useWindowDimensions();
    const [activeTab, setActiveTab] = useState<0 | 1>(0);
    const translateX = useRef(new Animated.Value(0)).current;

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

const styles = StyleSheet.create({
    container: {flex: 1},
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
    tabActive: {borderBottomColor: '#007AFF'},
    tabText: {fontSize: 14, fontWeight: '600', color: '#999'},
    tabTextActive: {color: '#007AFF'},
    slideWindow: {flex: 1, overflow: 'hidden'},
    slideContainer: {flex: 1, flexDirection: 'row'},
    tabContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
});
