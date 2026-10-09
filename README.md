# expo-watch-connectivity

[![npm](https://img.shields.io/npm/v/expo-watch-connectivity)](https://www.npmjs.com/package/expo-watch-connectivity)
[![license](https://img.shields.io/npm/l/expo-watch-connectivity)](./LICENSE)

An [Expo Module](https://docs.expo.dev/modules/overview/) that exposes Apple's [WatchConnectivity](https://developer.apple.com/documentation/watchconnectivity) framework to React Native. Use it to talk from your iOS app to its companion watchOS app: send messages, queue user info, sync application context and transfer files.

- Live messages (`sendMessage`) and background-queued user info (`transferUserInfo`)
- Application context sync in both directions
- File transfers with metadata and progress
- Session state (paired, installed, reachable, activation) as listeners and React hooks
- Incoming messages, user info and files are **buffered natively** until JS subscribes, so nothing is lost when the app is launched or woken in the background by WatchConnectivity

> **Platform support:** iOS only. On Android the native module is not registered.

## Installation

```sh
npx expo install expo-watch-connectivity
```

The library contains native code, so it does not work in Expo Go. Use a [development build](https://docs.expo.dev/develop/development-builds/introduction/):

```sh
npx expo prebuild -p ios
npx expo run:ios
```

In a bare React Native project, [install and configure the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) first, then run `npx pod-install` after installing.

**Requirements:** iOS 16.4+. Developed and tested against Expo SDK 57.

### Adding a watchOS app

This library only covers the iPhone side. Your project also needs a watchOS companion app that activates its own `WCSession`. The easiest way to add one to an Expo project is [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets), which is what the [example app](#example-app) uses.

## Usage

```tsx
import { useEffect } from "react";
import { Button, Text, View } from "react-native";
import * as WatchConnectivity from "expo-watch-connectivity";

export default function App() {
  const paired = WatchConnectivity.usePaired();
  const installed = WatchConnectivity.useInstalled();
  const reachable = WatchConnectivity.useReachable();

  useEffect(() => {
    const sub = WatchConnectivity.addMessageListener((message) => {
      console.log("Message from watch:", message);
    });
    return () => sub.remove();
  }, []);

  return (
    <View>
      <Text>Supported: {String(WatchConnectivity.isSupported)}</Text>
      <Text>Paired: {String(paired)}</Text>
      <Text>Watch app installed: {String(installed)}</Text>
      <Text>Reachable: {String(reachable)}</Text>
      <Button
        title="Say hello"
        disabled={!reachable}
        onPress={() => WatchConnectivity.sendMessage({ hello: "world" })}
      />
    </View>
  );
}
```

### Choosing a transfer method

WatchConnectivity offers several ways to send data. Pick the one that matches how the data is used:

| Method | Delivery | Use for |
| --- | --- | --- |
| `sendMessage` | Immediately, only while the watch is reachable | Interactive, live communication |
| `transferUserInfo` | Queued, delivered in order in the background | Data that must arrive, even if the watch app is not running |
| `updateApplicationContext` | Only the latest value is kept and delivered | Current state, such as settings or the latest snapshot |
| `sendFile` | Queued in the background | Files such as audio, images or databases |

All payloads must be property-list compatible: strings, numbers, booleans, dates, data, and arrays or objects of those.

## API

```ts
import * as WatchConnectivity from "expo-watch-connectivity";
```

### Constants

#### `isSupported: boolean`

Whether WatchConnectivity is supported on this device (`WCSession.isSupported()`). It is `false` on iPads.

### Session state

| Function | Returns | Description |
| --- | --- | --- |
| `isPaired()` | `Promise<boolean>` | Whether an Apple Watch is paired with this iPhone. |
| `isWatchAppInstalled()` | `Promise<boolean>` | Whether the companion watch app is installed. |
| `isReachable()` | `Promise<boolean>` | Whether the watch app is currently reachable for live messages. |
| `getActivationState()` | `Promise<ActivationState>` | The current activation state of the session. |

```ts
enum ActivationState {
  NOT_ACTIVATED, // 0
  INACTIVE,      // 1
  ACTIVE,        // 2
}
```

The session is activated automatically when the module loads. Values read before activation completes can be stale; the listeners and hooks below are updated once activation finishes.

### Hooks

| Hook | Returns | Description |
| --- | --- | --- |
| `usePaired()` | `boolean` | Live paired state. |
| `useInstalled()` | `boolean` | Live "watch app installed" state. |
| `useReachable()` | `boolean` | Live reachability state. |

Each hook starts as `false`, reads the current value and then follows state changes.

### Messages

#### `sendMessage(message: object): Promise<boolean>`

Sends a message to the watch immediately. The watch app must be reachable; check `isReachable()` or `useReachable()` first. Delivery errors are logged natively and are not reported to JS. For data that must arrive, use `transferUserInfo`.

The watch receives the message in `session(_:didReceiveMessage:)`. No reply handler is used.

#### `transferUserInfo(userInfo: object): Promise<boolean>`

Queues a dictionary for guaranteed, in-order delivery to the watch. Resolves `false` if the payload is not property-list compatible or the session is not activated yet.

If the watch is reachable, the library first tries to deliver the payload live via `sendMessage` (this also makes it work in the simulator, where `transferUserInfo` is unsupported). If that fails, it falls back to a queued `transferUserInfo`. Your watch app should therefore handle both `didReceiveMessage` and `didReceiveUserInfo`.

#### `addMessageListener(listener: (message: object) => void): EventSubscription`

Called for every message **and** user info received from the watch.

#### `addUserInfoTransferFinishedListener(listener: (event: UserInfoTransferFinishedPayload) => void): EventSubscription`

Called when a queued user info transfer finishes. `event.error` is set if it failed.

```ts
type UserInfoTransferFinishedPayload = {
  userInfo: object;
  error?: string;
};
```

### Application context

#### `updateApplicationContext(context: object): Promise<void>`

Sends the latest state to the watch. Only the most recent context is delivered; earlier ones that have not been sent yet are replaced. Rejects if the session is not activated or the payload is invalid.

#### `getApplicationContext(): Promise<object | null>`

Returns the context **this device sent** last.

#### `getReceivedApplicationContext(): Promise<object>`

Returns the most recent context **received from the watch**.

#### `addApplicationContextListener(listener: (context: object) => void): EventSubscription`

Called when a new application context arrives from the watch.

### Files

#### `sendFile(fileUri: string, metadata?: object): Promise<void>`

Queues a local file (`file://` URI) for transfer to the watch, with an optional property-list compatible `metadata` dictionary. Rejects if the URI is invalid.

```ts
import { useAssets } from "expo-asset";

const [assets] = useAssets([require("./assets/music.mp3")]);
const uri = assets?.[0]?.localUri;
if (uri) {
  await WatchConnectivity.sendFile(uri, { id: "track-1" });
}
```

#### `getCurrentFileTransfers(): Promise<FileTransferInfo[]>`

Returns the outgoing file transfers that are still in progress.

```ts
type FileTransferInfo = {
  uri: string;
  process: number; // fraction completed, 0..1
  transferring: boolean;
  paused: boolean;
  metadata?: object;
};
```

#### `addFileTransferFinishedListener(listener: (event: FileTransferFinishedPayload) => void): EventSubscription`

Called when an outgoing file transfer finishes. `event.error` is set if it failed.

```ts
type FileTransferFinishedPayload = {
  uri: string;
  metadata?: object;
  error?: string;
};
```

#### `addFileListener(listener: (event: NewFilePayload) => void): EventSubscription`

Called when a file is received from the watch.

```ts
type NewFilePayload = {
  uri: string; // file:// URI inside Caches/watch-inbox/
  metadata?: object;
};
```

WatchConnectivity deletes received files as soon as its delegate method returns, so the library moves each file into `Caches/watch-inbox/` first. **Your app is responsible for deleting the file** once it has processed it, for example with `expo-file-system`.

### State listeners

| Function | Listener argument |
| --- | --- |
| `isPairedListener(listener)` | `isPaired: boolean` |
| `isInstalledListener(listener)` | `isInstalled: boolean` |
| `isReachableListener(listener)` | `isReachable: boolean` |
| `addActivationListener(listener)` | `activationState: ActivationState` |

Every listener function returns an `EventSubscription`. Call `.remove()` on it to unsubscribe.

### Event buffering

The app can be launched or woken in the background by WatchConnectivity before your JS code has subscribed. To avoid losing data, the native side buffers these events until the first listener is added:

- `addMessageListener` (messages and user info)
- `addFileListener`
- `addUserInfoTransferFinishedListener`

Up to 200 events per type are kept; older ones are dropped. Register these listeners early, for example in your root component, so buffered events are flushed promptly. State, application context and file transfer finished events are not buffered; use the getters to read their current values.

## Example app

The [`example/`](./example) directory contains an iOS app plus a watchOS companion app that echoes received messages back. The watch target lives in [`example/targets/watch`](./example/targets/watch) and is linked into the Xcode project by [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets).

```sh
npm install
npm run build
cd example
npm install
npx expo prebuild -p ios --clean
npx expo run:ios
```

To run on a device, set `ios.appleTeamId` in `example/app.json`. In Xcode, the watch sources can be edited under the `expo:targets/watch` folder.

## Development

```sh
npm install
npm run build     # compile TypeScript into build/
npm run lint
npm run open:ios  # open the example in Xcode
```

The JS API lives in [`src/`](./src) and the native implementation in [`ios/`](./ios).

## Contributing

Issues and pull requests are welcome at [github.com/Duell10111/expo-watch-connectivity](https://github.com/Duell10111/expo-watch-connectivity/issues).

## License

MIT © [Konstantin Späth](https://github.com/Duell10111)
