import { Drama } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useState, useEffect } from "react";
import { getMasks } from "@/services/storage";
import { getProfileId } from "@/services/wallet";

const PROFILE_ID = getProfileId();

export default function Masks() {
    const [currentMask, setCurrentMask] = useState<any>(null);

    useEffect(() => {
        getMasks(PROFILE_ID).then(masks => {
            if (masks.length > 0) {
                setCurrentMask(masks[0]);
            }
        });
    }, []);

    if (!currentMask) return null; // or a loading spinner

    return (
        <View style={styles.header}>
            <Drama size={32} color="#000" style={styles.icon} />
            <Text style={styles.title}>{currentMask.name}</Text>
        </View>
    );
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