//
//  Types.swift
//  ExpoWatchConnectivity
//
//  Created by Konstantin Späth on 12.06.24.
//

import Foundation
import ExpoModulesCore

struct FileTransferInfo: Record {
    @Field
    var uri: String = ""
    @Field
    var process: Double = 0.0
    @Field
    var transferring: Bool = false
    @Field
    var paused: Bool = false
}
