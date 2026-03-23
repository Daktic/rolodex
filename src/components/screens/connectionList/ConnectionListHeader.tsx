
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Blocks, Share} from "lucide-react-native";
import {useNavigation} from "@react-navigation/native";
import type {NativeStackNavigationProp} from "@react-navigation/native-stack";
import type {ConnectionsStackParamList} from "@/navigation/ConnectionsStack";


export const ConnectionListHeader = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>();

    const handleConnectPress = () => {
        navigation.navigate('ConnectViaScreen');
    };

    return (
        <View style={styles.header}>
            <Text style={styles.title}>Connections</Text>
            <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnectPress}
            >
                <Blocks />
            </TouchableOpacity>

        </View>
    )
};

export default ConnectionListHeader;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    connectButton: {
        padding: 8,
        marginLeft: 'auto',
    },
});