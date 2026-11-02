//
//  SessionSync.swift
//  watch
//
//  Created by Konstantin Späth on 05.01.24.
//

import Foundation
import WatchConnectivity

struct SessionSyncStruct {
  static let shared = SessionSync()

  init() {
    if WCSession.isSupported() {
      //let session = WCSession.default
        //session.delegate = self
        //session.activateSession()
    }
  }
}

class SessionSync : NSObject, ObservableObject {

  var session = WCSession.default

  var applicationContext : [String: Any] = [:]

  override init() {
    super.init()
    print("SessionSync")
    if (WCSession.isSupported()) {
      session.delegate = self
      session.activate()
    }
  }

}

extension SessionSync: WCSessionDelegate {
  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    print("WCSession activationDidCompleteWith activationState:\(activationState) error:\(String(describing: error))")
  }

  func session(_ session: WCSession, didReceiveApplicationContext appContext: [String: Any]) {
    debugPrint("WCSession didReceiveApplicationContext activationState:\(appContext)")
    applicationContext = appContext
  }

  func session(_ session: WCSession, didReceiveUserInfo userInfo: [String : Any]) {
    print("WCSession didReceiveUserInfo userInfo:\(userInfo)")
  }

  func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
    print("WCSession didReceiveMessage message:\(message)")
    session.sendMessage(message, replyHandler: nil)
  }

  func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
    print("WCSession didReceiveMessage with reply handler message:\(message)")
    session.sendMessage(message, replyHandler: nil)
  }

  func session(_ session: WCSession, didReceive file: WCSessionFile) {
    // TODO: Do sth?
  }

  func session(_ session: WCSession, didFinish fileTransfer: WCSessionFileTransfer, error: (any Error)?) {
    print("WCSession didFinish FileTranfer fileURL:\(fileTransfer.file.fileURL)")

    // Update fileURL for Download URL use metadata
    // Use fileTransfer.file.metadata id to update DB and set downloaded flag
  }

}

