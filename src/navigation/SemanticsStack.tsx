import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SemanticsScreen from "@/screens/semantics/SemanticsScreen";
import PredicateDetailsScreen from "@/screens/semantics/PredicateDetailsScreen";


export type SemanticStackParamList = {
    Semantics: undefined;
    PredicateDetail: { predicateId: number };
};

const Stack = createNativeStackNavigator<SemanticStackParamList>();

export default function SemanticsStack() {
    return (
        <Stack.Navigator>
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
