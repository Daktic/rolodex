
import {StyleSheet, ScrollView, Text, View} from 'react-native';
import NodeType from "@/components/screens/semantics/NodeType";


export default function SemanticsScreen() {


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Semantics</Text>
            </View>
            <NodeType />
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
});
