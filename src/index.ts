import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to ExpoWatchConnectivity.web.ts
// and on native platforms to ExpoWatchConnectivity.ts
import ExpoWatchConnectivityModule from './ExpoWatchConnectivityModule';
import ExpoWatchConnectivityView from './ExpoWatchConnectivityView';
import { ChangeEventPayload, ExpoWatchConnectivityViewProps } from './ExpoWatchConnectivity.types';

// Get the native constant value.
export const PI = ExpoWatchConnectivityModule.PI;

export function hello(): string {
  return ExpoWatchConnectivityModule.hello();
}

export async function setValueAsync(value: string) {
  return await ExpoWatchConnectivityModule.setValueAsync(value);
}

const emitter = new EventEmitter(ExpoWatchConnectivityModule ?? NativeModulesProxy.ExpoWatchConnectivity);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { ExpoWatchConnectivityView, ExpoWatchConnectivityViewProps, ChangeEventPayload };
