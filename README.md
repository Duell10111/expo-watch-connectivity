# expo-watch-connectivity

Expo Module based Watch Connectivity Library

# API documentation

- [Documentation for the main branch](https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/watch-connectivity.md)
- [Documentation for the latest stable release](https://docs.expo.dev/versions/latest/sdk/watch-connectivity/)

# Installation in managed Expo projects

For [managed](https://docs.expo.dev/archive/managed-vs-bare/) Expo projects, please follow the installation instructions in the [API documentation for the latest stable release](#api-documentation). If you follow the link and there is no documentation available then this library is not yet usable within managed projects &mdash; it is likely to be included in an upcoming Expo SDK release.

# Installation in bare React Native projects

For bare React Native projects, you must ensure that you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

### Add the package to your npm dependencies

```
npm install expo-watch-connectivity
```

### Configure for iOS

Run `npx pod-install` after installing the npm package.


### Configure for Android



# Example app

The example app in `example/` contains a watchOS companion app that echoes received messages. The watch target lives in `example/targets/watch` and is linked into the Xcode project by [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets).

```
cd example
npm install
npx expo prebuild -p ios --clean
npx expo run:ios
```

To run on a device, set `ios.appleTeamId` in `example/app.json`. In Xcode, the watch sources are editable under the `expo:targets/watch` folder.

# Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide]( https://github.com/expo/expo#contributing).
