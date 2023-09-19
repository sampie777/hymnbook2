import { rollbar } from "./rollbar";
import { getUniqueId } from "react-native-device-info";
import { stringMd5 } from "react-native-quick-md5";

export namespace Security {
  let hashedDeviceId: string = "";

  const hash = (value: string): string => stringMd5(value);

  export const init = (): Promise<void> =>
    getUniqueId()
      .then(value => {
          hashedDeviceId = hash(value);
          console.debug("deviceId", hashedDeviceId);
        }
      )
      .catch(e => {
        rollbar.error("Could not get unique ID from device", { error: e });
        throw e;
      });

  export const getDeviceId = () => hashedDeviceId;
}
