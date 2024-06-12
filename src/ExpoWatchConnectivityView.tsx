import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { ExpoWatchConnectivityViewProps } from './ExpoWatchConnectivity.types';

const NativeView: React.ComponentType<ExpoWatchConnectivityViewProps> =
  requireNativeViewManager('ExpoWatchConnectivity');

export default function ExpoWatchConnectivityView(props: ExpoWatchConnectivityViewProps) {
  return <NativeView {...props} />;
}
