import { Drama } from "lucide-react-native";
import {StyleSheet, Text, View,} from "react-native";
import { useState } from "react";

export default function Masks() {
    const [currentMask, setCurrentMask] = useState('all');

    return (
        <View style={styles.header}>
            <Drama size={32} color="#000" style={styles.icon} />
            <Text style={styles.title}>{currentMask}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    icon: {
        marginRight: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
});