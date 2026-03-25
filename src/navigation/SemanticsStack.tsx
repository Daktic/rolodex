import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SemanticsScreen from "@/screens/SemanticsScreen";


export type SemanticStackParamList = {
    Semantics: undefined;
    Share: { maskId: number };
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
        </Stack.Navigator>
    );
}
