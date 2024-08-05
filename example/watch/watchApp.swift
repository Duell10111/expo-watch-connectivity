import SwiftUI
import SwiftData

struct ContentView: View {
    var body: some View {
      Text("TEST")
    }
}

@main
struct watchApp: App {
    @Environment(\.scenePhase) var scenePhase
    let session = SessionSyncStruct.shared
    var body: some Scene {
        WindowGroup {
          ContentView()
        }
    }
}
