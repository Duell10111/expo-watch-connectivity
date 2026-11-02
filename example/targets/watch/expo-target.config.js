/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "watch",
  name: "watch",
  displayName: config.name,
  bundleIdentifier: ".watch",
  deploymentTarget: "10.0",
  frameworks: ["SwiftUI"],
});
