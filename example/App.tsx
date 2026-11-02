import * as ExpoWatchConnectivity from "expo-watch-connectivity";
import { useEffect } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { addMessageListener } from "expo-watch-connectivity";
import { useAssets } from "expo-asset";

export default function App() {
  const paired = ExpoWatchConnectivity.usePaired();
  const installed = ExpoWatchConnectivity.useInstalled();
  const reachable = ExpoWatchConnectivity.useReachable();

  useEffect(() => {
    const sub = addMessageListener((message) => {
      console.log("New message", message);
    });
    return () => sub.remove();
  }, []);

  const [assets] = useAssets([require("./assets/music.mp3")]);
  const fileUri = assets?.[0]?.localUri;

  return (
    <View style={styles.container}>
      <Text>{"Supported: " + ExpoWatchConnectivity.isSupported}</Text>
      <Text>{"Paired: " + paired}</Text>
      <Text>{"Installed: " + installed}</Text>
      <Text>{"Reachable: " + reachable}</Text>
      <Button
        title={"Send Hello World"}
        onPress={() => ExpoWatchConnectivity.sendMessage({ hello: "world" })}
      />
      <Button
        title={"Send Test File"}
        disabled={!fileUri}
        onPress={() =>
          fileUri && ExpoWatchConnectivity.sendFile(fileUri, { hello: "world" })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
