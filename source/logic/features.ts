import { Platform } from "react-native";
import { getBuildNumber } from "react-native-device-info/src";
import { getVersion } from "react-native-device-info";
import { Security } from "./security";
import Settings from "../settings";
import config from "../config";
import Db from "./db/db";
import { api } from "./api";
import { parseHymnbookResponse } from "./apiUtils";
import { rollbar } from "./rollbar";

export namespace Features {
  export interface Props {
    loaded: boolean;
    goldenEgg: boolean;
    enableGooglePay: boolean;
    enableApplePay: boolean;
    allowLogging: boolean;
  }

  interface JsonProps {
    golden_egg: boolean;
    enableGooglePay: boolean;
    enableApplePay: boolean;
    allowLogging: boolean;
  }

  export const fetch = (maxTries: number = config.featuresWaitForDatabaseMaxTries): Promise<Props> => {
    if (!Db.settings.isConnected() && maxTries > 0) {
      return new Promise((resolve => setTimeout(() =>
            resolve(fetch(maxTries - 1)),
          (config.featuresWaitForDatabaseMaxTries - Math.max(0, maxTries)) * 100 + 100) // Increase timeout for each retry
      ));
    }

    if (maxTries <= 0) {
      rollbar.warning("Max tries elapsed for fetching features", {
        dbSongsConnected: Db.songs.isConnected(),
        dbDocumentsConnected: Db.documents.isConnected(),
        dbSettingsConnected: Db.settings.isConnected(),
        featuresWaitForDatabaseMaxTries: config.featuresWaitForDatabaseMaxTries,
        maxTries: maxTries
      });
    }

    return api.features(
      getVersion(),
      +getBuildNumber(),
      Security.getDeviceId(),
      Platform.OS,
      Settings.appOpenedTimes
    )
      .then(r => parseHymnbookResponse<JsonProps>(r))
      .then(features => {
        return {
          loaded: true,
          goldenEgg: features.golden_egg,
          enableGooglePay: features.enableGooglePay,
          enableApplePay: features.enableApplePay,
          allowLogging: features.allowLogging,
        };
      });
  };
}
