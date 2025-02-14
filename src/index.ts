import {
  NativeModulesProxy,
  EventEmitter,
  Subscription,
} from "expo-modules-core";

// Import the native module. On web, it will be resolved to ExpoWatchConnectivity.web.ts
// and on native platforms to ExpoWatchConnectivity.ts
import {
  ActivationState,
  ApplicationContextPayload,
  BooleanStatePayload,
  FileTransferFinishedPayload,
  FileTransferInfo,
  NewFilePayload,
  NewMessagePayload, SessionStatePayload
} from "./ExpoWatchConnectivity.types";
import ExpoWatchConnectivityModule from "./ExpoWatchConnectivityModule";
import { useEffect, useState } from "react";

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

export async function getActivationState(): Promise<ActivationState | undefined> {
  const activationState = ExpoWatchConnectivityModule.getActivationState() as number;
  return parseActivationState(activationState);
}

function parseActivationState(activationState: number) {
  switch (activationState) {
    case 0:
      return "notActivated";
    case 1:
      return "inactive";
    case 2:
      return "activated";
  }
  return undefined
}

export async function getCurrentFileTransfers(): Promise<FileTransferInfo[]> {
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

export function isInstalledListener(
  listener: (isInstalled: boolean) => void,
): Subscription {
  return emitter.addListener<BooleanStatePayload>(
    "installedState",
    (event) => listener(event.state),
  );
}

export function isReachableListener(
  listener: (isReachable: boolean) => void,
): Subscription {
  return emitter.addListener<BooleanStatePayload>(
    "reachableState",
    (event) => listener(event.state),
  );
}

export function isPairedListener(
  listener: (isPaired: boolean) => void,
): Subscription {
  return emitter.addListener<BooleanStatePayload>(
    "pairedState",
    (event) => listener(event.state),
  );
}

// TODO: Add error handling
export function addActivationListener(
  listener: (activationState: ActivationState) => void,
): Subscription {
  return emitter.addListener<SessionStatePayload>(
    "sessionStatus",
    (event) => {
      const parsedState = parseActivationState(event.activationState)
      if (parsedState) {
        listener(parsedState);
      }
    },
  );
}

// Hooks

export function useInstalled() {
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    isWatchAppInstalled().then((state) => setInstalled(state)).catch(console.warn);

    const sub = isInstalledListener((installedState) => {
      setInstalled(installedState);
    })
    return () => sub.remove()
  }, []);

  return installed;
}

export function useReachable() {
  const [reachable, setReachable] = useState(false);

  useEffect(() => {
    isReachable().then((state) => setReachable(state)).catch(console.warn);

    const sub = isReachableListener((reachableState) => {
      setReachable(reachableState);
    })
    return () => sub.remove()
  }, []);

  return reachable;
}

export function usePaired() {
  const [paired, setPaired] = useState(false);

  useEffect(() => {
    isPaired().then((state) => setPaired(state)).catch(console.warn);

    const sub = isPairedListener((pairedState) => {
      setPaired(pairedState);
    })
    return () => sub.remove()
  }, []);

  return paired;
}

// Types

export {
  ActivationState,
  NewFilePayload,
  FileTransferFinishedPayload,
  FileTransferInfo,
  NewMessagePayload,
  ApplicationContextPayload,
};
