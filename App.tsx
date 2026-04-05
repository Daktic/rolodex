import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from '@/theme/ThemeProvider';
import {useEffect, useState} from "react";
import {initDatabase} from "@/services/db";
import Loading from "./src/components/common/Loading";

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  useEffect(() => {
    async function setUp() {
      await initDatabase();
      setDbReady(true);
    }
    setUp();
  },[])
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        {!dbReady ? <Loading visible={true} /> : <AppNavigator />}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
