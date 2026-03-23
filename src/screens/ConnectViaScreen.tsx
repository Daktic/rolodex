import {Button, Linking, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useState} from "react";
import {CameraView, useCameraPermissions} from "expo-camera";
import {Camera} from "lucide-react-native";
import {parseExternalQRCode} from "@/services/connection/qr";
import {useNavigation} from "@react-navigation/native";
import type {NativeStackNavigationProp} from "@react-navigation/native-stack";
import type {ConnectionsStackParamList} from "@/navigation/ConnectionsStack";

const CameraScan = (
    {show, setShow}:{show:boolean, setShow: (value: boolean) => void
    }) => {

    const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>();


    const handleQRScanned = async ({data}: { data: string }) => {
        const connectionID = await parseExternalQRCode(data);
        console.log({connectionID});
        if (connectionID) {
            setShow(false);
            navigation.navigate('ConnectionDetail', { connectionId: connectionID });
            Linking.openURL(data);
        } else {
            console.log("Invalid QR code");
        }
    }
    return (
        <View>
            {show ? <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={handleQRScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            /> : null}

        </View>

    )
}


const ConnectViaScreen = () => {
    const [showCamera, setShowCamera] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [username, setUsername] = useState('');


    const handleCameraPress = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                return;
            }
        }
        setShowCamera(!showCamera);
    };


    return (
        <View>
            <TouchableOpacity onPress={handleCameraPress}>
                <Camera />
            </TouchableOpacity>
            <CameraScan show={showCamera} setShow={setShowCamera}/>
            <Text>Username: {username}</Text>
        </View>

    )
};

export default ConnectViaScreen;

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
    camera: {
        width: 250,
        height: 250,
    },
});
