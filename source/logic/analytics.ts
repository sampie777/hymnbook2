import { rollbar } from "./rollbar";
import Settings from "../settings";

export namespace Analytics {
  export const uploadSettings = () => {
    if (!Settings.shareUsageData) return;
    rollbar.debug("Settings dump.", { settings: Settings });
  };
}
