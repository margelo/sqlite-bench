import { Platform } from "react-native";
import * as Device from "expo-device";
import { File, Paths } from "expo-file-system";
const started = Date.now();
const versions = {
  nitro: require("../../node_modules/react-native-nitro-sqlite/package.json").version,
  modules: require("react-native-nitro-modules/package.json").version,
  op: require("@op-engineering/op-sqlite/package.json").version,
  expo: require("expo-sqlite/package.json").version,
  rn: require("react-native/package.json").version,
};
export async function recordReview(data: Record<string, unknown>) {
  const record = { ...data, started, at: new Date().toISOString(), versions,
    platform: Platform.OS, os: Device.osVersion, model: Device.modelName,
    isDevice: Device.isDevice, dev: __DEV__, revision: process.env.EXPO_PUBLIC_REVIEW_REVISION ?? "nitro-main-45f400c-op-18.2.5-modules-0.37.1" };
  const body = JSON.stringify(record);
  const file = new File(Paths.document, `review-${started}-${data.kind}-${data.round ?? Date.now()}-${data.library ?? "all"}-${data.test ?? "summary"}.json`);
  file.write(body);
  try { await fetch("http://127.0.0.1:18766", { method: "POST", headers: { "Content-Type": "application/json" }, body }); }
  catch (error) { console.warn("Review export failed", String(error)); }
}
