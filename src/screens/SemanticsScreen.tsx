
import { StyleSheet, ScrollView, Text } from 'react-native';


export default function SemanticsScreen() {


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text>Semantics</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        paddingBottom: 100,
    },
});
