const { withAndroidManifest, AndroidConfig } = require("@expo/config-plugins");
module.exports = (config) => withAndroidManifest(config, (mod) => {
  AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults).$["android:usesCleartextTraffic"] = "true";
  return mod;
});
