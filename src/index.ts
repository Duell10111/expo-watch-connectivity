import {
  NativeModulesProxy,
  EventEmitter,
  Subscription,
} from "expo-modules-core";

// Import the native module. On web, it will be resolved to ExpoWatchConnectivity.web.ts
// and on native platforms to ExpoWatchConnectivity.ts
import {
  ApplicationContextPayload,
  FileTransferFinishedPayload,
  FileTransferInfo,
  NewFilePayload,
  NewMessagePayload
} from "./ExpoWatchConnectivity.types";
import ExpoWatchConnectivityModule from "./ExpoWatchConnectivityModule";

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

export function addMessageListener(
  listener: (event: NewMessagePayload) => void,
): Subscription {
  return emitter.addListener<NewMessagePayload>("newMessage", listener);
}

export function addFileListener(
  listener: (event: NewFilePayload) => void,
): Subscription {
  return emitter.addListener<NewFilePayload>("newFile", listener);
}

export function addFileTransferFinishedListener(
  listener: (event: FileTransferFinishedPayload) => void,
): Subscription {
  return emitter.addListener<FileTransferFinishedPayload>(
    "finishedFileTransfer",
    listener,
  );
}

export function getApplicationContext(): Promise<ApplicationContextPayload | null> {
  return ExpoWatchConnectivityModule.getApplicationContext();
}

export function updateApplicationContext(value: ApplicationContextPayload): Promise<void> {
  return ExpoWatchConnectivityModule.updateApplicationContext(value);
}

export function addApplicationContextListener(
  listener: (event: ApplicationContextPayload) => void,
): Subscription {
  return emitter.addListener<ApplicationContextPayload>(
    "applicationContext",
    listener,
  );
}

export {
  NewFilePayload,
  FileTransferFinishedPayload,
  FileTransferInfo,
  NewMessagePayload,
  ApplicationContextPayload,
};
