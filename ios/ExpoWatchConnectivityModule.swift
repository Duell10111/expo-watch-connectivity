import ExpoModulesCore

public class ExpoWatchConnectivityModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ExpoWatchConnectivity')` in JavaScript.
    Name("ExpoWatchConnectivity")

    // Defines event names that the module can send to JavaScript.
    Events("onChange", "sessionStatus", "newMessage", "newFile", "finishedFileTransfer")

      AsyncFunction("isPaired") {
          return SessionSyncStruct.shared.session.isPaired
      }

      AsyncFunction("isWatchAppInstalled") {
          return SessionSyncStruct.shared.session.isWatchAppInstalled
      }

      AsyncFunction("isReachable") {
          return SessionSyncStruct.shared.session.isReachable
      }

      AsyncFunction("sendMessage") { (message: [String: Any]) in
          SessionSyncStruct.shared.session.sendMessage(message, replyHandler: nil)
      }

      AsyncFunction("getCurrentFileTransfers") {
          return SessionSyncStruct.shared.session.outstandingFileTransfers.map { transfer in
              return FileTransferInfo(uri: transfer.file.fileURL.absoluteString, process: transfer.progress.fractionCompleted, transferring: transfer.isTransferring, paused: transfer.progress.isPaused)
          }
      }

      AsyncFunction("sendFile") { (url: String, metadata: [String: Any]?, promise: Promise) in
          if let fileURL = URL(string: url) {
              SessionSyncStruct.shared.session.transferFile(fileURL, metadata: metadata)
              promise.resolve()
          } else {
              promise.reject("111", "Init File Transfer failed")
          }
      }

    OnCreate {
        SessionSyncStruct.module = self
    }

    OnDestroy {
        SessionSyncStruct.module = nil
    }
  }
}
