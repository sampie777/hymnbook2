import Settings from "../settings";
import { SongAutoUpdater } from "./songs/updater/songAutoUpdater";
import { rollbar } from "./rollbar";
import { delayed, isIOS, sanitizeErrorForRollbar } from "./utils";
import { DocumentAutoUpdater } from "./documents/updater/documentAutoUpdater";
import { UpdaterContextProps } from "../gui/components/providers/UpdaterContextProvider";
import { addEventListener } from "@react-native-community/netinfo";
import * as Types from "@react-native-community/netinfo/src/internal/types";

export namespace AutoUpdater {

  export const run = async (context: UpdaterContextProps): Promise<any> => {
    const { removeEventListener, isSynced, isOnWifi } = useNetworkListener();
    const mayUseNetwork = (): boolean => !Settings.autoUpdateOverWifiOnly || isOnWifi()

    await waitForNetworkStateSync(isSynced);

    if (!mayUseNetwork()) return Promise.resolve();
    if (!isCheckIntervalPassed()) return Promise.resolve();

    return Promise.all([
      SongAutoUpdater.run(context.addSongBundleUpdating, context.removeSongBundleUpdating, mayUseNetwork)
        .catch(error => rollbar.error("Failed to run auto updater for songs", sanitizeErrorForRollbar(error))),

      DocumentAutoUpdater.run(context.addDocumentGroupUpdating, context.removeDocumentGroupUpdating, mayUseNetwork)
        .catch(error => rollbar.error("Failed to run auto updater for documents", sanitizeErrorForRollbar(error))),
    ])
      .finally(removeEventListener)
  }

  const useNetworkListener = (): {
    removeEventListener: Types.NetInfoSubscription,
    isSynced: () => boolean,  // Means: has received an initial network state
    isOnWifi: () => boolean,
  } => {
    let isSynced = false;
    let isOnWifi = false;

    const unsubscribe = addEventListener(state => {
      isSynced = true;
      isOnWifi = state.type == 'wifi' && state.isConnected;
    })

    return {
      removeEventListener: unsubscribe,
      isSynced: () => isSynced,
      isOnWifi: () => isOnWifi,
    };
  }

  const waitForNetworkStateSync = async (isSynced: () => boolean, maxTimeout = 10000, pollInterval = 100): Promise<any> => {
    if (isSynced()) return Promise.resolve();
    if (maxTimeout <= 0) return Promise.reject("Waiting for network sync timed out");

    return await delayed(
      () => waitForNetworkStateSync(isSynced, maxTimeout - pollInterval, pollInterval),
      pollInterval
    );
  };

  const isCheckIntervalPassed = (): boolean => {
    if (Settings.autoUpdateDatabasesCheckIntervalInDays <= 0) return false;

    const intervalEndTimestamp = Settings.autoUpdateDatabasesLastCheckTimestamp + Settings.autoUpdateDatabasesCheckIntervalInDays * 24 * 3600 * 1000;
    const now = new Date();
    if (now.getTime() < intervalEndTimestamp) {
      console.debug("Next update check:", new Date(intervalEndTimestamp))
      return false;
    }

    // Create check date at start of the day, so every check can be done during any time of the day and is not dependent on the hour of the last check
    const lastCheckDay = new Date();
    lastCheckDay.setHours(0, 0, 0, 0);

    Settings.autoUpdateDatabasesLastCheckTimestamp = lastCheckDay.getTime();
    Settings.store();
    return true;
  }
}