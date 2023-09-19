import Config from "react-native-config";
import { RSA } from "react-native-rsa-native";
import { rollbar } from "./rollbar";
import { getUniqueId } from "react-native-device-info";
import { stringMd5 } from "react-native-quick-md5";

export class SecurityError extends Error {
  name = "SecurityError";
}

export namespace Security {
  const publicKey = Config.SECURITY_PUBLIC_KEY;
  let deviceId: string = "";
  let encryptedDeviceId: string = "";

  const encrypt = (value: string): Promise<string> => {
    if (!publicKey) throw new SecurityError("Undefined public key");
    return RSA.encrypt(value, publicKey)
      .then(value => value.replace(/\n/gi, ""));
  };

  const hash = (value: string): string => stringMd5(value);

  export const init = (): Promise<void> =>
    getUniqueId()
      .then(value =>
        encrypt(hash(value))
          .catch(e => {
            rollbar.error("Failed to encrypt value with RSA", {
              error: e,
              value: value
            });
            return value; // on error, just use the plain device ID...
          })
          .then(encrypted => {
            console.debug("deviceId", value);
            console.debug("encryptedDeviceId", encrypted);
            deviceId = value;
            encryptedDeviceId = encrypted;
          })
      )
      .catch(e => {
        rollbar.error("Could not get unique ID from device", { error: e });
        throw e;
      });

  export const getDeviceId = () => deviceId;
  export const getEncryptedDeviceId = () => encryptedDeviceId;
}
