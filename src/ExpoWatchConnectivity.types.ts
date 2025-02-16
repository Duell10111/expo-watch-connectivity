export type NewMessagePayload = { [key: string]: any };

export type NewFilePayload = {
  uri: string;
  metadata?: Record<string, any>;
};

export type FileTransferFinishedPayload = {
  uri: string;
  metadata?: Record<string, any>;
  error?: string;
}

export type FileTransferInfo = {
  uri: string;
  process: number;
  transferring: boolean;
  paused: boolean;
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
