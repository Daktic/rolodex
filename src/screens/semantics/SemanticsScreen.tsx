
import {StyleSheet, ScrollView, Text, View} from 'react-native';
import SemanticManagement from "@/components/screens/semantics/SemanticManagement";
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/theme/themes/base';

const getStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
        color: theme.colors.text.primary,
    },
});

export default function SemanticsScreen() {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Semantics</Text>
            </View>
            <SemanticManagement />
        </ScrollView>
    );
}
