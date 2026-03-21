import { View, Text, StyleSheet } from 'react-native';

export default function SettingsListScreen() {
    return (
        <View style={styles.container}>
            <Text>Settings</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});
