import { DatabaseProvider } from "../dbProvider";
import Db from "../db";
import { rollbar } from "../../rollbar";
import { isAndroid, sanitizeErrorForRollbar } from "../../utils";
import { hymnbookApiEndpoint } from "../../api";
import { Security } from "../../security";
import Settings from "../../../settings";

export const uploadDatabases = async () => {
  if (!Settings.shareUsageData) return;

  await uploadDatabase(Db.songs)
  await uploadDatabase(Db.documents)
  await uploadDatabase(Db.settings)
}

export const uploadDatabase = async (db: DatabaseProvider) => {
  const filename = db.realm().path.split("/").pop();

  const data = new FormData();
  data.append("file", {
    uri: (isAndroid ? "file://" : "") + db.realm().path,
    type: 'application/octet-stream',
    name: filename,
  });
  data.append("path", db.realm().path);
  data.append("schemaVersion", db.realm().schemaVersion);
  data.append("user", Security.getDeviceId());

  try {
    await fetch(`${hymnbookApiEndpoint}/databaselogs/files`, {
      method: "POST",
      credentials: "include",
      body: data
    })
  } catch (error) {
    rollbar.error("Failed to upload database dump", {
      path: db.realm().path,
      ...sanitizeErrorForRollbar(error),
    })
  }
}