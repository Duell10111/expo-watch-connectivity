import * as ExpoWatchConnectivity from "expo-watch-connectivity";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { addMessageListener } from "expo-watch-connectivity";
import { useAssets } from "expo-asset";

export default function App() {
  const [paired, setPaired] = useState(false);

  useEffect(() => {
    ExpoWatchConnectivity.isPaired().then(setPaired).catch(console.error);
  }, []);

  useEffect(() => {
    const sub = addMessageListener((message) => {
      console.log("New message", message);
    });
    return () => sub.remove();
  }, []);

  const [assets, error] = useAssets([require("./assets/music.mp3")]);

  return (
    <View style={styles.container}>
      <Text>{ExpoWatchConnectivity.hello()}</Text>
      <Text>{"Paired: " + paired}</Text>
      <Button
        title={"Send Hello World"}
        onPress={() => ExpoWatchConnectivity.sendMessage({ hello: "world" })}
      />
      <Button
        title={"Send Test File"}
        onPress={() => ExpoWatchConnectivity.sendFile(assets?.[0].localUri,{ hello: "world" })}
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
