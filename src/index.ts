import type { EventSubscription } from "expo-modules-core";

import { ActivationState } from "./ExpoWatchConnectivity.types";
import type {
  ApplicationContextPayload,
  FileTransferFinishedPayload,
  FileTransferInfo,
  NewFilePayload,
  NewMessagePayload,
  UserInfoTransferFinishedPayload,
} from "./ExpoWatchConnectivity.types";
import ExpoWatchConnectivityModule from "./ExpoWatchConnectivityModule";
import { useEffect, useState } from "react";

export const isSupported = ExpoWatchConnectivityModule.isSupported;

export async function isPaired(): Promise<boolean> {
  return ExpoWatchConnectivityModule.isPaired();
}

export async function isWatchAppInstalled(): Promise<boolean> {
  return ExpoWatchConnectivityModule.isWatchAppInstalled();
}

export async function isReachable(): Promise<boolean> {
  return ExpoWatchConnectivityModule.isReachable();
}

export async function getActivationState(): Promise<ActivationState> {
  return ExpoWatchConnectivityModule.getActivationState();
}

export async function getCurrentFileTransfers(): Promise<FileTransferInfo[]> {
  return ExpoWatchConnectivityModule.getCurrentFileTransfers();
}

export async function sendMessage(message: {
  [key: string]: any;
}): Promise<boolean> {
  return ExpoWatchConnectivityModule.sendMessage(message);
}

export async function transferUserInfo(userInfo: {
  [key: string]: any;
}): Promise<boolean> {
  return ExpoWatchConnectivityModule.transferUserInfo(userInfo);
}

export async function sendFile(
  fileURL: string,
  metadata: {
    [key: string]: any;
  },
): Promise<void> {
  return ExpoWatchConnectivityModule.sendFile(fileURL, metadata);
}

export function addMessageListener(
  listener: (event: NewMessagePayload) => void,
): EventSubscription {
  return ExpoWatchConnectivityModule.addListener("newMessage", listener);
}

export function addFileListener(
  listener: (event: NewFilePayload) => void,
): EventSubscription {
  return ExpoWatchConnectivityModule.addListener("newFile", listener);
}

export function addFileTransferFinishedListener(
  listener: (event: FileTransferFinishedPayload) => void,
): EventSubscription {
  return ExpoWatchConnectivityModule.addListener(
    "finishedFileTransfer",
    listener,
  );
}

/**
 * Called when a `transferUserInfo` call finished. Failed transfers carry `error`,
 * including immediate deliveries that could not be queued as a fallback.
 */
export function addUserInfoTransferFinishedListener(
  listener: (event: UserInfoTransferFinishedPayload) => void,
): EventSubscription {
  return ExpoWatchConnectivityModule.addListener(
    "finishedUserInfoTransfer",
    listener,
  );
}

export function getApplicationContext(): Promise<ApplicationContextPayload | null> {
  return ExpoWatchConnectivityModule.getApplicationContext();
}

/**
 * Returns the most recent application context received from the watch.
 * `getApplicationContext` returns the context this device sent last.
 */
export function getReceivedApplicationContext(): Promise<ApplicationContextPayload> {
  return ExpoWatchConnectivityModule.getReceivedApplicationContext();
}

export function updateApplicationContext(value: ApplicationContextPayload): Promise<void> {
  return ExpoWatchConnectivityModule.updateApplicationContext(value);
}

export function addApplicationContextListener(
  listener: (event: ApplicationContextPayload) => void,
): EventSubscription {
  return ExpoWatchConnectivityModule.addListener(
    "applicationContext",
    listener,
  );
}

export function isInstalledListener(
  listener: (isInstalled: boolean) => void,
): EventSubscription {
  return ExpoWatchConnectivityModule.addListener(
    "installedState",
    (event) => listener(event.state),
  );
}

export function isReachableListener(
  listener: (isReachable: boolean) => void,
): EventSubscription {
  return ExpoWatchConnectivityModule.addListener(
    "reachableState",
    (event) => listener(event.state),
  );
}

export function isPairedListener(
  listener: (isPaired: boolean) => void,
): EventSubscription {
  return ExpoWatchConnectivityModule.addListener(
    "pairedState",
    (event) => listener(event.state),
  );
}

// TODO: Add error handling
export function addActivationListener(
  listener: (activationState: ActivationState) => void,
): EventSubscription {
  return ExpoWatchConnectivityModule.addListener(
    "sessionStatus",
    (event) => {
      listener(event.activationState)
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

export * from "./ExpoWatchConnectivity.types";
