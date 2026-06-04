import { Alert } from "react-native";
import { rollbar } from "../rollbar.ts";
import { sanitizeErrorForRollbar } from "../utils/utils.ts";
import { DatabaseProvider } from "./dbProvider.ts";

export const handleConnectionError = (db: DatabaseProvider, error: Error) => {
  rollbar.error("Could not connect to local settings database: " + error.toString(), sanitizeErrorForRollbar(error));
  if ((error.message as string | undefined)?.match(/Provided schema version \d+ is less than last set version/g)) {
    Alert.alert("Outdated app", `This app version doesn't work with the newest ${db.label?.toLowerCase()} database version.\n\nTo solve this issue, you must install the newest version of the app.\n\nElse, you can reset the database, but you will have to download all your song bundles again. Do you want to reset the database?`, [
      {
        text: "Yes, reset",
        style: "destructive",
        onPress: () => promptResetDatabase(db),
      },
      {
        text: "No",
        onPress: () => Alert.alert("Please update your app"),
        isPreferred: true,
      },
    ])
  } else {
    Alert.alert(`Could not connect to local ${db.label?.toLowerCase()} database: ` + error);
  }
}

const promptResetDatabase = (db: DatabaseProvider) => {
  Alert.alert("Outdated app", `Are you sure you want to reset the app's ${db.label?.toLowerCase()} database?`, [
    {
      text: "Yes, reset",
      style: "destructive",
      onPress: () => resetDatabase(db),
    },
    {
      text: "No",
      onPress: () => Alert.alert("Please update your app"),
      isPreferred: true,
    },
  ],)
}

const resetDatabase = (db: DatabaseProvider) => {
  db.deleteDb();
  Alert.alert("Done", "The database has been reset. You must close and restart the app before you can continue.")
}