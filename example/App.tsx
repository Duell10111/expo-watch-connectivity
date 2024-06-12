import { StyleSheet, Text, View } from 'react-native';

import * as ExpoWatchConnectivity from 'expo-watch-connectivity';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{ExpoWatchConnectivity.hello()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
