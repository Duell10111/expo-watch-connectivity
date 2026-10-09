export type NewMessagePayload = { [key: string]: any };

export type TransferMetadata = { [key: string]: any };

export type NewFilePayload = {
  /**
   * `file://` URI of the received file. The native side moves it into
   * `Caches/watch-inbox/` before emitting, so it stays valid after the event.
   * The receiver is responsible for deleting it once processed.
   */
  uri: string;
  metadata?: TransferMetadata;
};

export type FileTransferFinishedPayload = {
  uri: string;
  metadata?: TransferMetadata;
  error?: string;
};

export type UserInfoTransferFinishedPayload = {
  userInfo: { [key: string]: any };
  /** Set if the transfer failed. */
  error?: string;
};

export type FileTransferInfo = {
  uri: string;
  /** Fraction completed between 0 and 1. */
  process: number;
  transferring: boolean;
  paused: boolean;
  metadata?: TransferMetadata;
};

export type ApplicationContextPayload = { [key: string]: any };

export type SessionStatePayload = {
  active: boolean;
  activationState: number;
};

export type BooleanStatePayload = {
  state: boolean;
}

export enum ActivationState {
  /**
   * If session is not activated.
   */
  NOT_ACTIVATED,
  /**
   * If session is not active and going to not activated.
   */
  INACTIVE,
  /**
   * If session is active.
   */
  ACTIVE,
}
