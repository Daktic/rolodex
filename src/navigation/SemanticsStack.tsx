import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SemanticsScreen from "@/screens/semantics/SemanticsScreen";
import PredicateDetailsScreen from "@/screens/semantics/PredicateDetailsScreen";
import { useTheme } from '@/hooks/useTheme';

export type SemanticStackParamList = {
    Semantics: undefined;
    PredicateDetail: { predicateId: number };
};

const Stack = createNativeStackNavigator<SemanticStackParamList>();

export default function SemanticsStack() {
    const { theme } = useTheme();
    return (
        <Stack.Navigator screenOptions={{
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.accent,
            headerTitleStyle: { color: theme.colors.text.primary },
        }}>
            <Stack.Screen
                name="Semantics"
                component={SemanticsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PredicateDetail"
                component={PredicateDetailsScreen}
                options={{ headerShown: true, title: 'All Predicates' }}
            />
        </Stack.Navigator>
    );
}
