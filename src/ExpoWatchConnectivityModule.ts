import { NativeModule, requireNativeModule } from "expo";

import type {
  ApplicationContextPayload,
  ExpoWatchConnectivityEvents,
  FileTransferInfo,
  TransferMetadata,
} from "./ExpoWatchConnectivity.types";

declare class ExpoWatchConnectivityModule extends NativeModule<ExpoWatchConnectivityEvents> {
  isSupported: boolean;
  isPaired(): Promise<boolean>;
  isWatchAppInstalled(): Promise<boolean>;
  isReachable(): Promise<boolean>;
  getActivationState(): Promise<number>;
  sendMessage(message: { [key: string]: any }): Promise<boolean>;
  transferUserInfo(userInfo: { [key: string]: any }): Promise<boolean>;
  getCurrentFileTransfers(): Promise<FileTransferInfo[]>;
  sendFile(url: string, metadata?: TransferMetadata): Promise<void>;
  getApplicationContext(): Promise<ApplicationContextPayload | null>;
  getReceivedApplicationContext(): Promise<ApplicationContextPayload>;
  updateApplicationContext(context: ApplicationContextPayload): Promise<void>;
}

// It loads the native module object from the JSI.
export default requireNativeModule<ExpoWatchConnectivityModule>(
  "ExpoWatchConnectivity",
);
