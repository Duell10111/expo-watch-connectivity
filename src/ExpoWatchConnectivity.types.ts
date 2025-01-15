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
