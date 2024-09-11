import { DatabaseProvider } from "../dbProvider";
import RNFS from "react-native-fs";
import Db from "../db";
import { rollbar } from "../../rollbar";
import { sanitizeErrorForRollbar } from "../../utils";
import { hymnbookApiEndpoint } from "../../api";
import { Security } from "../../security";

export const uploadDatabases = async () => {
  await uploadDatabase(Db.songs)
  await uploadDatabase(Db.documents)
  await uploadDatabase(Db.settings)
}

const readDatabase = async (db: DatabaseProvider): Promise<string | null> => {
  try {
    return await RNFS.readFile(Db.documents.realm().path, 'base64');
  } catch (error) {
    rollbar.error("Failed to read database", {
      path: db.realm().path,
      ...sanitizeErrorForRollbar(error),
    })
  }
  return null
};

export const uploadDatabase = async (db: DatabaseProvider) => {
  const rawDb = await readDatabase(db);
  if (rawDb == null) return;

  const data = {
    path: db.realm().path,
    schemaVersion: db.realm().schemaVersion,
    raw: rawDb,
    user: Security.getDeviceId(),
  }

  try {
    await fetch(`${hymnbookApiEndpoint}/databaselogs`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
  } catch (error) {
    rollbar.error("Failed to upload database dump", {
      path: db.realm().path,
      ...sanitizeErrorForRollbar(error),
    })
  }
}