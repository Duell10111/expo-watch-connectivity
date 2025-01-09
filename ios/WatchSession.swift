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

  init() {
    if WCSession.isSupported() {
      //let session = WCSession.default
        //session.delegate = self
        //session.activateSession()
    }
  }
}

class WatchSession: NSObject, WCSessionDelegate {
    var session = WCSession.default

    var applicationContext : [String: Any] = [:]

    override init() {
      super.init()
      print("SessionSync")
      if (WCSession.isSupported()) {
        session.delegate = self
        session.activate()
      } else {
          print("Session not supported")
      }
    }
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: (any Error)?) {
        SessionSyncStruct.module?.sendEvent("sessionStatus", ["active": true])
    }
    
    func sessionDidBecomeInactive(_ session: WCSession) {
        SessionSyncStruct.module?.sendEvent("sessionStatus", ["inactive": false])
    }
    
    func sessionDidDeactivate(_ session: WCSession) {
        SessionSyncStruct.module?.sendEvent("sessionStatus", ["active": false])
    }
    
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
}
