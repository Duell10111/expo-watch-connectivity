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
    var process: Int64 = 0
}
