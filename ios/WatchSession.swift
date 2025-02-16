//
//  WatchSession.swift
//  ExpoWatchConnectivity
//
//  Created by Konstantin Späth on 12.06.24.
//

import Foundation
import WatchConnectivity

struct SessionSyncStruct {
  static let shared = WatchSession()

  static var module : ExpoWatchConnectivityModule? = nil
}

class WatchSession: NSObject, WCSessionDelegate {
    var session = WCSession.default

    var applicationContext : [String: Any] = [:]

    override init() {
        super.init()
        activateSession()
    }

    private func activateSession() {
        if (WCSession.isSupported()) {
            session = WCSession.default
            session.delegate = self
            session.activate()
        } else {
            print("WCSession not supported")
        }
    }

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: (any Error)?) {
        let active = activationState == .activated
        SessionSyncStruct.module?.sendEvent("sessionStatus", ["active": active, "error": error?.localizedDescription])
        
        // Once session activated send state updates to fix issues with wrong values
        if active {
            SessionSyncStruct.module?.sendEvent("installedState", ["state": session.isWatchAppInstalled])
            SessionSyncStruct.module?.sendEvent("pairedState", ["state": session.isPaired])
            SessionSyncStruct.module?.sendEvent("reachableState", ["state": session.isReachable])
        }
    }

    func sessionDidBecomeInactive(_ session: WCSession) {
        SessionSyncStruct.module?.sendEvent("sessionStatus", ["active": false])
    }

    func sessionDidDeactivate(_ session: WCSession) {
        // Begin the activation process for the new Apple Watch.
        activateSession()

        SessionSyncStruct.module?.sendEvent("sessionStatus", ["active": false])
    }

    func sessionWatchStateDidChange(_ session: WCSession) {
        SessionSyncStruct.module?.sendEvent("installedState", ["state": session.isWatchAppInstalled])
        SessionSyncStruct.module?.sendEvent("pairedState", ["state": session.isPaired])
    }

    func sessionReachabilityDidChange(_ session: WCSession) {
        SessionSyncStruct.module?.sendEvent("reachableState", ["state": session.isReachable])
    }

    // Data updates

    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        SessionSyncStruct.module?.sendEvent("newMessage", message)
    }

    func session(_ session: WCSession, didReceive file: WCSessionFile) {
        SessionSyncStruct.module?.sendEvent("newFile", [
            "uri": file.fileURL,
            "metadata": file.metadata
        ])
    }

    func session(_ session: WCSession, didFinish fileTransfer: WCSessionFileTransfer, error: (any Error)?) {
        SessionSyncStruct.module?.sendEvent("finishedFileTransfer", [
            "uri": fileTransfer.file.fileURL,
            "metadata": fileTransfer.file.metadata,
            "error": error?.localizedDescription
        ])
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        SessionSyncStruct.module?.sendEvent("applicationContext", applicationContext)
    }
}
