import {
  NativeModulesProxy,
  EventEmitter,
  Subscription,
} from "expo-modules-core";

// Import the native module. On web, it will be resolved to ExpoWatchConnectivity.web.ts
// and on native platforms to ExpoWatchConnectivity.ts
import {
  ChangeEventPayload,
  FileTransferInfo,
  NewMessagePayload,
} from "./ExpoWatchConnectivity.types";
import ExpoWatchConnectivityModule from "./ExpoWatchConnectivityModule";

// Get the native constant value.
export const PI = ExpoWatchConnectivityModule.PI;

export function hello(): string {
  return ExpoWatchConnectivityModule.hello();
}

export async function setValueAsync(value: string) {
  return await ExpoWatchConnectivityModule.setValueAsync(value);
}

export async function isPaired(): Promise<boolean> {
  return ExpoWatchConnectivityModule.isPaired();
}

export async function isWatchAppInstalled(): Promise<boolean> {
  return ExpoWatchConnectivityModule.isWatchAppInstalled();
}

export async function isReachable(): Promise<boolean> {
  return ExpoWatchConnectivityModule.isReachable();
}

export async function getCurrentFileTransfers(): Promise<FileTransferInfo> {
  return ExpoWatchConnectivityModule.getCurrentFileTransfers();
}

export async function sendMessage(message: {
  [key: string]: any;
}): Promise<boolean> {
  return ExpoWatchConnectivityModule.sendMessage(message);
}

export async function sendFile(
  fileURL: string,
  metadata: {
    [key: string]: any;
  },
): Promise<void> {
  return ExpoWatchConnectivityModule.sendFile(fileURL, metadata);
}

const emitter = new EventEmitter(
  ExpoWatchConnectivityModule ?? NativeModulesProxy.ExpoWatchConnectivity,
);

export function addChangeListener(
  listener: (event: ChangeEventPayload) => void,
): Subscription {
  return emitter.addListener<ChangeEventPayload>("onChange", listener);
}

export function addMessageListener(
  listener: (event: NewMessagePayload) => void,
): Subscription {
  return emitter.addListener<NewMessagePayload>("newMessage", listener);
}

export { ChangeEventPayload };
