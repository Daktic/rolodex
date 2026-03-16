import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import {useEffect, useState} from "react";
import {initDatabase} from "./src/services/storage";
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
  if (!dbReady) {
    return <Loading visible={true} />;
  }
  return (
    <GestureHandlerRootView style={styles.container}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
