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
    private let eventLock = NSLock()
    private var observedEvents = Set<String>()
    private var pendingEvents: [String: [[String: Any]]] = [:]

    static let inboxDirectoryName = "watch-inbox"
    // Caps buffered events per name in case JS never subscribes to one of them.
    private static let maxPendingEventsPerName = 200

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
        SessionSyncStruct.module?.sendEvent("sessionStatus", ["active": active, "activationState": activationState.rawValue, "error": error?.localizedDescription])
        
        // Once session activated send state updates to fix issues with wrong values
        if active {
            SessionSyncStruct.module?.sendEvent("installedState", ["state": session.isWatchAppInstalled])
            SessionSyncStruct.module?.sendEvent("pairedState", ["state": session.isPaired])
            SessionSyncStruct.module?.sendEvent("reachableState", ["state": session.isReachable])
        }
    }

    func sessionDidBecomeInactive(_ session: WCSession) {
        SessionSyncStruct.module?.sendEvent("sessionStatus", ["active": false, "activationState": session.activationState.rawValue])
    }

    func sessionDidDeactivate(_ session: WCSession) {
        // Begin the activation process for the new Apple Watch.
        activateSession()

        SessionSyncStruct.module?.sendEvent("sessionStatus", ["active": false, "activationState": session.activationState.rawValue])
    }

    func sessionWatchStateDidChange(_ session: WCSession) {
        SessionSyncStruct.module?.sendEvent("installedState", ["state": session.isWatchAppInstalled])
        SessionSyncStruct.module?.sendEvent("pairedState", ["state": session.isPaired])
    }

    func sessionReachabilityDidChange(_ session: WCSession) {
        SessionSyncStruct.module?.sendEvent("reachableState", ["state": session.isReachable])
    }

    // Data updates

    // Events that carry data are buffered until JS subscribes, so nothing is lost
    // when the app is launched or woken by WatchConnectivity before JS is ready.

    func startObserving(_ eventName: String) {
        while true {
            eventLock.lock()
            let events = pendingEvents.removeValue(forKey: eventName) ?? []
            guard !events.isEmpty else {
                observedEvents.insert(eventName)
                eventLock.unlock()
                return
            }
            eventLock.unlock()

            events.forEach { payload in
                SessionSyncStruct.module?.sendEvent(eventName, payload)
            }
        }
    }

    func stopObserving(_ eventName: String) {
        eventLock.lock()
        observedEvents.remove(eventName)
        eventLock.unlock()
    }

    func stopObservingAll() {
        eventLock.lock()
        observedEvents.removeAll()
        eventLock.unlock()
    }

    private func deliver(_ eventName: String, _ payload: [String: Any]) {
        eventLock.lock()
        guard observedEvents.contains(eventName), SessionSyncStruct.module != nil else {
            var events = pendingEvents[eventName, default: []]
            events.append(payload)
            if events.count > Self.maxPendingEventsPerName {
                events.removeFirst(events.count - Self.maxPendingEventsPerName)
            }
            pendingEvents[eventName] = events
            eventLock.unlock()
            return
        }
        eventLock.unlock()

        SessionSyncStruct.module?.sendEvent(eventName, payload)
    }

    func sendUserInfo(_ userInfo: [String: Any]) -> Bool {
        guard PropertyListSerialization.propertyList(userInfo, isValidFor: .binary) else {
            print("WCSession rejected non-property-list user info: \(userInfo)")
            return false
        }
        guard session.activationState == .activated else {
            print("WCSession cannot send user info before activation")
            return false
        }

        // transferUserInfo is unsupported in the simulator. Live delivery also
        // gives the requesting watch an immediate response on physical devices.
        if session.isReachable {
            session.sendMessage(userInfo, replyHandler: nil) { [weak self] error in
                print("Immediate WCSession delivery failed, queueing user info: \(error.localizedDescription)")
                guard let self else { return }
                guard self.session.activationState == .activated else {
                    self.deliver("finishedUserInfoTransfer", [
                        "userInfo": userInfo,
                        "error": error.localizedDescription
                    ])
                    return
                }
                self.session.transferUserInfo(userInfo)
            }
        } else {
            session.transferUserInfo(userInfo)
        }
        return true
    }

    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        deliver("newMessage", message)
    }

    func session(_ session: WCSession, didReceiveUserInfo userInfo: [String : Any]) {
        deliver("newMessage", userInfo)
    }

    func session(_ session: WCSession, didFinish userInfoTransfer: WCSessionUserInfoTransfer, error: Error?) {
        if let error {
            print("WCSession user info transfer failed: \(error.localizedDescription), payload: \(userInfoTransfer.userInfo)")
        } else {
            print("WCSession user info transfer finished: \(userInfoTransfer.userInfo)")
        }
        var payload: [String: Any] = ["userInfo": userInfoTransfer.userInfo]
        if let error {
            payload["error"] = error.localizedDescription
        }
        deliver("finishedUserInfoTransfer", payload)
    }

    func session(_ session: WCSession, didReceive file: WCSessionFile) {
        // WatchConnectivity deletes the received file as soon as this delegate
        // method returns, so it has to be moved synchronously before notifying JS.
        do {
            let inboxURL = try Self.inboxDirectory()
            let destinationURL = inboxURL.appendingPathComponent("\(UUID().uuidString)-\(file.fileURL.lastPathComponent)")
            try FileManager.default.moveItem(at: file.fileURL, to: destinationURL)

            var payload: [String: Any] = ["uri": destinationURL.absoluteString]
            if let metadata = file.metadata {
                payload["metadata"] = metadata
            }
            deliver("newFile", payload)
        } catch {
            print("Failed to move received WatchConnectivity file: \(error.localizedDescription)")
        }
    }

    static func inboxDirectory() throws -> URL {
        let cachesURL = try FileManager.default.url(for: .cachesDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        let inboxURL = cachesURL.appendingPathComponent(inboxDirectoryName, isDirectory: true)
        try FileManager.default.createDirectory(at: inboxURL, withIntermediateDirectories: true)
        return inboxURL
    }

    func session(_ session: WCSession, didFinish fileTransfer: WCSessionFileTransfer, error: (any Error)?) {
        var payload: [String: Any] = ["uri": fileTransfer.file.fileURL.absoluteString]
        if let metadata = fileTransfer.file.metadata {
            payload["metadata"] = metadata
        }
        if let error {
            payload["error"] = error.localizedDescription
        }
        SessionSyncStruct.module?.sendEvent("finishedFileTransfer", payload)
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        SessionSyncStruct.module?.sendEvent("applicationContext", applicationContext)
    }
}
